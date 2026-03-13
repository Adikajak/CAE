package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Service for managing team memberships.
 */
@Service
public class TeamMembershipService {

  private final NotificationService notificationService;
  private final UserRepository userRepository;
  private final TeamMembershipRepository teamMembershipRepository;
  private final TeamRepository teamRepository;
  private final NotificationRepository notificationRepository;

  /**
   * Constructor for dependency injection.
   *
   * @param userRepository the user repository
   * @param teamMembershipRepository the team membership repository
   */
  public TeamMembershipService(
      UserRepository userRepository,
      TeamMembershipRepository teamMembershipRepository,
      TeamRepository teamRepository,
      NotificationService notificationService
      NotificationService notificationService,
      NotificationRepository notificationRepository
  ) {
    this.userRepository = userRepository;
    this.teamMembershipRepository = teamMembershipRepository;
    this.teamRepository = teamRepository;
    this.notificationService = notificationService;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Adds a user to a team if the tag is unique within that team.
   *
   * @param user the user to add
   * @param team the team
   * @return the TeamMembership created
   * @throws IllegalStateException if the tag is already used by another user in the team
   */
  @Transactional
  public TeamMembership addUserToTeam(User user, Team team) {
    boolean tagTaken = userRepository.existsByTeamAndTag(team, user.getTag());
    if (tagTaken) {
      throw new IllegalStateException("This tag is already used by another user in this team");
    }

    TeamMembership membership = new TeamMembership();
    membership.setMember(user);
    membership.setTeam(team);
    membership.setStatus(MembershipStatus.PENDING);

    userRepository.save(user);
    TeamMembership save = teamMembershipRepository.save(membership);
    NotificationDto dto = new NotificationDto();
    dto.setUserId(team.getManager().getId());
    dto.setObject("Nouvelle demande d'adhésion");
    dto.setMessage(user.getTag() + " souhaite rejoindre l'équipe " + team.getName());
    dto.setType(NotificationType.TEAM_INVITATION);
    dto.setMembershipId(save.getId());
    notificationService.createNotification(dto);

    if (team.getSecondManager() != null) {
      dto.setUserId(team.getSecondManager().getId());
      notificationService.createNotification(dto);
    }

    return save;
  }

  /**
   * Get all memberships of a team.
   *
   * @param team the team
   * @return list of memberships
   */
  public List<TeamMembership> getAllMembers(Team team) {
    return teamMembershipRepository.findByTeam(team);
  }

  /**
   * Get all pending membership requests of a team.
   *
   * @param team the team
   * @return list of pending memberships
   */
  public List<TeamMembership> getPendingRequests(Team team) {
    return teamMembershipRepository.findByTeamAndStatus(team, MembershipStatus.PENDING);
  }

  /**
   * Validate a membership request.
   *
   * @param membership the membership to accept
   * @return the updated membership
   */
  @Transactional
  public TeamMembership acceptMembership(TeamMembership membership) {
    membership.setStatus(MembershipStatus.ACCEPTED);
    User member = membership.getMember();
    member.setTeam(membership.getTeam());
    userRepository.save(member);
    final TeamMembership save = teamMembershipRepository.save(membership);
    markRelatedNotificationsAsRead(membership.getId());
    sendNotificationToMember(membership.getMember().getId(),"Demande acceptée","Votre demande pour rejoinder l'équipe "
        + membership.getTeam().getName() + "a été acceptée!");

    return save;
  }

  /**
   * Refuse a membership request.
   *
   * @param membership the membership to refuse
   * @param reason the reason for refusal
   * @return the updated membership
   */
  @Transactional
  public TeamMembership refuseMembership(TeamMembership membership, String reason) {
    membership.setStatus(MembershipStatus.REFUSED);
    membership.setRejectionReason(reason);
    final TeamMembership save = teamMembershipRepository.save(membership);
    markRelatedNotificationsAsRead(membership.getId());

    NotificationDto dto = new NotificationDto();
    dto.setUserId(membership.getMember().getId());
    dto.setObject("Demande refusée");
    dto.setMessage("Votre demande pour rejoindre l'équipe "
        + membership.getTeam().getName() + " a été refusée. Raison : " + reason);
    dto.setType(NotificationType.GENERAL);
    notificationService.createNotification(dto);

    return save;
  }

  /**
   * Find a membership by user and team.
   *
   * @param team the team
   * @param user the user
   * @return optional membership
   */
  public Optional<TeamMembership> getMembership(Team team, User user) {
    return teamMembershipRepository.findByTeamAndMember(team, user);
  }

  /**
   * Find the current membership of a user.
   *
   * @param user the user
   * @return optional membership
   */
  public Optional<TeamMembership> getMembership(User user) {
    return teamMembershipRepository.findByMember(user);
  }

  /**
   * Find a membership by its ID.
   *
   * @param membershipId the membership ID
   * @return optional containing the membership if found
   */
  public Optional<TeamMembership> getMembershipById(Long membershipId) {
    return teamMembershipRepository.findById(membershipId);
  }

  /**
   * Exclude a member from a team.
   *
   * @param currentUser the authenticated user
   * @param membershipId the membership id to remove
   */
  @Transactional
  public void excludeMember(User currentUser, Long membershipId) {
    TeamMembership membership = teamMembershipRepository.findById(membershipId)
        .orElseThrow(() -> new IllegalStateException("Membre introuvable"));

    Team team = membership.getTeam();
    if (!sameUser(team.getManager(), currentUser)) {
      throw new IllegalStateException("Seul le responsable principal peut exclure un membre");
    }

    if (membership.getStatus() != MembershipStatus.ACCEPTED) {
      throw new IllegalStateException("Seuls les membres actifs peuvent être exclus");
    }

    User member = membership.getMember();
    if (sameUser(member, team.getManager())) {
      throw new IllegalStateException("Le responsable principal ne peut pas être exclu");
    }

    if (sameUser(member, team.getSecondManager())) {
      team.setSecondManager(null);
      teamRepository.save(team);
    }

    member.setTeam(null);
    userRepository.save(member);
    teamMembershipRepository.delete(membership);
  }

  //CPD-OFF
  private boolean sameUser(User firstUser, User secondUser) {
    return firstUser != null
        && secondUser != null
        && firstUser.getId() != null
        && firstUser.getId().equals(secondUser.getId());
  }
  //CPD-ON
  private void markRelatedNotificationsAsRead(Long membershipId) {
    List<Notification> notifications = notificationRepository.findByMembershipId(membershipId);
    for (Notification notif : notifications) {
      notif.setIsRead(true);
      notificationRepository.save(notif);
    }
  }

  /**
   * Send a general notification to a member.
   *
   * @param userId  the user ID
   * @param object  the notification subject
   * @param message the notification message
   */
  private void sendNotificationToMember(Long userId, String object, String message) {
    NotificationDto dto = new NotificationDto();
    dto.setUserId(userId);
    dto.setObject(object);
    dto.setMessage(message);
    dto.setType(NotificationType.GENERAL);
    notificationService.createNotification(dto);
  }
}
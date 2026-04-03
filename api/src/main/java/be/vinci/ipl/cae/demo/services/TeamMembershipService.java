package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import be.vinci.ipl.cae.demo.utils.EntityUtils;
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
   * notify the manager or managers about the notification.
   *
   * @param team the team in which manager is
   * @param dto nofitication dto
   */
  private void notifyManagers(Team team, NotificationDto dto) {
    notificationService.createNotification(team.getManager(), dto);
    if (team.getSecondManager() != null) {
      dto.setUserId(team.getSecondManager().getId());
      notificationService.createNotification(team.getSecondManager(), dto);
    }
  }

  /**
   * Builds and sends a join request notification to the team managers.
   *
   * @param user the requesting user
   * @param team the target team
   * @param membershipId the created membership ID
   */
  private void notifyManagersOfRequest(User user, Team team, Long membershipId) {
    NotificationDto dto = buildRequestDto(user, team, membershipId);
    notifyManagers(team, dto);
  }

  /**
   * Builds the notification DTO for a join request.
   *
   * @param user the requesting user
   * @param team the target team
   * @param membershipId the membership ID
   * @return the notification DTO
   */
  private NotificationDto buildRequestDto(User user, Team team, Long membershipId) {
    NotificationDto dto = new NotificationDto();
    dto.setObject("Nouvelle demande d'adhésion");
    dto.setMessage(user.getTag() + " souhaite rejoindre l'équipe " + team.getName());
    dto.setType(NotificationType.TEAM_INVITATION);
    dto.setMembershipId(membershipId);
    dto.setUserId(team.getManager().getId());
    return dto;
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
    validateCanJoinTeam(user, team);
    TeamMembership membership = createPendingMembership(user, team);
    notifyManagersOfRequest(user, team, membership.getId());
    return membership;
  }

  /**
   * Validates that the user is allowed to join the team.
   *
   * @param user the user requesting to join
   * @param team the target team
   */
  private void validateCanJoinTeam(User user, Team team) {
    if (user.getTeam() != null) {
      throw new IllegalStateException("Vous appartenez déjà à une team");
    }
    if (teamMembershipRepository.findByMember(user).isPresent()) {
      throw new IllegalStateException("Vous avez déjà une demande d'adhésion en cours");
    }
    validateNotManager(user, team);
    validateTagNotTaken(user, team);
  }

  /**
   * Validates that the user is not already a manager of the team.
   *
   * @param user the user to check
   * @param team the team
   */
  private void validateNotManager(User user, Team team) {
    boolean isManager = (team.getManager() != null
        && team.getManager().getId().equals(user.getId()))
        || (team.getSecondManager() != null
        && team.getSecondManager().getId().equals(user.getId()));
    if (isManager) {
      throw new IllegalStateException("Vous êtes déjà responsable de cette team");
    }
  }

  /**
   * Validates that the user's tag is not already used in the team.
   *
   * @param user the user to check
   * @param team the team
   */
  private void validateTagNotTaken(User user, Team team) {
    if (userRepository.existsByTeamAndTag(team, user.getTag())) {
      throw new IllegalStateException("This tag is already used by another user in this team");
    }
  }

  /**
   * Creates and saves a pending membership for the user.
   *
   * @param user the user joining
   * @param team the team
   * @return the saved membership
   */
  private TeamMembership createPendingMembership(User user, Team team) {
    TeamMembership membership = new TeamMembership();
    membership.setMember(user);
    membership.setTeam(team);
    membership.setStatus(MembershipStatus.PENDING);
    userRepository.save(user);
    return teamMembershipRepository.save(membership);
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
    applyAcceptedStatus(membership);
    final TeamMembership save = teamMembershipRepository.save(membership);
    markRelatedNotificationsAsRead(membership.getId());
    notifyMemberAccepted(membership);
    return save;
  }

  /**
   * Sets the membership status to accepted and assigns the team to the member.
   *
   * @param membership the membership to update
   */
  private void applyAcceptedStatus(TeamMembership membership) {
    membership.setStatus(MembershipStatus.ACCEPTED);
    User member = membership.getMember();
    member.setTeam(membership.getTeam());
    userRepository.save(member);
  }

  /**
   * Sends an acceptance notification to the member.
   *
   * @param membership the accepted membership
   */
  private void notifyMemberAccepted(TeamMembership membership) {
    sendNotificationToMember(membership.getMember(), "Demande acceptée",
        "Votre demande pour rejoindre l'équipe "
            + membership.getTeam().getName() + " a été acceptée !");
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
    applyRefusedStatus(membership, reason);
    final TeamMembership save = teamMembershipRepository.save(membership);
    markRelatedNotificationsAsRead(membership.getId());
    notifyMemberRefused(membership, reason);
    return save;
  }

  /**
   * Sets the membership status to refused with the given reason.
   *
   * @param membership the membership to update
   * @param reason the reason for refusal
   */
  private void applyRefusedStatus(TeamMembership membership, String reason) {
    membership.setStatus(MembershipStatus.REFUSED);
    membership.setRejectionReason(reason);
  }

  /**
   * Sends a refusal notification to the member.
   *
   * @param membership the refused membership
   * @param reason the reason for refusal
   */
  private void notifyMemberRefused(TeamMembership membership, String reason) {
    sendNotificationToMember(membership.getMember(), "Demande refusée",
        "Votre demande pour rejoindre l'équipe "
            + membership.getTeam().getName() + " a été refusée. Raison : " + reason);
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
    TeamMembership membership = findMembershipOrThrow(membershipId);
    validateCanExclude(currentUser, membership);
    removeMemberFromTeam(membership);
    teamMembershipRepository.delete(membership);
  }

  /**
   * Finds a membership by ID or throws if not found.
   *
   * @param membershipId the membership ID
   * @return the membership
   */
  private TeamMembership findMembershipOrThrow(Long membershipId) {
    return teamMembershipRepository.findById(membershipId)
        .orElseThrow(() -> new IllegalStateException("Membre introuvable"));
  }

  /**
   * Validates that the current user can exclude the member.
   *
   * @param currentUser the authenticated user
   * @param membership the membership to exclude
   */
  private void validateCanExclude(User currentUser, TeamMembership membership) {
    if (!EntityUtils.sameUser(membership.getTeam().getManager(), currentUser)) {
      throw new IllegalStateException("Seul le responsable principal peut exclure un membre");
    }
    validateExclusionTarget(membership);
  }

  /**
   * Validates that the membership target can be excluded.
   *
   * @param membership the membership to check
   */
  private void validateExclusionTarget(TeamMembership membership) {
    if (membership.getStatus() != MembershipStatus.ACCEPTED) {
      throw new IllegalStateException("Seuls les membres actifs peuvent être exclus");
    }
    if (EntityUtils.sameUser(membership.getMember(), membership.getTeam().getManager())) {
      throw new IllegalStateException("Le responsable principal ne peut pas être exclu");
    }
  }

  /**
   * Removes the member from their team and clears related state.
   *
   * @param membership the membership to remove
   */
  private void removeMemberFromTeam(TeamMembership membership) {
    clearSecondManagerIfNeeded(membership.getMember(), membership.getTeam());
    membership.getMember().setTeam(null);
    userRepository.save(membership.getMember());
  }

  /**
   * Removes the second manager role if the leaving member holds it.
   *
   * @param member the leaving member
   * @param team the team
   */
  private void clearSecondManagerIfNeeded(User member, Team team) {
    if (EntityUtils.sameUser(member, team.getSecondManager())) {
      team.setSecondManager(null);
      teamRepository.save(team);
    }
  }

  /**
   * Marks all notifications linked to a membership as read.
   *
   * @param membershipId the membership ID
   */
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
   * @param member  the user ID
   * @param object  the notification subject
   * @param message the notification message
   */
  private void sendNotificationToMember(User member, String object, String message) {
    NotificationDto dto = new NotificationDto();
    dto.setObject(object);
    dto.setMessage(message);
    dto.setType(NotificationType.GENERAL);
    notificationService.createNotification(member, dto);
  }
}
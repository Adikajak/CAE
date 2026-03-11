package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
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

  /**
   * Constructor for dependency injection.
   *
   * @param userRepository the user repository
   * @param teamMembershipRepository the team membership repository
   */
  public TeamMembershipService(
      UserRepository userRepository,
      TeamMembershipRepository teamMembershipRepository,
      NotificationService notificationService
  ) {
    this.userRepository = userRepository;
    this.teamMembershipRepository = teamMembershipRepository;
    this.notificationService = notificationService;
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
    dto.setUserId(membership.getMember().getId());
    dto.setObject("Nouvelle demande d'adhésion");
    dto.setMessage(user.getTag() + " souhaite rejoindre l'équipe " + team.getName());
    dto.setType(NotificationType.TEAM_INVITATION);
    dto.setMembershipId(save.getId());
    notificationService.createNotification(dto);

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
    final TeamMembership save = teamMembershipRepository.save(membership);

    NotificationDto dto = new NotificationDto();
    dto.setUserId(membership.getMember().getId());
    dto.setObject("Demande acceptée");
    dto.setMessage("Votre demande pour rejoinder l'équipe "
        + membership.getTeam().getName() + "a été acceptée!");
    dto.setType(NotificationType.GENERAL);
    notificationService.createNotification(dto);

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
   * Find a membership by its ID.
   *
   * @param membershipId the membership ID
   * @return optional containing the membership if found
   */
  public Optional<TeamMembership> getMembershipById(Long membershipId) {
    return teamMembershipRepository.findById(membershipId);
  }
}
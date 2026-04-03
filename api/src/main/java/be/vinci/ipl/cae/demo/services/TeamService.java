package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import be.vinci.ipl.cae.demo.utils.EntityUtils;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Service for managing teams.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final UserRepository userRepository;
  private final TeamMembershipRepository teamMembershipRepository;
  private final NotificationService notificationService;
  private final TournamentRegistrationRepository tournamentRegistrationRepository;

  /**
   * Constructor for TeamService.
   *
   * @param teamRepository the team repository
   * @param tournamentRegistrationRepository the tournament registration repository
   */
  public TeamService(
      TeamRepository teamRepository,
      UserRepository userRepository,
      TeamMembershipRepository teamMembershipRepository,
      NotificationService notificationService,
      TournamentRegistrationRepository tournamentRegistrationRepository) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.teamMembershipRepository = teamMembershipRepository;
    this.notificationService = notificationService;
    this.tournamentRegistrationRepository = tournamentRegistrationRepository;
  }

  /**
   * Create a new team and set the creator as the primary manager.
   *
   * @param team the team to create
   * @param creator the user who creates the team
   * @return the created team
   * @throws IllegalStateException if a team with the same name already exists
   */
  @Transactional
  public Team createTeam(Team team, User creator) {
    validateTeamNameIsUnique(team.getName());
    validateUserCanCreateTeam(creator);
    return saveNewTeam(team, creator);
  }

  /**
   * Validates that the team name is not already taken.
   *
   * @param name the name to check
   */
  private void validateTeamNameIsUnique(String name) {
    if (teamRepository.findByNameIgnoreCase(name).isPresent()) {
      throw new IllegalStateException("Le nom de cette team existe déjà");
    }
  }

  /**
   * Validates that the creator can create a team.
   *
   * @param creator the user creating the team
   */
  private void validateUserCanCreateTeam(User creator) {
    if (creator.getTeam() != null) {
      throw new IllegalStateException("Cet utilisateur possède déjà une team");
    }

    if (teamMembershipRepository.findByMemberAndStatus(
        creator, MembershipStatus.PENDING).isPresent()) {
      throw new IllegalStateException("Cet utilisateur a déjà une demande d'adhésion en attente");
    }
  }

  /**
   * Saves the team and assigns the creator as manager.
   *
   * @param team the team to save
   * @param creator the primary manager
   * @return the saved team
   */
  private Team saveNewTeam(Team team, User creator) {
    team.setManager(creator);
    Team createdTeam = teamRepository.save(team);

    creator.setTeam(createdTeam);
    userRepository.save(creator);

    return createdTeam;
  }

  /**
   * Get a team by its ID.
   *
   * @param id the team ID
   * @return optional team
   */
  public Optional<Team> getTeamById(Long id) {
    return teamRepository.findById(id);
  }

  /**
   * Get a team by its name.
   *
   * @param name the team name
   * @return optional team
   */
  public Optional<Team> getTeamByName(String name) {
    return teamRepository.findByNameIgnoreCase(name);
  }

  /**
   * Get all teams.
   *
   * @return list of teams
   */
  public List<Team> getAllTeams() {
    return (List<Team>) teamRepository.findAll();
  }

  /**
   * Counts the number of managers.
   *
   * @param team the team
   * @return the number of managers
   */
  public int getManagersCount(Team team) {
    return (team.getManager() != null ? 1 : 0)
        + (team.getSecondManager() != null ? 1 : 0);
  }

  /**
   * Designate a second manager for the team.
   *
   * @param currentUser the authenticated user
   * @param teamId the team id
   * @param memberId the member id to promote
   * @return updated team
   */
  @Transactional
  public Team designateSecondManager(User currentUser, Long teamId, Long memberId) {
    Team team = findTeamOrThrow(teamId);
    validateIsPrimaryManager(team, currentUser);
    validateHasNoSecondManager(team);
    User member = findValidMemberForPromotion(team, memberId);
    return applySecondManager(team, member);
  }

  /**
   * Finds a team by ID or throws if not found.
   *
   * @param teamId the team ID
   * @return the team
   */
  private Team findTeamOrThrow(Long teamId) {
    return teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalStateException("Équipe non trouvée"));
  }

  /**
   * Validates that the user is the primary manager of the team.
   *
   * @param team the team
   * @param user the user to check
   */
  private void validateIsPrimaryManager(Team team, User user) {
    if (!EntityUtils.sameUser(team.getManager(), user)) {
      throw new IllegalStateException("Seul le responsable principal peut désigner un responsable");
    }
  }

  /**
   * Validates that the team has no second manager yet.
   *
   * @param team the team
   */
  private void validateHasNoSecondManager(Team team) {
    if (team.getSecondManager() != null) {
      throw new IllegalStateException(
          "Impossible de désigner un autre responsable : la team en a déjà un");
    }
  }

  /**
   * Finds and validates a member eligible for promotion.
   *
   * @param team the team
   * @param memberId the member ID
   * @return the validated member
   */
  private User findValidMemberForPromotion(Team team, Long memberId) {
    User member = userRepository.findById(memberId)
        .orElseThrow(() -> new IllegalStateException("Membre introuvable"));
    validateMemberInTeam(member, team);
    validateNotAlreadyPrimaryManager(member, team);
    return member;
  }

  /**
   * Validates that the member belongs to the team.
   *
   * @param member the user to check
   * @param team the team
   */
  private void validateMemberInTeam(User member, Team team) {
    if (!sameTeam(member.getTeam(), team)) {
      throw new IllegalStateException("Le membre sélectionné n'appartient pas à cette team");
    }
  }

  /**
   * Validates that the member is not already the primary manager.
   *
   * @param member the user to check
   * @param team the team
   */
  private void validateNotAlreadyPrimaryManager(User member, Team team) {
    if (EntityUtils.sameUser(member, team.getManager())) {
      throw new IllegalStateException(
          "Le responsable principal ne peut pas être désigné à nouveau");
    }
  }

  /**
   * Sets the second manager, sends notification and saves the team.
   *
   * @param team the team
   * @param member the new second manager
   * @return the updated team
   */
  private Team applySecondManager(Team team, User member) {
    team.setSecondManager(member);
    sendRoleNotification(
        member,
        "Nomination en tant que second responsable",
        "Vous avez été désigné second responsable de l'équipe " + team.getName() + "."
    );
    return teamRepository.save(team);
  }

  /**
   * Count accepted members of a team.
   *
   * @param team the team
   * @return number of accepted members
   */
  public int getAcceptedMembersCount(Team team) {
    return (int) teamMembershipRepository
        .findByTeamAndStatus(team, MembershipStatus.ACCEPTED).stream()
        .filter(m -> !EntityUtils.sameUser(m.getMember(), team.getManager()))
        .filter(m -> !EntityUtils.sameUser(m.getMember(), team.getSecondManager()))
        .count();
  }

  /**
   * Renounce the primary manager role.
   *
   * @param currentUser the authenticated user
   * @param teamId the team id
   * @return updated team
   */
  @Transactional
  public Team renounceManagerRole(User currentUser, Long teamId) {
    Team team = findTeamOrThrow(teamId);
    validateCanRenounce(team, currentUser);
    return promoteSecondManager(team);
  }

  /**
   * Validates that the current user can renounce their manager role.
   *
   * @param team the team
   * @param currentUser the user attempting to renounce
   */
  private void validateCanRenounce(Team team, User currentUser) {
    if (!EntityUtils.sameUser(team.getManager(), currentUser)) {
      throw new IllegalStateException("Seul le responsable principal peut renoncer à ce rôle");
    }
    if (team.getSecondManager() == null) {
      throw new IllegalStateException(
          "Impossible de renoncer : désignez d'abord un autre responsable");
    }
  }

  /**
   * Swaps primary and second manager, saves and sends notifications.
   *
   * @param team the team
   * @return the updated team
   */
  private Team promoteSecondManager(Team team) {
    User formerManager = team.getManager();
    User promotedManager = team.getSecondManager();
    Team savedTeam = applyManagerSwap(team, promotedManager, formerManager);
    notifyManagerSwap(formerManager, promotedManager, team.getName());
    return savedTeam;
  }

  /**
   * Sets the two manager roles and saves the team.
   *
   * @param team the team
   * @param newManager the new primary manager
   * @param newSecondManager the new second manager
   * @return the saved team
   */
  private Team applyManagerSwap(Team team, User newManager, User newSecondManager) {
    team.setManager(newManager);
    team.setSecondManager(newSecondManager);
    return teamRepository.save(team);
  }

  /**
   * Sends role change notifications to both managers.
   *
   * @param formerManager the demoted manager
   * @param promotedManager the promoted manager
   * @param teamName the team name
   */
  private void notifyManagerSwap(User formerManager, User promotedManager, String teamName) {
    sendRoleNotification(formerManager, "Rétrogradation de rôle",
        "Vous êtes désormais second responsable de l'équipe " + teamName + ".");

    sendRoleNotification(promotedManager, "Promotion au rôle de responsable",
        "Vous êtes désormais responsable principal de l'équipe " + teamName + ".");
  }

  /**
   * Leave a team.
   *
   * @param currentUser the authenticated user
   * @param teamId the team id
   */
  @Transactional
  public void leaveTeam(User currentUser, Long teamId) {
    Team team = findTeamOrThrow(teamId);
    handleManagerLeave(currentUser, team);
    removeMemberFromTeam(currentUser, team);
    if (team.getManager() == null) {
      tournamentRegistrationRepository.deleteByTeam(team);
    }
  }

  /**
   * Handles manager-specific logic when leaving a team.
   *
   * @param currentUser the leaving user
   * @param team the team
   */
  private void handleManagerLeave(User currentUser, Team team) {
    if (EntityUtils.sameUser(team.getManager(), currentUser)) {
      handlePrimaryManagerLeave(team);
    } else if (EntityUtils.sameUser(team.getSecondManager(), currentUser)) {
      removeSecondManager(team);
    }
  }

  /**
   * Handles the primary manager leaving: promotes second manager if present,
   * otherwise validates no other members remain before clearing the role.
   *
   * @param team the team
   */
  private void handlePrimaryManagerLeave(Team team) {
    if (team.getSecondManager() != null) {
      promoteSecondManagerOnLeave(team);
    } else {
      validateNoOtherMembers(team);
      clearManagerRole(team);
    }
  }

  /**
   * Promotes the second manager to primary manager when the primary manager leaves.
   *
   * @param team the team
   */
  private void promoteSecondManagerOnLeave(Team team) {
    User promoted = team.getSecondManager();
    team.setManager(promoted);
    team.setSecondManager(null);
    teamRepository.save(team);
    sendRoleNotification(promoted, "Promotion au rôle de responsable",
        "Vous êtes désormais responsable principal de l'équipe " + team.getName() + ".");
  }

  /**
   * Validates that the manager is the only remaining member.
   *
   * @param team the team
   */
  private void validateNoOtherMembers(Team team) {
    int totalMembers = getManagersCount(team) + getAcceptedMembersCount(team);
    if (totalMembers > 1) {
      throw new IllegalStateException(
          "Impossible de quitter : vous êtes responsable principal et il reste d'autres membres");
    }
  }

  /**
   * Clears the primary manager role and saves the team.
   *
   * @param team the team
   */
  private void clearManagerRole(Team team) {
    team.setManager(null);
    teamRepository.save(team);
  }

  /**
   * Clears the second manager of the team.
   *
   * @param team the team
   */
  private void removeSecondManager(Team team) {
    team.setSecondManager(null);
    teamRepository.save(team);
  }

  /**
   * Removes the member from the team and clears their membership.
   *
   * @param member the user to remove
   * @param team the team
   */
  private void removeMemberFromTeam(User member, Team team) {
    teamMembershipRepository.findByTeamAndMember(team, member)
        .ifPresent(teamMembershipRepository::delete);
    member.setTeam(null);
    userRepository.save(member);
  }

  private void sendRoleNotification(User user, String object, String message) {
    NotificationDto notificationDto = new NotificationDto();
    notificationDto.setUserId(user.getId());
    notificationDto.setObject(object);
    notificationDto.setMessage(message);
    notificationDto.setType(NotificationType.GENERAL);
    notificationService.createNotification(user, notificationDto);
  }

  /**
   * Checks if two teams have the same by ID.
   *
   * @param firstTeam the first team
   * @param secondTeam the second team
   * @return true if both teams share the same ID
   */
  private boolean sameTeam(Team firstTeam, Team secondTeam) {
    return firstTeam != null
        && firstTeam.getId() != null
        && firstTeam.getId().equals(secondTeam.getId());
  }
}

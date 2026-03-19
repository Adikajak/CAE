package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
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

  /**
   * Constructor for TeamService.
   *
   * @param teamRepository the team repository
   */
  public TeamService(
      TeamRepository teamRepository,
      UserRepository userRepository,
      TeamMembershipRepository teamMembershipRepository) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.teamMembershipRepository = teamMembershipRepository;
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
    Optional<Team> existing = teamRepository.findByNameIgnoreCase(team.getName());
    if (existing.isPresent()) {
      throw new IllegalStateException("Le nom de cette team existe déjà");
    }
    if (creator.getTeam() != null) {
      throw new IllegalStateException("Cet utilisateur possède déjà une team");
    }
    boolean hasPendingMembershipRequest = teamMembershipRepository
        .findByMemberAndStatus(creator, MembershipStatus.PENDING)
            .isPresent();

    if (hasPendingMembershipRequest) {
      throw new IllegalStateException("Cet utilisateur a déjà une demande d'adhésion en attente");
    }

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
    int count = 0;

    if (team.getManager() != null) {
      count++;
    }
    if (team.getSecondManager() != null) {
      count++;
    }

    return count;
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
  //CPD-OFF
  public Team designateSecondManager(User currentUser, Long teamId, Long memberId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalStateException("Équipe non trouvée"));

    if (!sameUser(team.getManager(), currentUser)) {
      throw new IllegalStateException("Seul le responsable principal peut désigner un responsable");
    }

    if (team.getSecondManager() != null) {
      throw new IllegalStateException(
          "Impossible de désigner un autre responsable : la team en a déjà un"
      );
    }

    User member = userRepository.findById(memberId)
        .orElseThrow(() -> new IllegalStateException("Membre introuvable"));

    if (!sameTeam(member.getTeam(), team)) {
      throw new IllegalStateException("Le membre sélectionné n'appartient pas à cette team");
    }

    if (sameUser(member, team.getManager())) {
      throw new IllegalStateException(
          "Le responsable principal ne peut pas être désigné à nouveau");
    }

    team.setSecondManager(member);
    return teamRepository.save(team);
  }
  //CPD-ON

  /**
   * Count accepted members of a team.
   *
   * @param team the team
   * @return number of accepted members
   */
  public int getAcceptedMembersCount(Team team) {
    return (int) teamMembershipRepository
        .findByTeamAndStatus(team, MembershipStatus.ACCEPTED)
        .stream()
        .filter(m -> !sameUser(m.getMember(), team.getManager()))
        .filter(m -> !sameUser(m.getMember(), team.getSecondManager()))
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
  //CPD-OFF
  public Team renounceManagerRole(User currentUser, Long teamId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalStateException("Équipe non trouvée"));

    if (!sameUser(team.getManager(), currentUser)) {
      throw new IllegalStateException("Seul le responsable principal peut renoncer à ce rôle");
    }

    if (team.getSecondManager() == null) {
      throw new IllegalStateException(
          "Impossible de renoncer : désignez d'abord un autre responsable"
      );
    }

    team.setManager(team.getSecondManager());
    team.setSecondManager(null);
    return teamRepository.save(team);
  }
  //CPD-ON

  /**
   * Leave a team.
   *
   * @param currentUser the authenticated user
   * @param teamId the team id
   */
  @Transactional
  public void leaveTeam(User currentUser, Long teamId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalStateException("Équipe non trouvée"));

    if (!sameTeam(currentUser.getTeam(), team)) {
      throw new IllegalStateException("Vous n'appartenez pas à cette team");
    }

    if (sameUser(team.getManager(), currentUser)) {
      if (team.getSecondManager() == null) {
        throw new IllegalStateException(
            "Impossible de quitter : désignez d'abord un autre responsable"
        );
      }

      team.setManager(team.getSecondManager());
      team.setSecondManager(null);
      teamRepository.save(team);
    } else if (sameUser(team.getSecondManager(), currentUser)) {
      team.setSecondManager(null);
      teamRepository.save(team);
    }

    teamMembershipRepository.findByTeamAndMember(team, currentUser)
        .ifPresent(teamMembershipRepository::delete);

    currentUser.setTeam(null);
    userRepository.save(currentUser);
  }

  //CPD-OFF
  private boolean sameUser(User firstUser, User secondUser) {
    return firstUser != null
        && secondUser != null
        && firstUser.getId() != null
        && firstUser.getId().equals(secondUser.getId());
  }
  //CPD-ON

  private boolean sameTeam(Team firstTeam, Team secondTeam) {
    return firstTeam != null
        && secondTeam != null
        && firstTeam.getId() != null
        && firstTeam.getId().equals(secondTeam.getId());
  }
}
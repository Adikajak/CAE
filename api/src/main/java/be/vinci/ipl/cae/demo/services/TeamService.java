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
    Optional<Team> existing = teamRepository.findByName(team.getName());
    if (existing.isPresent()) {
      throw new IllegalStateException("Le nom de cette team existe déjà");
    }
    if (creator.getTeam() != null) {
      throw new IllegalStateException("Cet utilisateur possède déjà une team");
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
    return teamRepository.findByName(name);
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
   * Designate a second manager for the team.
   *
   * @param currentUser the authenticated user
   * @param teamId the team id
   * @param memberId the member id to promote
   * @return updated team
   */
  @Transactional
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
      throw new IllegalStateException("Le responsable principal ne peut pas être désigné à nouveau");
    }

    team.setSecondManager(member);
    return teamRepository.save(team);
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

  private boolean sameUser(User firstUser, User secondUser) {
    return firstUser != null
        && secondUser != null
        && firstUser.getId() != null
        && firstUser.getId().equals(secondUser.getId());
  }

  private boolean sameTeam(Team firstTeam, Team secondTeam) {
    return firstTeam != null
        && secondTeam != null
        && firstTeam.getId() != null
        && firstTeam.getId().equals(secondTeam.getId());
  }
}
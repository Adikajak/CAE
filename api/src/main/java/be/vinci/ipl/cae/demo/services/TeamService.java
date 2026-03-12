package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
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

  /**
   * Constructor for TeamService.
   *
   * @param teamRepository the team repository
   */
  public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
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
    Team savedTeam = teamRepository.save(team);

    creator.setTeam(team);
    userRepository.save(creator);

    return savedTeam;
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
}
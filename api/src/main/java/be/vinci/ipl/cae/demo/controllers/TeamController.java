package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.TeamCreateRequest;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.TeamMembershipService;
import be.vinci.ipl.cae.demo.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller to manage teams.
 */
@RestController
@RequestMapping("/teams")
public class TeamController {

  private final TeamService teamService;
  private final TeamMembershipService teamMembershipService;

  /**
   * Constructor for TeamController.
   *
   * @param teamService the injected TeamService
   * @param teamMembershipService the injected TeamMembershipService
   */
  public TeamController(TeamService teamService, TeamMembershipService teamMembershipService) {
    this.teamService = teamService;
    this.teamMembershipService = teamMembershipService;
  }

  /**
   * Get all teams.
   *
   * @return list of all teams
   */
  @GetMapping({"", "/"})
  public List<Team> getAllTeams() {
    return teamService.getAllTeams();
  }

  /**
   * Create a new team. The creator becomes the primary manager.
   *
   * @param authentication Spring Security authentication containing the user
   * @param request the payload containing the team name
   * @return the created team
   * @throws ResponseStatusException if a team with the same name already exists
   */
  @PostMapping({"", "/"})
  @ResponseStatus(HttpStatus.CREATED)
  public Team createTeam(Authentication authentication, @RequestBody TeamCreateRequest request) {
    User user = (User) authentication.getPrincipal();
    if (user == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Vous devez être connecté pour créer une team"
      );
    }
    Team team = new Team();
    team.setName(request.getName());

    try {
      return teamService.createTeam(team, user);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }
}

package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.TeamCreateRequest;
import be.vinci.ipl.cae.demo.models.dtos.TeamResponse;
import be.vinci.ipl.cae.demo.models.dtos.UserProfile;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
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

  /**
   * Constructor for TeamController.
   *
   * @param teamService the injected TeamService
   */
  public TeamController(TeamService teamService) {
    this.teamService = teamService;
  }

  /**
   * Get all teams.
   *
   * @return list of all teams
   */
  @GetMapping({"", "/"})
  public List<TeamResponse> getAllTeams() {
    return teamService.getAllTeams().stream()
        .map(team -> new TeamResponse(
            team.getId(),
            team.getName(),
            team.getManager() != null
              ? new UserProfile(
                  team.getManager().getId(),
                  team.getManager().getEmail(),
                  team.getManager().getTag(),
                  team.getManager().getSpeciality().getName(),
                  team.getManager().getProfilePicture()
              ) : null,
            team.getSecondManager() != null
                ? new UserProfile(
                team.getSecondManager().getId(),
                team.getSecondManager().getEmail(),
                team.getSecondManager().getTag(),
                team.getSecondManager().getSpeciality().getName(),
                team.getSecondManager().getProfilePicture()
            ) : null
        )).toList();
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
  public TeamResponse createTeam(
      Authentication authentication,
      @RequestBody TeamCreateRequest request
  ) {
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
      Team createdTeam = teamService.createTeam(team, user);
      return new TeamResponse(
          createdTeam.getId(),
          createdTeam.getName(),
          createdTeam.getManager() != null
              ? new UserProfile(
              createdTeam.getManager().getId(),
              createdTeam.getManager().getEmail(),
              createdTeam.getManager().getTag(),
              createdTeam.getManager().getSpeciality().getName(),
              createdTeam.getManager().getProfilePicture()
          )
              : null,
          createdTeam.getSecondManager() != null
              ? new UserProfile(
              createdTeam.getSecondManager().getId(),
              createdTeam.getSecondManager().getEmail(),
              createdTeam.getSecondManager().getTag(),
              createdTeam.getSecondManager().getSpeciality().getName(),
              createdTeam.getSecondManager().getProfilePicture()
          )
              : null
      );
    } catch (IllegalStateException e) {
      if (e.getMessage().contains("existe déjà")) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            e.getMessage(), e
        );
      }
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          e.getMessage(), e
      );
    }
  }
}

package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.TeamCreateRequestDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamResponseDto;
import be.vinci.ipl.cae.demo.models.dtos.UserProfile;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  public List<TeamResponseDto> getAllTeams() {
    return teamService.getAllTeams().stream()
        .map(this::toResponse)
        .toList();
  }

  /**
   * Get a team by its id.
   *
   * @param teamId the team id
   * @return the team
   */
  @GetMapping("/{teamId}")
  public TeamResponseDto getTeamById(@PathVariable Long teamId) {
    Team team = teamService.getTeamById(teamId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe non trouvée"));
    return toResponse(team);
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
  public TeamResponseDto createTeam(
      Authentication authentication,
      @RequestBody TeamCreateRequestDto request
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
      return toResponse(createdTeam);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }

  /**
   * Designate a second manager for a team.
   *
   * @param authentication authenticated user
   * @param teamId the team id
   * @param memberId the member id to promote
   * @return updated team
   */
  @PatchMapping("/{teamId}/second-manager/{memberId}")
  public TeamResponseDto designateSecondManager(
      Authentication authentication,
      @PathVariable Long teamId,
      @PathVariable Long memberId
  ) {
    User currentUser = (User) authentication.getPrincipal();
    try {
      return toResponse(teamService.designateSecondManager(currentUser, teamId, memberId));
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Renounce the primary manager role.
   *
   * @param authentication authenticated user
   * @param teamId the team id
   * @return updated team
   */
  @PatchMapping("/{teamId}/manager/renounce")
  public TeamResponseDto renounceManagerRole(
      Authentication authentication,
      @PathVariable Long teamId
  ) {
    User currentUser = (User) authentication.getPrincipal();
    try {
      return toResponse(teamService.renounceManagerRole(currentUser, teamId));
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  private TeamResponseDto toResponse(Team team) {
    return new TeamResponseDto(
        team.getId(),
        team.getName(),
        toUserProfile(team.getManager()),
        toUserProfile(team.getSecondManager())
    );
  }

  private UserProfile toUserProfile(User user) {
    if (user == null) {
      return null;
    }
    return new UserProfile(
        user.getId(),
        user.getEmail(),
        user.getTag(),
        user.getSpeciality().getName(),
        user.getProfilePicture().getUrl(),
        user.getDate()
    );
  }
}

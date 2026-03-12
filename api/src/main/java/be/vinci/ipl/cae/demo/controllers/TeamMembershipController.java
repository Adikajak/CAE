package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.TeamMembershipService;
import be.vinci.ipl.cae.demo.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller to handle Team Memberships.
 */
@RestController
@RequestMapping("/teams/memberships")
public class TeamMembershipController {

  private final TeamMembershipService teamMembershipService;
  private final TeamService teamService;

  /**
   * Constructor for TeamMembershipController.
   *
   * @param teamMembershipService the injected service.
   * @param teamService the injected service.
   */
  public TeamMembershipController(
      TeamMembershipService teamMembershipService,
      TeamService teamService
  ) {
    this.teamMembershipService = teamMembershipService;
    this.teamService = teamService;
  }

  /**
   * Request to join a team.
   */
  @PostMapping("/{teamId}/membership")
  @ResponseStatus(HttpStatus.CREATED)
  public void joinTeam(Authentication authentication, @PathVariable Long teamId) {
    User user = (User) authentication.getPrincipal();
    Team team = teamService.getTeamById(teamId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Équipe non trouvée"
        ));

    try {
      teamMembershipService.addUserToTeam(user, team);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * List all members of a team.
   */
  @GetMapping("/{teamId}/members")
  public List<TeamMembership> getAllMembers(@PathVariable Long teamId) {
    Team team = teamService.getTeamById(teamId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe non trouvée"));
    return teamMembershipService.getAllMembers(team);
  }

  /**
   * List pending membership requests for a team.
   */
  @GetMapping("/{teamId}/requests")
  public List<TeamMembership> getPendingRequests(@PathVariable Long teamId) {
    Team team = teamService.getTeamById(teamId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe non trouvée"));
    return teamMembershipService.getPendingRequests(team);
  }

  /**
   * Accept a membership request.
   */
  @PatchMapping("/{membershipId}/accept")
  public TeamMembership acceptMembership(
      Authentication authentication,
      @PathVariable Long membershipId
  ) {
    TeamMembership membership = getTeamMembershipIfAuthorized(
        authentication,
        membershipId,
        "Seul le responsable ou le second responsable peut accepter une demande"
    );
    return teamMembershipService.acceptMembership(membership);
  }

  /**
   * Refuse a membership request.
   */
  @PatchMapping("/{membershipId}/refuse")
  public TeamMembership refuseMembership(
      Authentication authentication,
      @PathVariable Long membershipId,
      @RequestParam String reason
  ) {
    TeamMembership membership = getTeamMembershipIfAuthorized(
        authentication,
        membershipId,
        "Seul le responsable ou le second responsable peut refuser une demande"
    );
    return teamMembershipService.refuseMembership(membership, reason);
  }

  /**
   * Exclude an accepted member from a team.
   */
  @DeleteMapping("/{membershipId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void excludeMember(Authentication authentication, @PathVariable Long membershipId) {
    User currentUser = (User) authentication.getPrincipal();
    try {
      teamMembershipService.excludeMember(currentUser, membershipId);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  private TeamMembership getTeamMembershipIfAuthorized(
      Authentication authentication,
      Long membershipId,
      String message
  ) {
    User currentUser = (User) authentication.getPrincipal();

    TeamMembership membership = teamMembershipService.getMembershipById(membershipId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Demande non trouvée"
        ));

    Team team = membership.getTeam();

    if (!currentUser.equals(team.getManager()) && !currentUser.equals(team.getSecondManager())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          message);
    }
    return membership;
  }
}
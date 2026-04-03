package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.enums.State;
import be.vinci.ipl.cae.demo.services.TournamentService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller tests for tournaments.
 */
class TournamentControllerTest {

  private final TournamentService tournamentService = mock(TournamentService.class);
  private final TournamentController tournamentController = new TournamentController(
      tournamentService);

  @Test
  void getAllTournamentsReturnsForbiddenWhenUnauthenticatedFiltersInPreparation() {
    Authentication authentication = null;

    ResponseStatusException exception = null;
    try {
      tournamentController.getAllTournaments(State.IN_PREPARATION, null, null, authentication);
    } catch (ResponseStatusException e) {
      exception = e;
    }

    assertTrue(exception != null && exception.getStatusCode().value() == 403);
  }

  @Test
  void getAllTournamentsReturnsForbiddenWhenNonAdminFiltersInPreparation() {
    User user = mock(User.class);
    when(user.isAdmin()).thenReturn(false);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);

    ResponseStatusException exception = null;
    try {
      tournamentController.getAllTournaments(State.IN_PREPARATION, null, null, authentication);
    } catch (ResponseStatusException e) {
      exception = e;
    }

    assertTrue(exception != null && exception.getStatusCode().value() == 403);
  }

  @Test
  void getAllTournamentsReturnsOkWhenAdminFiltersInPreparation() {
    User user = mock(User.class);
    when(user.isAdmin()).thenReturn(true);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);

    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getAllTournaments(eq(State.IN_PREPARATION), eq(true)))
        .thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        State.IN_PREPARATION, null, null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getAllTournaments(State.IN_PREPARATION, true);
  }

  @Test
  void getAllTournamentsReturnsOkForUnauthenticatedWithoutStateFilter() {
    Authentication authentication = null;
    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getAllTournaments(null, false)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, null, null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getAllTournaments(null, false);
  }

  @Test
  void getAllTournamentsReturnsOkForNonAdminWithoutStateFilter() {
    User user = mock(User.class);
    when(user.isAdmin()).thenReturn(false);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);

    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getAllTournaments(null, false)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, null, null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getAllTournaments(null, false);
  }

  @Test
  void getAllTournamentsReturnsOkForAdminWithoutStateFilter() {
    User user = mock(User.class);
    when(user.isAdmin()).thenReturn(true);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);

    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getAllTournaments(null, true)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, null, null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getAllTournaments(null, true);
  }

  @Test
  void getAllTournamentsFiltersByTeamNameWhenProvided() {
    Authentication authentication = null;
    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getTournamentsByTeamName("TEAM_ALPHA", false)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, "TEAM_ALPHA", null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getTournamentsByTeamName("TEAM_ALPHA", false);
  }

  @Test
  void getAllTournamentsFiltersByPlayerTagWhenProvided() {
    Authentication authentication = null;
    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getTournamentsByPlayerTag("Flash", false)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, null, "Flash", authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getTournamentsByPlayerTag("Flash", false);
  }

  @Test
  void getAllTournamentsFiltersByTeamNameAsAdmin() {
    User user = mock(User.class);
    when(user.isAdmin()).thenReturn(true);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);

    List<TournamentDto> tournaments = new ArrayList<>();
    when(tournamentService.getTournamentsByTeamName("TEAM_ALPHA", true)).thenReturn(tournaments);

    List<TournamentDto> result = tournamentController.getAllTournaments(
        null, "TEAM_ALPHA", null, authentication);

    assertEquals(tournaments, result);
    verify(tournamentService).getTournamentsByTeamName("TEAM_ALPHA", true);
  }

  @Test
  void createTournamentReturnsConflictWhenNameAlreadyExists() {
    TournamentDto request = new TournamentDto();
    request.setName("Winter Cup");
    request.setDescription("Tournoi d'hiver");
    request.setStartDate(LocalDate.of(2026, 1, 10));
    request.setEndDate(LocalDate.of(2026, 1, 12));
    request.setStartInscriptionDate(LocalDate.of(2025, 12, 1));
    request.setEndInscriptionDate(LocalDate.of(2025, 12, 20));
    request.setMaxTeams(16);
    request.setState(State.IN_PREPARATION);

    when(tournamentService.createTournament(request)).thenReturn(null);

    ResponseStatusException exception = null;
    try {
      tournamentController.createTournament(request);
    } catch (ResponseStatusException e) {
      exception = e;
    }

    assertTrue(exception != null && exception.getStatusCode().value() == 409);
    assertEquals("Un tournoi avec ce nom existe déjà", exception.getReason());
  }
}

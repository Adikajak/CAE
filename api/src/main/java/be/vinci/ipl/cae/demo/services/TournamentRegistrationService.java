package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.TeamActivityDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentRegistrationDto;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.enums.State;
import be.vinci.ipl.cae.demo.repositories.TournamentRegistrationRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing tournament registrations.
 */
@Service
public class TournamentRegistrationService {

  private static final int MIN_MEMBERS_REQUIRED = 4;

  private final TournamentRegistrationRepository tournamentRegistrationRepository;
  private final TeamService teamService;

  /**
   * Constructor for dependency injection.
   *
   * @param tournamentRegistrationRepository the registration repository
   * @param teamService the team service
   */
  public TournamentRegistrationService(
      TournamentRegistrationRepository tournamentRegistrationRepository,
      TeamService teamService
  ) {
    this.tournamentRegistrationRepository = tournamentRegistrationRepository;
    this.teamService = teamService;
  }

  /**
   * Register a team to a tournament.
   * Only the primary or secondary manager can register the team.
   *
   * @param tournament the tournament
   * @param team the team to register
   * @param user the authenticated user
   * @return the created registration DTO
   */
  @Transactional
  public TournamentRegistrationDto registerTeam(Tournament tournament, Team team, User user) {
    validateCanRegister(tournament, team, user);
    TournamentRegistration registration = buildRegistration(tournament, team);
    return toDto(tournamentRegistrationRepository.save(registration));
  }

  /**
   * Validates all conditions required to register a team.
   *
   * @param tournament the tournament
   * @param team the team
   * @param user the user requesting the registration
   */
  private void validateCanRegister(Tournament tournament, Team team, User user) {
    validateTeamIsActive(team);
    validateIsManager(team, user);
    validateTournamentIsOpen(tournament);
    validateTeamHasEnoughMembers(team);
    validateNotAlreadyRegistered(tournament, team);
    validateTournamentNotFull(tournament);
  }

  /**
   * Validates that the team has at least a primary manager (is not inactive).
   *
   * @param team the team
   */
  private void validateTeamIsActive(Team team) {
    if (team.getManager() == null) {
      throw new IllegalStateException("Cette team n'a pas de responsable principal");
    }
  }

  /**
   * Validates that the user is the primary or secondary manager of the team.
   *
   * @param team the team
   * @param user the user
   */
  private void validateIsManager(Team team, User user) {
    boolean isPrimary = team.getManager().getId().equals(user.getId());
    boolean isSecond = team.getSecondManager() != null
        && team.getSecondManager().getId().equals(user.getId());
    if (!isPrimary && !isSecond) {
      throw new IllegalStateException(
          "Seul le responsable principal ou secondaire peut inscrire la team");
    }
  }

  /**
   * Validates that the tournament is open for registrations.
   *
   * @param tournament the tournament
   */
  private void validateTournamentIsOpen(Tournament tournament) {
    validateRegistrationPeriodIsOpen(tournament);
    if (tournament.getState() != State.PLANIFIED) {
      throw new IllegalStateException("Les inscriptions ne sont pas ouvertes pour ce tournoi");
    }
  }

  /**
   * Validates that the registration period has not ended yet.
   *
   * @param tournament the tournament
   */
  private void validateRegistrationPeriodIsOpen(Tournament tournament) {
    if (tournament.getEndInscriptionDate() != null
        && tournament.getEndInscriptionDate().isBefore(LocalDate.now())) {
      throw new IllegalStateException("La période d'inscription est finie");
    }
  }

  /**
   * Validates that the team has enough members to participate.
   *
   * @param team the team
   */
  private void validateTeamHasEnoughMembers(Team team) {
    int total = teamService.getManagersCount(team) + teamService.getAcceptedMembersCount(team);
    if (total < MIN_MEMBERS_REQUIRED) {
      throw new IllegalStateException(
          "La team doit avoir au moins " + MIN_MEMBERS_REQUIRED + " membres pour s'inscrire");
    }
  }

  /**
   * Validates that the team is not already registered to the tournament.
   *
   * @param tournament the tournament
   * @param team the team
   */
  private void validateNotAlreadyRegistered(Tournament tournament, Team team) {
    if (tournamentRegistrationRepository.existsByTournamentAndTeam(tournament, team)) {
      throw new IllegalStateException("Cette team est déjà inscrite à ce tournoi");
    }
  }

  /**
   * Validates that the tournament has not reached its maximum number of teams.
   *
   * @param tournament the tournament
   */
  private void validateTournamentNotFull(Tournament tournament) {
    long count = tournamentRegistrationRepository.findByTournament(tournament).size();
    if (count >= tournament.getMaxTeams()) {
      throw new IllegalStateException("Ce tournoi a atteint le nombre maximum d'équipes");
    }
  }

  /**
   * Builds a TournamentRegistration entity.
   *
   * @param tournament the tournament
   * @param team the team
   * @return the registration entity
   */
  private TournamentRegistration buildRegistration(Tournament tournament, Team team) {
    TournamentRegistration registration = new TournamentRegistration();
    registration.setTournament(tournament);
    registration.setTeam(team);
    return registration;
  }

  /**
   * Get all registrations for a tournament.
   *
   * @param tournament the tournament
   * @return list of registration DTOs
   */
  public List<TournamentRegistrationDto> getRegistrations(Tournament tournament) {
    return tournamentRegistrationRepository.findByTournament(tournament).stream()
        .map(this::toDto)
        .toList();
  }

  /**
   * Get all tournament registrations for a team.
   *
   * @param team the team
   * @return list of registration DTOs
   */
  public List<TournamentRegistrationDto> getRegistrationsByTeam(Team team) {
    return tournamentRegistrationRepository.findByTeam(team).stream()
        .map(this::toDto)
        .toList();
  }

  /**
   * Get all tournament activities for a team.
   *
   * @param team the team
   * @return list of team activity DTOs
   */
  public List<TeamActivityDto> getTeamActivity(Team team) {
    return tournamentRegistrationRepository.findByTeam(team).stream()
        .map(this::toTeamActivityDto)
        .toList();
  }

  private TournamentRegistrationDto toDto(TournamentRegistration registration) {
    return new TournamentRegistrationDto(
        registration.getTournament().getId(),
        registration.getTournament().getName(),
        registration.getTeam().getId(),
        registration.getTeam().getName()
    );
  }

  private TeamActivityDto toTeamActivityDto(TournamentRegistration registration) {
    return new TeamActivityDto(
        registration.getTournament().getId(),
        registration.getTournament().getName(),
        registration.getTournament().getStartDate(),
        registration.getTournament().getEndDate()
    );
  }
}

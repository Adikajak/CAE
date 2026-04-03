package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;
import be.vinci.ipl.cae.demo.models.entities.ProfilePicture;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.enums.State;
import be.vinci.ipl.cae.demo.repositories.ProfilePictureRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import be.vinci.ipl.cae.demo.services.UserService;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class DemoApplication {

  private static final String DEFAULT_PASSWORD = "password";
  private static final String TEAM_ALPHA = "TEAM_ALPHA";
  private static final String TEAM_OMEGA = "TEAM_OMEGA";
  private static final String TEAM_IOTA = "TEAM_IOTA";
  private static final String TEAM_EPSILON = "TEAM_EPSILON";

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    System.out.println("CWD: " + System.getProperty("user.dir"));

    SpringApplication.run(DemoApplication.class, args);
  }

  @Bean
  @Order(1)
  CommandLineRunner seedSpecialities(SpecialityRepository specialityRepository) {
    return args -> {
      String[] names = {
          "Architecte", "Executeur", "Tacticien", "Gardien", "Catalyseur",
          "Perturbateur", "Guérisseur"
      };

      for (String name : names) {
        if (specialityRepository.findByName(name) == null) {
          Speciality speciality = new Speciality();
          speciality.setName(name);
          specialityRepository.save(speciality);
        }
      }
    };
  }

  @Bean
  @Order(2)
  CommandLineRunner seedProfilePictures(ProfilePictureRepository profilePictureRepository) {
    return args -> {
      String[] urls = {
          "https://api.dicebear.com/7.x/bottts/svg?seed=apple",
          "https://api.dicebear.com/7.x/bottts/svg?seed=banana",
          "https://api.dicebear.com/7.x/bottts/svg?seed=carrot",
          "https://api.dicebear.com/7.x/bottts/svg?seed=broccoli",
          "https://api.dicebear.com/7.x/bottts/svg?seed=tomato",
          "https://api.dicebear.com/7.x/bottts/svg?seed=potato",
          "https://api.dicebear.com/7.x/bottts/svg?seed=onion",
          "https://api.dicebear.com/7.x/bottts/svg?seed=pepper",
          "https://api.dicebear.com/7.x/bottts/svg?seed=lemon",
          "https://api.dicebear.com/7.x/bottts/svg?seed=cherry",
          "https://api.dicebear.com/7.x/bottts/svg?seed=grape",
          "https://api.dicebear.com/7.x/bottts/svg?seed=mango",
          "https://api.dicebear.com/7.x/bottts/svg?seed=kiwi",
          "https://api.dicebear.com/7.x/bottts/svg?seed=avocado",
          "https://api.dicebear.com/7.x/bottts/svg?seed=melon",
          "https://api.dicebear.com/7.x/bottts/svg?seed=pear",
          "https://api.dicebear.com/7.x/bottts/svg?seed=peach",
          "https://api.dicebear.com/7.x/bottts/svg?seed=plum",
          "https://api.dicebear.com/7.x/bottts/svg?seed=coconut",
          "https://api.dicebear.com/7.x/bottts/svg?seed=pumpkin"
      };

      for (String url : urls) {
        if (profilePictureRepository.findByUrl(url) == null) {
          ProfilePicture profilePicture = new ProfilePicture();
          profilePicture.setUrl(url);
          profilePictureRepository.save(profilePicture);
        }
      }
    };
  }

  @Bean
  @Order(3)
  CommandLineRunner seedUsers(
      UserService userService,
      UserRepository userRepository,
      ProfilePictureRepository profilePictureRepository,
      SpecialityRepository specialityRepository,
      TeamRepository teamRepository,
      TeamMembershipRepository teamMembershipRepository) {
    return args -> {
      final Team teamAlpha = findOrCreateTeam(teamRepository, TEAM_ALPHA);
      final Team teamOmega = findOrCreateTeam(teamRepository, TEAM_OMEGA);
      final Team teamIota = findOrCreateTeam(teamRepository, TEAM_IOTA);
      final Team teamEpsilon = findOrCreateTeam(teamRepository, TEAM_EPSILON);

      User lea = userRepository.findByEmail("lea@mail.com");
      if (lea == null) {
        lea = userService.createOne(
            "lea@mail.com",
            DEFAULT_PASSWORD,
            true,
            "Lynx",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=apple"),
            requireSpeciality(specialityRepository, "Tacticien")
        );
      }

      User tom = userRepository.findByEmail("tom@mail.com");
      if (tom == null) {
        tom = userService.createOne(
            "tom@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Rogue",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=banana"),
            requireSpeciality(specialityRepository, "Executeur")
        );
      }
      tom.setDate(LocalDate.parse("2025-12-03"));
      tom.setTeam(teamAlpha);
      userRepository.save(tom);

      User ines = userRepository.findByEmail("ines@mail.com");
      if (ines == null) {
        ines = userService.createOne(
            "ines@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Pulse",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=carrot"),
            requireSpeciality(specialityRepository, "Guérisseur")
        );
      }
      ines.setAdmin(true);
      ines.setDate(LocalDate.parse("2026-01-18"));
      ines.setTeam(teamAlpha);
      userRepository.save(ines);

      User tibo = userRepository.findByEmail("tibo@mail.com");
      if (tibo == null) {
        tibo = userService.createOne(
            "tibo@mail.com",
            DEFAULT_PASSWORD,
            true,
            "Iron",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=broccoli"),
            requireSpeciality(specialityRepository, "Gardien")
        );
      }
      tibo.setAdmin(true);
      tibo.setDate(LocalDate.parse("2025-10-27"));
      tibo.setTeam(teamOmega);
      tibo = userRepository.save(tibo);

      teamAlpha.setManager(lea);
      teamAlpha.setSecondManager(null);
      teamRepository.save(teamAlpha);
      lea.setTeam(teamAlpha);
      userRepository.save(lea);

      final Long tiboId = tibo.getId();
      teamRepository.findAll().forEach(t -> {
        if (t.getManager() != null
            && t.getManager().getId().equals(tiboId)
            && !t.getId().equals(teamOmega.getId())) {
          t.setManager(null);
          teamRepository.save(t);
        }
      });
      teamOmega.setManager(tibo);
      teamOmega.setSecondManager(null);
      teamRepository.save(teamOmega);

      if (teamMembershipRepository.findByTeamAndMember(teamAlpha, tom).isEmpty()) {
        TeamMembership tomMembership = new TeamMembership();
        tomMembership.setMember(tom);
        tomMembership.setTeam(teamAlpha);
        tomMembership.setStatus(MembershipStatus.ACCEPTED);
        teamMembershipRepository.save(tomMembership);
      }

      if (teamMembershipRepository.findByTeamAndMember(teamAlpha, ines).isEmpty()) {
        TeamMembership inesMembership = new TeamMembership();
        inesMembership.setMember(ines);
        inesMembership.setTeam(teamAlpha);
        inesMembership.setStatus(MembershipStatus.ACCEPTED);
        teamMembershipRepository.save(inesMembership);
      }

      User lisa = userRepository.findByEmail("lisa@mail.com");
      if (lisa == null) {
        lisa = userService.createOne(
            "lisa@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Storm",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=tomato"),
            requireSpeciality(specialityRepository, "Executeur")
        );
      }
      lisa.setDate(LocalDate.parse("2026-01-10"));
      lisa.setTeam(teamIota);
      lisa = userRepository.save(lisa);

      User noa = userRepository.findByEmail("noa@mail.com");
      if (noa == null) {
        noa = userService.createOne(
            "noa@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Flash",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=potato"),
            requireSpeciality(specialityRepository, "Architecte")
        );
      }
      noa.setDate(LocalDate.parse("2026-02-02"));
      noa.setTeam(teamIota);
      noa = userRepository.save(noa);

      User tim = userRepository.findByEmail("tim@mail.com");
      if (tim == null) {
        tim = userService.createOne(
            "tim@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Titi",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=onion"),
            requireSpeciality(specialityRepository, "Gardien")
        );
      }
      tim.setDate(LocalDate.parse("2026-02-03"));
      tim.setTeam(teamIota);
      userRepository.save(tim);

      User zoe = userRepository.findByEmail("zoe@mail.com");
      if (zoe == null) {
        zoe = userService.createOne(
            "zoe@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Vector",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=pepper"),
            requireSpeciality(specialityRepository, "Catalyseur")
        );
      }
      zoe.setDate(LocalDate.parse("2026-02-04"));
      zoe.setTeam(teamIota);
      userRepository.save(zoe);

      teamIota.setManager(lisa);
      teamIota.setSecondManager(noa);
      teamRepository.save(teamIota);

      for (User member : new User[]{lisa, noa, tim, zoe}) {
        if (teamMembershipRepository.findByTeamAndMember(teamIota, member).isEmpty()) {
          TeamMembership membership = new TeamMembership();
          membership.setMember(member);
          membership.setTeam(teamIota);
          membership.setStatus(MembershipStatus.ACCEPTED);
          teamMembershipRepository.save(membership);
        }
      }

      User max = userRepository.findByEmail("max@mail.com");
      if (max == null) {
        max = userService.createOne(
            "max@mail.com",
            DEFAULT_PASSWORD,
            false,
            "Nova",
            requireProfilePicture(
                profilePictureRepository,
                "https://api.dicebear.com/7.x/bottts/svg?seed=lemon"),
            requireSpeciality(specialityRepository, "Perturbateur")
        );
      }
      max.setDate(LocalDate.parse("2026-01-15"));
      max.setTeam(teamEpsilon);
      max = userRepository.save(max);

      teamEpsilon.setManager(max);
      teamRepository.save(teamEpsilon);

      if (teamMembershipRepository.findByTeamAndMember(teamEpsilon, max).isEmpty()) {
        TeamMembership maxMembership = new TeamMembership();
        maxMembership.setMember(max);
        maxMembership.setTeam(teamEpsilon);
        maxMembership.setStatus(MembershipStatus.ACCEPTED);
        teamMembershipRepository.save(maxMembership);
      }
    };
  }

  @Bean
  @Order(4)
  CommandLineRunner seedTournaments(
      TournamentRepository tournamentRepository,
      TournamentRegistrationRepository tournamentRegistrationRepository,
      TeamRepository teamRepository) {
    return args -> {
      if (tournamentRepository.count() == 0) {
        final Team teamAlpha = findOrCreateTeam(teamRepository, TEAM_ALPHA);
        final Team teamOmega = findOrCreateTeam(teamRepository, TEAM_OMEGA);
        final Team teamIota = findOrCreateTeam(teamRepository, "TEAM_IOTA");
        final Team teamEpsilon = findOrCreateTeam(teamRepository, TEAM_EPSILON);
        final Team teamDelta = findOrCreateTeam(teamRepository, "TEAM_DELTA");
        final Team teamSigma = findOrCreateTeam(teamRepository, "TEAM_SIGMA");
        final Team teamNova = findOrCreateTeam(teamRepository, "TEAM_NOVA");
        final Team teamZeta = findOrCreateTeam(teamRepository, "TEAM_ZETA");
        final Team teamKappa = findOrCreateTeam(teamRepository, "TEAM_KAPPA");
        final Team teamLambda = findOrCreateTeam(teamRepository, "TEAM_LAMBDA");
        final Team teamPhi = findOrCreateTeam(teamRepository, "TEAM_PHI");
        final Team teamPsi = findOrCreateTeam(teamRepository, "TEAM_PSI");
        final Team teamChi = findOrCreateTeam(teamRepository, "TEAM_CHI");
        final Team teamTau = findOrCreateTeam(teamRepository, "TEAM_TAU");
        final Team teamRho = findOrCreateTeam(teamRepository, "TEAM_RHO");

        // --- Spring Arena Cup 2025 (8 places, 7 inscrites, winner: TEAM_OMEGA) ---
        Tournament springArena = new Tournament();
        springArena.setName("Spring Arena Cup 2025");
        springArena.setDescription(
            "Compétition printanière ouverte aux nouvelles teams émergentes");
        springArena.setStartDate(LocalDate.of(2025, 4, 15));
        springArena.setEndDate(LocalDate.of(2025, 4, 25));
        springArena.setStartInscriptionDate(LocalDate.of(2025, 3, 10));
        springArena.setEndInscriptionDate(LocalDate.of(2025, 4, 10));
        springArena.setMaxTeams(8);
        springArena.setState(State.FINISHED);
        springArena.setWinner("TEAM_OMEGA");
        tournamentRepository.save(springArena);
        for (Team t : new Team[]{teamOmega, teamAlpha, teamIota, teamDelta,
            teamSigma, teamNova, teamZeta}) {
          registerTeam(tournamentRegistrationRepository, springArena, t);
        }

        // --- Elite Championship 2025 (8 places, 6 inscrites, winner: TEAM_IOTA) ---
        Tournament elite2025 = new Tournament();
        elite2025.setName("Elite Championship 2025");
        elite2025.setDescription("Compétition élite réservée aux meilleures teams");
        elite2025.setStartDate(LocalDate.of(2025, 5, 15));
        elite2025.setEndDate(LocalDate.of(2025, 5, 30));
        elite2025.setStartInscriptionDate(LocalDate.of(2025, 4, 11));
        elite2025.setEndInscriptionDate(LocalDate.of(2025, 5, 11));
        elite2025.setMaxTeams(8);
        elite2025.setState(State.FINISHED);
        elite2025.setWinner("TEAM_IOTA");
        tournamentRepository.save(elite2025);
        for (Team t : new Team[]{teamIota, teamAlpha, teamOmega, teamDelta,
            teamSigma, teamNova}) {
          registerTeam(tournamentRegistrationRepository, elite2025, t);
        }

        // --- Summer Pro League 2025 (16 places, 14 inscrites, winner: TEAM_IOTA) ---
        Tournament summerPro = new Tournament();
        summerPro.setName("Summer Pro League 2025");
        summerPro.setDescription(
            "Tournoi estival de haut niveau avec les meilleures teams");
        summerPro.setStartDate(LocalDate.of(2025, 7, 1));
        summerPro.setEndDate(LocalDate.of(2025, 7, 15));
        summerPro.setStartInscriptionDate(LocalDate.of(2025, 5, 25));
        summerPro.setEndInscriptionDate(LocalDate.of(2025, 6, 25));
        summerPro.setMaxTeams(16);
        summerPro.setState(State.FINISHED);
        summerPro.setWinner("TEAM_IOTA");
        tournamentRepository.save(summerPro);
        for (Team t : new Team[]{teamIota, teamAlpha, teamOmega, teamDelta,
            teamSigma, teamNova, teamZeta, teamKappa, teamLambda,
            teamPhi, teamPsi, teamChi, teamTau, teamRho}) {
          registerTeam(tournamentRegistrationRepository, summerPro, t);
        }

        // --- Vinci Winter Clash 2026 (12 places, 12 inscrites, winner: TEAM_ALPHA) ---
        Tournament vinciWinter = new Tournament();
        vinciWinter.setName("Vinci Winter Clash 2026");
        vinciWinter.setDescription(
            "Tournoi hivernal réunissant des équipes semi-professionnelles");
        vinciWinter.setStartDate(LocalDate.of(2026, 1, 10));
        vinciWinter.setEndDate(LocalDate.of(2026, 1, 20));
        vinciWinter.setStartInscriptionDate(LocalDate.of(2025, 12, 5));
        vinciWinter.setEndInscriptionDate(LocalDate.of(2026, 1, 5));
        vinciWinter.setMaxTeams(12);
        vinciWinter.setState(State.FINISHED);
        vinciWinter.setWinner("TEAM_ALPHA");
        tournamentRepository.save(vinciWinter);
        for (Team t : new Team[]{teamAlpha, teamOmega, teamIota, teamDelta,
            teamSigma, teamNova, teamZeta, teamKappa, teamLambda,
            teamPhi, teamPsi, teamChi}) {
          registerTeam(tournamentRegistrationRepository, vinciWinter, t);
        }

        // --- Spring Battle Series 2026 (8 places, 8 inscrites, ONGOING) ---
        Tournament springBattle = new Tournament();
        springBattle.setName("Spring Battle Series 2026");
        springBattle.setDescription(
            "Série printanière avec élimination directe et forte participation");
        springBattle.setStartDate(LocalDate.of(2026, 4, 4));
        springBattle.setEndDate(LocalDate.of(2026, 4, 11));
        springBattle.setStartInscriptionDate(LocalDate.of(2026, 3, 1));
        springBattle.setEndInscriptionDate(LocalDate.of(2026, 4, 1));
        springBattle.setMaxTeams(8);
        springBattle.setState(State.ONGOING);
        tournamentRepository.save(springBattle);
        for (Team t : new Team[]{teamAlpha, teamOmega, teamIota, teamDelta,
            teamSigma, teamNova, teamZeta, teamKappa}) {
          registerTeam(tournamentRegistrationRepository, springBattle, t);
        }

        // --- Vinci Easter Cup 2026 (8 places, 7 inscrites, PLANIFIED) ---
        Tournament vinciEaster = new Tournament();
        vinciEaster.setName("Vinci Easter Cup 2026");
        vinciEaster.setDescription(
            "Tournoi de Pâques ouvert à toutes les teams actives");
        vinciEaster.setStartDate(LocalDate.of(2026, 4, 15));
        vinciEaster.setEndDate(LocalDate.of(2026, 4, 25));
        vinciEaster.setStartInscriptionDate(LocalDate.of(2026, 3, 8));
        vinciEaster.setEndInscriptionDate(LocalDate.of(2026, 4, 8));
        vinciEaster.setMaxTeams(8);
        vinciEaster.setState(State.PLANIFIED);
        tournamentRepository.save(vinciEaster);
        for (Team t : new Team[]{teamEpsilon, teamIota, teamDelta,
            teamSigma, teamNova, teamZeta, teamKappa}) {
          registerTeam(tournamentRegistrationRepository, vinciEaster, t);
        }

        // --- Elite Championship 2026 (16 places, 14 inscrites, PLANIFIED) ---
        Tournament elite2026 = new Tournament();
        elite2026.setName("Elite Championship 2026");
        elite2026.setDescription("Compétition élite réservée aux meilleures teams");
        elite2026.setStartDate(LocalDate.of(2026, 5, 15));
        elite2026.setEndDate(LocalDate.of(2026, 5, 30));
        elite2026.setStartInscriptionDate(LocalDate.of(2026, 4, 11));
        elite2026.setEndInscriptionDate(LocalDate.of(2026, 5, 11));
        elite2026.setMaxTeams(16);
        elite2026.setState(State.PLANIFIED);
        tournamentRepository.save(elite2026);
        for (Team t : new Team[]{teamAlpha, teamOmega, teamIota, teamDelta,
            teamSigma, teamNova, teamZeta, teamKappa, teamLambda,
            teamPhi, teamPsi, teamChi, teamTau, teamRho}) {
          registerTeam(tournamentRegistrationRepository, elite2026, t);
        }
      }
    };
  }

  private static void registerTeam(
      TournamentRegistrationRepository repo, Tournament tournament, Team team) {
    TournamentRegistration registration = new TournamentRegistration();
    registration.setTournament(tournament);
    registration.setTeam(team);
    repo.save(registration);
  }

  private static Team findOrCreateTeam(TeamRepository teamRepository, String name) {
    return teamRepository.findByNameIgnoreCase(name).orElseGet(() -> {
      Team team = new Team();
      team.setName(name);
      return teamRepository.save(team);
    });
  }

  private static Speciality requireSpeciality(
      SpecialityRepository specialityRepository,
      String name) {
    Speciality speciality = specialityRepository.findByName(name);
    if (speciality == null) {
      throw new IllegalStateException("Missing speciality: " + name);
    }
    return speciality;
  }

  private static ProfilePicture requireProfilePicture(
      ProfilePictureRepository profilePictureRepository,
      String url) {
    ProfilePicture profilePicture = profilePictureRepository.findByUrl(url);
    if (profilePicture == null) {
      throw new IllegalStateException("Missing profile picture: " + url);
    }
    return profilePicture;
  }
}

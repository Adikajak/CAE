package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.ProfilePicture;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ProfilePictureRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;

import be.vinci.ipl.cae.demo.services.UserService;
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

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }

  @Bean
  @Order(1)
  CommandLineRunner seedSpecialities(SpecialityRepository specialityRepository) {
    return args -> {
      String[] names = {
          "Architecte", "Executeur", "Tacticien", "Gardien", "Catalyseur",
          "Perturbateur", "Guerrisseur"
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
      TeamRepository teamRepository) {
    return args -> {
      if (userRepository.findByEmail("lea@mail.com") != null) {
        return;
      }

      Team teamAlpha = findOrCreateTeam(teamRepository, TEAM_ALPHA);
      Team teamOmega = findOrCreateTeam(teamRepository, TEAM_OMEGA);

      User lea = userService.createOne(
          "lea@mail.com",
          DEFAULT_PASSWORD,
          false,
          "Lynx",
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=apple"),
          requireSpeciality(specialityRepository, "Tacticien")
      );

      User tom = userService.createOne(
          "tom@mail.com",
          DEFAULT_PASSWORD,
          false,
          "Rogue",
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=banana"),
          requireSpeciality(specialityRepository, "Executeur")
      );
      tom.setDate(LocalDate.parse("2025-12-03"));
      tom.setTeam(teamAlpha);
      userRepository.save(tom);

      User ines = userService.createOne(
          "ines@mail.com",
          DEFAULT_PASSWORD,
          true,
          "Pulse",
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=carrot"),
          requireSpeciality(specialityRepository, "Guerrisseur")
      );
      ines.setDate(LocalDate.parse("2026-01-18"));
      ines.setTeam(teamAlpha);
      userRepository.save(ines);

      User tibo = userService.createOne(
          "tibo@mail.com",
          DEFAULT_PASSWORD,
          true,
          "Iron",
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=broccoli"),
          requireSpeciality(specialityRepository, "Gardien")
      );
      tibo.setDate(LocalDate.parse("2025-10-27"));
      tibo.setTeam(teamOmega);
      tibo = userRepository.save(tibo);

      teamAlpha.setManager(lea);
      teamAlpha.setSecondManager(null);
      teamRepository.save(teamAlpha);

      teamOmega.setManager(tibo);
      teamOmega.setSecondManager(null);
      teamRepository.save(teamOmega);
    };
  }

  private static Team findOrCreateTeam(TeamRepository teamRepository, String name) {
    return teamRepository.findByName(name).orElseGet(() -> {
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

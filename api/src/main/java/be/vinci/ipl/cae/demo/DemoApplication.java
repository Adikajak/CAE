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
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
      UserRepository userRepository,
      ProfilePictureRepository profilePictureRepository,
      SpecialityRepository specialityRepository,
      TeamRepository teamRepository,
      BCryptPasswordEncoder passwordEncoder) {
    return args -> {
      Team teamAlpha = findOrCreateTeam(teamRepository, TEAM_ALPHA);
      Team teamOmega = findOrCreateTeam(teamRepository, TEAM_OMEGA);

      User lea = saveUser(
          userRepository,
          passwordEncoder,
          "lea@mail.com",
          "Lynx",
          requireSpeciality(specialityRepository, "Tacticien"),
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=apple"),
          LocalDate.parse("2025-11-12"),
          false,
          teamAlpha);

      saveUser(
          userRepository,
          passwordEncoder,
          "tom@mail.com",
          "Rogue",
          requireSpeciality(specialityRepository, "Executeur"),
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=banana"),
          LocalDate.parse("2025-12-03"),
          false,
          teamAlpha);

      saveUser(
          userRepository,
          passwordEncoder,
          "ines@mail.com",
          "Pulse",
          requireSpeciality(specialityRepository, "Guerrisseur"),
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=carrot"),
          LocalDate.parse("2026-01-18"),
          true,
          teamAlpha);

      User tibo = saveUser(
          userRepository,
          passwordEncoder,
          "tibo@mail.com",
          "Iron",
          requireSpeciality(specialityRepository, "Gardien"),
          requireProfilePicture(
              profilePictureRepository,
              "https://api.dicebear.com/7.x/bottts/svg?seed=broccoli"),
          LocalDate.parse("2025-10-27"),
          true,
          teamOmega);

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

  private static User saveUser(
      UserRepository userRepository,
      BCryptPasswordEncoder passwordEncoder,
      String email,
      String tag,
      Speciality speciality,
      ProfilePicture profilePicture,
      LocalDate date,
      boolean isAdmin,
      Team team) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      user = new User();
      user.setEmail(email);
    }

    user.setTag(tag);
    user.setSpeciality(speciality);
    user.setProfilePicture(profilePicture);
    user.setDate(date);
    user.setAdmin(isAdmin);
    user.setTeam(team);

    if (user.getPassword() == null || !passwordEncoder.matches(DEFAULT_PASSWORD, user.getPassword())) {
      user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
    }

    return userRepository.save(user);
  }
}


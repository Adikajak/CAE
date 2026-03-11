package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.ProfilePicture;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.repositories.ProfilePictureRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class DemoApplication {

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }

  @Bean
  CommandLineRunner seedSpecialities(SpecialityRepository specialityRepository) {
    return args -> {
      String[] names = {
          "Architecte", "Executeur", "Tacticien", "Gardien", "Catalyseur", "Perturbateur", "Guerrisseur"
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
}
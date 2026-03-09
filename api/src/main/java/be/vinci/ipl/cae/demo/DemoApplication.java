package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Speciality;
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
          "Archer", "Assassin", "Mage", "Guerrier", "Clerc", "Paladin", "Rodeur"
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
}
package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Speciality;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Speciality repository.
 */
@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {

  /**
   * Find a speciality by its name.
   *
   * @param name the speciality name
   * @return the speciality
   */
  Speciality findByName(String name);
}

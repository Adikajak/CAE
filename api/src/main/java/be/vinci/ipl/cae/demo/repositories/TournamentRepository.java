package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.enums.State;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Tournament repository.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {
  /**
   * Finds tournaments by state.
   *
   * @param state the state filter
   * @return the matching tournaments
   */
  List<Tournament> findByState(State state);

  /**
   * Finds a tournament by name, case-insensitive.
   *
   * @param name the tournament name
   * @return the matching tournament if found
   */
  Optional<Tournament> findByNameIgnoreCase(String name);
}

package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {

  /**
   * Find a user by its email.
   *
   * @param email the email
   * @return the user
   */
  User findByEmail(String email);

  /**
   * Checks if a user with the given tag already exists in the specified team.
   *
   * @param team the team to check
   * @param tag the tag to check for uniqueness
   * @return true if a user with the given tag exists in the team, false otherwise
   */
  boolean existsByTeamAndTag(Team team, String tag);
}

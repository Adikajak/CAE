package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

/**
 * Administration service.
 */
@Service
public class AdministrationService {

  private final UserRepository userRepository;

  /**
   * Administration Service ctor.
   *
   * @param userRepository the user repository
   */
  public AdministrationService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Iterable<User> getAllAdmins() {
    return userRepository.findAllByIsAdminTrue();
  }

  /**
   * Get all non-admin users.
   *
   * @return all non-admin users
   */
  public Iterable<User> getAllNonAdmins() {
    return userRepository.findAllByIsAdminFalse();
  }

  /**
   * Promote a user to admin.
   *
   * @param userId the user id
   * @return true if the user was promoted, false if the user does not exist
   */
  public boolean promoteToAdmin(Long userId) {
    var user = userRepository.findById(userId);
    if (user.isEmpty()) {
      return false;
    }
    User userEntity = user.get();
    if (userEntity.isAdmin()) {
      return false;
    }
    userEntity.setAdmin(true);
    userRepository.save(userEntity);
    return true;
  }
}

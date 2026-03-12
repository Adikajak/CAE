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
}

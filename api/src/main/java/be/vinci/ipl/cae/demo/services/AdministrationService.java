package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

/**
 * Administration service.
 */
@Service
public class AdministrationService {

  private final UserRepository userRepository;
  private final NotificationService notificationService;

  /**
   * Administration Service ctor.
   *
   * @param userRepository the user repository
   */
  public AdministrationService(UserRepository userRepository,
                               NotificationService notificationService) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
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

    NotificationDto notificationDto = new NotificationDto();
    notificationDto.setUserId(userEntity.getId());
    notificationDto.setObject("Vous avez été promu administrateur !");
    notificationDto.setMessage("Votre compte a été promu au rang d'administrateur. "
        + "Un grand pouvoir implique de grandes responsabilités :)");
    notificationDto.setType(NotificationType.GENERAL);
    notificationService.createNotification(notificationDto);
    return true;
  }
}

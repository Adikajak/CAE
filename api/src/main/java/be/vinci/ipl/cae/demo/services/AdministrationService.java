package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.Optional;
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
   * Local enum for notification type to send based on the admin action.
   */
  private enum ActionType {
    DEMOTED,
    PROMOTED,
    // Defensive value to keep the default branch testable and future-proof.
    UNKNOWN
  }

  /**
   * Promote a user to admin.
   *
   * @param userId the user id
   * @return true if the user was promoted, false if the user does not exist
   */
  public boolean promoteToAdmin(Long userId) {
    Optional<User> user = userRepository.findById(userId);
    if (user.isEmpty()) {
      return false;
    }

    User userEntity = user.get();
    if (userEntity.isAdmin()) {
      return false;
    }

    userEntity.setAdmin(true);
    userRepository.save(userEntity);

    sendNotification(ActionType.PROMOTED, userEntity);
    return true;
  }

  /**
   * Demote an admin user to regular member.
   * If the caller is demoting themselves, there must be at least one other admin.
   *
   * @param userId   the user id to demote
   * @param callerId the id of the authenticated admin performing the action
   * @return true if the user was demoted, false if the user does not exist or is not admin
   * @throws IllegalStateException if the caller tries to demote themselves and is the last admin
   */
  public boolean demoteFromAdmin(Long userId, Long callerId) {
    Optional<User> user = userRepository.findById(userId);
    if (user.isEmpty()) {
      return false;
    }

    User userEntity = user.get();
    if (!userEntity.isAdmin()) {
      return false;
    }

    if (userId.equals(callerId)) {
      long adminCount = userRepository.countByIsAdminTrue();
      if (adminCount <= 1) {
        throw new IllegalStateException("Cannot demote yourself when you are the last admin");
      }
    }

    userEntity.setAdmin(false);
    userRepository.save(userEntity);

    sendNotification(ActionType.DEMOTED, userEntity);
    return true;
  }

  private void sendNotification(ActionType type, User user) {
    NotificationDto notificationDto = new NotificationDto();

    switch (type) {
      case PROMOTED -> {
        notificationDto.setObject("Vous avez été promu administrateur !");
        notificationDto.setMessage("Votre compte a été promu au rang d'administrateur. "
            + "Un grand pouvoir implique de grandes responsabilités :)");
      }
      case DEMOTED -> {
        notificationDto.setObject("Vous avez été rétrogradé.");
        notificationDto.setMessage("Votre statut d'administrateur a été révoqué.");
      }
      default -> throw new IllegalStateException("ActionType inattendu: " + type);
    }

    notificationDto.setType(NotificationType.GENERAL);
    notificationService.createNotification(user, notificationDto);
  }
}

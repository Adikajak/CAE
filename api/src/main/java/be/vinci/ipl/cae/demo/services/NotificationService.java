package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service qui va eter utilise pour request http.
 */
@Service
public class NotificationService {

  private final NotificationRepository repository;
  private final UserRepository userRepository;

  /**
   * A normal constructeur.
   *
   * @param repository the NotificationRepository to inject
   * @param userRepository the UserRepository to inject
   */
  public NotificationService(NotificationRepository repository,
      UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  /**
   * ALL notifications for a specific user.
   *
   * @param userId the user id
   * @return Iterable of Notification objects for the user
   */
  public Iterable<Notification> getNotificationsForUser(Long userId) {
    return repository.findByUserIdOrderByCreatedAtDesc(userId);
  }

  /**
   * Notification by id.
   *
   * @param notificationId the notification id
   * @param userId the user id
   * @return Optional of Notification object
   */
  public Optional<Notification> getNotificationById(Long notificationId,
      Long userId) {
    return repository.findByNotificationIdAndUserId(notificationId, userId);
  }

  /**
   * Mark notification as read - logic.
   *
   * @param notificationId the notification id
   */
  public void markNotificationAsRead(Long notificationId) {
    Notification notif = repository.findById(notificationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    notif.setIsRead(true);
    repository.save(notif);
  }

  /**
   * Create a new notification.
   *
   * @param notificationDto the notification data
   * @return the created Notification
   */
  public Notification createNotification(NotificationDto notificationDto) {
    User user = userRepository.findById(notificationDto.getUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    Notification notif = new Notification();
    notif.setUser(user);
    notif.setObject(notificationDto.getObject());
    notif.setMessage(notificationDto.getMessage());

    return repository.save(notif);
  }

  /**
   * Update notification.
   *
   * @param id the notification id
   * @param notificationDto the notification data
   * @return the updated Notification
   */
  public Notification updateNotification(Long id,
      NotificationDto notificationDto) {
    Notification notif = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    notif.setObject(notificationDto.getObject());
    notif.setMessage(notificationDto.getMessage());

    return repository.save(notif);
  }
}

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
 * Service for managing notification-related HTTP requests.
 */
@Service
public class NotificationService {

  private final NotificationRepository repository;
  private final UserRepository userRepository;

  /**
   * Constructor for NotificationService.
   *
   * @param repository     the notification repository
   * @param userRepository the user repository
   */
  public NotificationService(NotificationRepository repository, UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  /**
   * Get all notifications for a specific user.
   *
   * @param userId the user ID
   * @return list of notifications
   */
  public Iterable<Notification> getNotificationsForUser(Long userId) {
    return repository.findByUserIdOrderByCreatedAtDesc(userId);
  }

  /**
   * Get a notification by its ID and user ID.
   *
   * @param notificationId the notification ID
   * @param userId         the user ID
   * @return the notification if found
   */
  public Optional<Notification> getNotificationById(Long notificationId, Long userId) {
    return repository.findByNotificationIdAndUserId(notificationId, userId);
  }

  /**
   * Mark a notification as read.
   *
   * @param notificationId the notification ID
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
   * @return the created notification
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
   * Update an existing notification.
   *
   * @param id              the notification ID
   * @param notificationDto the updated data
   * @return the updated notification
   */
  public Notification updateNotification(Long id, NotificationDto notificationDto) {
    Notification notif = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    notif.setObject(notificationDto.getObject());
    notif.setMessage(notificationDto.getMessage());

    return repository.save(notif);
  }
}
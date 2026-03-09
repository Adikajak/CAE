package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository for Notification entities.
 */
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Find notifications by user ID ordered by creation date descending.
   *
   * @param userId the user ID
   * @return list of notifications
   */
  Iterable<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

  /**
   * Find a notification by its ID and user ID.
   *
   * @param notificationId the notification ID
   * @param userId         the user ID
   * @return the notification if found
   */
  Optional<Notification> findByNotificationIdAndUser_Id(Long notificationId, Long userId);
}
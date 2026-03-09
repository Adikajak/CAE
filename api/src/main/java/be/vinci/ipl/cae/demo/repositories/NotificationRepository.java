package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

/**
 * Notification Repository.
 */
public interface NotificationRepository extends CrudRepository<Notification,
    Long> {

  /**
   * Find by user ID (through the relation) and order by createdAt descending.
   *
   * @param userId the user id
   * @return Iterable of Notification for the user
   */
  Iterable<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

  /**
   * Find by notification ID and user ID.
   *
   * @param notificationId the notification id
   * @param userId the user id
   * @return Optional of Notification
   */
  Optional<Notification> findByNotificationIdAndUserId(Long notificationId,
      Long userId);
}

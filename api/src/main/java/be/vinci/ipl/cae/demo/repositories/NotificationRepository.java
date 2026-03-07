package be.vinci.ipl.cae.demo.repositories;

import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

/**
 * Notification Repository.
 * */
public interface NotificationRepository extends CrudRepository<Notification,
    Long> {

  /** Find by user ID (through the relation) and order by createdAt descending. */
  Iterable<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

  /** Find by notification ID and user ID. */
  Optional<Notification> findByNotificationIdAndUserId(Long notificationId,
      Long userId);
}

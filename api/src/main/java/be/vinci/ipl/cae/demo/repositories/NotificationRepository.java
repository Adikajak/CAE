package be.vinci.ipl.cae.demo.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import be.vinci.ipl.cae.demo.models.entities.Notification;


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

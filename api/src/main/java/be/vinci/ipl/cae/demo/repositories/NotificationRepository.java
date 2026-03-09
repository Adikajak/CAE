package be.vinci.ipl.cae.demo.repositories;

<<<<<<< HEAD

<<<<<<< HEAD
import org.springframework.data.repository.CrudRepository;
=======
>>>>>>> 010307b (fix: checkStyle Google version 5)
import java.util.Optional;

import be.vinci.ipl.cae.demo.models.entities.Notification;

=======
>>>>>>> 8d740ce (refactor: reorganize imports and enhance documentation in service and controller classes)
import be.vinci.ipl.cae.demo.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;


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

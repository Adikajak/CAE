package be.vinci.ipl.cae.demo.repositories;


import be.vinci.ipl.cae.demo.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

/**
 * Notification Repository.
 * */
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /** Find by user ID (through the relation) and order by createdAt descending. */
  Iterable<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

  /** Find by notification ID and user ID. */
  Optional<Notification> findByNotificationIdAndUser_Id(Long notificationId, Long userId);
}

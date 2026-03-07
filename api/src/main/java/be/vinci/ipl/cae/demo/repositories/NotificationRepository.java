package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;

public interface NotificationRepository extends CrudRepository<Notification,Long> {

  /**
   * Find by user id order by created at desc -> Default option
   * **/
  Iterable<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);


}

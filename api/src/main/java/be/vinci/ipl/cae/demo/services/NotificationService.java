package be.vinci.ipl.cae.demo.services;

<<<<<<< HEAD
import java.util.Optional;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD

/**
 * Service qui va etre utilise pour request http.
=======
=======

=======
>>>>>>> 010307b (fix: checkStyle Google version 5)
import java.util.Optional;

>>>>>>> 3b1a152 (fix: checkStyle Google version 4)
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
=======
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
>>>>>>> 8d740ce (refactor: reorganize imports and enhance documentation in service and controller classes)

/**
 * service qui va etre utilise pour request http.
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
 * */
@Service
public class NotificationService {

  private final NotificationRepository repository;
  private final UserRepository userRepository;

<<<<<<< HEAD
  /** 
   * A normal constructeur. 
   * */
  public NotificationService(NotificationRepository repository,
      UserRepository userRepository) {
=======
  /** a normal constructeur. */
<<<<<<< HEAD
  public NotificationService(NotificationRepository repository, UserRepository userRepository) {
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
=======
  public NotificationService(NotificationRepository repository,
      UserRepository userRepository) {
>>>>>>> 010307b (fix: checkStyle Google version 5)
    this.repository = repository;
    this.userRepository = userRepository;
  }

<<<<<<< HEAD
  /** 
   * ALL notifications for a specific user. 
   * */
=======
  /** ALL notifications for a specific user. */
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
  public Iterable<Notification> getNotificationsForUser(Long userId) {
    return repository.findByUserIdOrderByCreatedAtDesc(userId);
  }

<<<<<<< HEAD
  /** 
   * Notification by id. 
   * */
  public Optional<Notification> getNotificationById(Long notificationId,
      Long userId) {
=======
  /** notification by id. */
<<<<<<< HEAD
  public Optional<Notification> getNotificationById(Long notificationId, Long userId) {
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
=======
  public Optional<Notification> getNotificationById(Long notificationId,
      Long userId) {
>>>>>>> 010307b (fix: checkStyle Google version 5)

    return repository.findByNotificationIdAndUserId(notificationId, userId);
  }

  /** 
   * Mark notification as read - logic. 
   * */
  public void markNotificationAsRead(Long notificationId) {
    Notification notif = repository.findById(notificationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    notif.setIsRead(true);
    repository.save(notif);
  }

  /** 
   * Create a new notification. 
   * */
  public Notification createNotification(NotificationDto notificationDto) {

    User user = userRepository.findById(notificationDto.getUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    Notification notif = new Notification();
    notif.setUser(user);
    notif.setObject(notificationDto.getObject());
    notif.setMessage(notificationDto.getMessage());

    return repository.save(notif);
  }

<<<<<<< HEAD
  /** 
   * Update notification. 
   * */
=======
  /** Update notification. */
>>>>>>> 010307b (fix: checkStyle Google version 5)
  public Notification updateNotification(Long id,
      NotificationDto notificationDto) {

    Notification notif = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    notif.setObject(notificationDto.getObject());
    notif.setMessage(notificationDto.getMessage());

    return repository.save(notif);
  }
}

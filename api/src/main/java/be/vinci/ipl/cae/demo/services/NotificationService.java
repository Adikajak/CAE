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
 * service qui va etre utilise pour request http
 * */
@Service
public class NotificationService {

  private final NotificationRepository repository;
  private final UserRepository userRepository;

  /** 
   * A normal constructeur. 
   * */
  public NotificationService(NotificationRepository repository, UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  /** 
   * ALL notifications for a specific user. 
   * */
  public Iterable<Notification> getNotificationsForUser(Long userId) {
    return repository.findByUser_IdOrderByCreatedAtDesc(userId);
  }

  /** 
   * Notification by id. 
   * */
  public Optional<Notification> getNotificationById(Long notificationId, Long userId) {
    return repository.findByNotificationIdAndUserId(notificationId, userId);
  }

  //mark notification as read - logic
  public void markNotificationAsRead(Long notificationId) {
    Notification notif = repository.findById(notificationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    notif.setIsRead(true);
    repository.save(notif);
  }

  //Create a new notification
  public Notification createNotification(NotificationDto notificationDTO) {

    User user = userRepository.findById(notificationDTO.getUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    Notification notif = new Notification();
    notif.setUser(user);
    notif.setObject(notificationDTO.getObject());
    notif.setMessage(notificationDTO.getMessage());

    return repository.save(notif);
  }

  /** 
   * Update notification. 
   * */
  public Notification updateNotification(Long id,
      NotificationDto notificationDto) {

    Notification notif = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    notif.setObject(notificationDTO.getObject());
    notif.setMessage(notificationDTO.getMessage());

    return repository.save(notif);
  }
}
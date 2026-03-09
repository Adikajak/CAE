package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * RestController pour /notifications/ et /notifications.
 * */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService service;

  /**
   * Constructor for NotificationController.
   *
   * @param service the NotificationService to inject
   */
  public NotificationController(NotificationService service) {
    this.service = service;
  }

  /**
   * GET all notifications for a user (it's the list).
   *
   * @return Iterable of Notification objects for the user
   */
  @GetMapping({"/", ""})
  public Iterable<Notification> getNotifications() {
    Long userId = 1L; // normally from logged-in user
    return service.getNotificationsForUser(userId);
  }


  /**
   * GET a single notification by id (it's the detailed one).
   *
   * @param notificationId the id of the notification
   * @return the Notification object
   */
  @GetMapping("/{id}")
  public Notification getNotification(@PathVariable Long notificationId) {
    Long userId = 1L;
    return service.getNotificationById(notificationId, userId)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );
  }


  /**
   * Mark a notification as read.
   *
   * @param id the id of the notification to mark as read
   */
  @PostMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable Long id) {
    service.markNotificationAsRead(id);
  }

  /**
   * CREATE notification.
   *
   * @param notification the NotificationDto to create
   * @return the created Notification object
   */
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
  public Notification createNotification(
      @Valid @RequestBody NotificationDto notification) {
    return service.createNotification(notification);
  }
}
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
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService service;

  /**
   * Constructor for NotificationController.
   *
   * @param service the notification service
   */
  public NotificationController(NotificationService service) {
    this.service = service;
  }

  /**
   * Get all notifications for the current user.
   *
   * @return list of notifications
   */
  @GetMapping({"/", ""})
  public Iterable<Notification> getNotifications() {
    Long userId = 1L;
    return service.getNotificationsForUser(userId);
  }

  /**
   * Get a single notification by its ID.
   *
   * @param id the notification ID
   * @return the notification
   */
  @GetMapping("/{id}")
  public Notification getNotification(@PathVariable Long id) {
    Long userId = 1L;
    return service.getNotificationById(id, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  /**
   * Mark a notification as read.
   *
   * @param id the notification ID
   */
  @PostMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable Long id) {
    service.markNotificationAsRead(id);
  }

  /**
   * Create a new notification.
   *
   * @param notification the notification data
   * @return the created notification
   */
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
  public Notification createNotification(@Valid @RequestBody NotificationDto notification) {
    return service.createNotification(notification);
  }
}
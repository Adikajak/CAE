package be.vinci.ipl.cae.demo.controllers;


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

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.NotificationService;

/**
 * RestController pour /notifications/ et /notifications.
 * */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService service;

  public NotificationController(NotificationService service) {
    this.service = service;
  }

<<<<<<< HEAD
  /** GET all notifications for a user (it's the list). */
=======
  // GET all notifications for a user (it's the list)
>>>>>>> 3c48d87 (fix: google StyleCheck)
  @GetMapping({"/", ""})
  public Iterable<Notification> getNotifications() {
    Long userId = 1L; // normally from logged-in user
    return service.getNotificationsForUser(userId);
  }


  /** GET a single notification by idNotif (it's the detailed one). */
  @GetMapping("/{id}")
  public Notification getNotification(@PathVariable Long notificationId) {

    Long userId = 1L;

    return service.getNotificationById(notificationId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }


<<<<<<< HEAD
  /**Optional: mark notification as read (like the button) idk if we want it to be like /read but idk how to do it. */
=======
  /**Optional: mark notification as read (like the button) idk if we want it to be like /read but idk how to do it */
>>>>>>> 3c48d87 (fix: google StyleCheck)
  @PostMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable Long id) {
    service.markNotificationAsRead(id);
  }

  /** CREATE notification /+_+/ \+_+\ . */
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
<<<<<<< HEAD
  public Notification createNotification(@Valid @RequestBody
  NotificationDto notification) {
=======
  public Notification createNotification(@Valid @RequestBody NotificationDto notification) {
>>>>>>> 3c48d87 (fix: google StyleCheck)

    return service.createNotification(notification);
  }
}

package be.vinci.ipl.cae.demo.controllers;

import jakarta.validation.Valid;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.NotificationService;
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  /** GET all notifications for a user (it's the list). */
=======
  // GET all notifications for a user (it's the list)
>>>>>>> 3c48d87 (fix: google StyleCheck)
=======
  /** GET all notifications for a user (it's the list) */
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
=======
  /** GET all notifications for a user (it's the list). */
>>>>>>> 3b1a152 (fix: checkStyle Google version 4)
=======
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  /**
   * GET all notifications for a user (it's the list).
   *
   * @return Iterable of Notification objects for the user
   */
<<<<<<< HEAD
>>>>>>> 9398c65 (fix: google CheckStyle version 6)
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  @GetMapping({"/", ""})
  public Iterable<Notification> getNotifications() {
    Long userId = 1L; // normally from logged-in user
    return service.getNotificationsForUser(userId);
  }


<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  /** GET a single notification by idNotif (it's the detailed one). */
=======
  /** GET a single notification by idNotif (it's the detailed one) */
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
=======
  /** GET a single notification by idNotif (it's the detailed one). */
>>>>>>> 3b1a152 (fix: checkStyle Google version 4)
=======
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  /**
   * GET a single notification by id (it's the detailed one).
   *
   * @param notificationId the id of the notification
   * @return the Notification object
   */
<<<<<<< HEAD
>>>>>>> 9398c65 (fix: google CheckStyle version 6)
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  @GetMapping("/{id}")
  public Notification getNotification(@PathVariable Long notificationId) {
    Long userId = 1L;
    return service.getNotificationById(notificationId, userId)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );
  }


<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  /**Optional: mark notification as read (like the button) idk if we want it to be like /read but idk how to do it. */
=======
  /**Optional: mark notification as read (like the button) idk if we want it to be like /read but idk how to do it */
>>>>>>> 3c48d87 (fix: google StyleCheck)
=======
  /**Optional: mark notification as read (like the button) idk if we want it to be like /read but idk how to do it. */
>>>>>>> 3b1a152 (fix: checkStyle Google version 4)
=======
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  /**
   * Mark a notification as read.
   *
   * @param id the id of the notification to mark as read
   */
<<<<<<< HEAD
>>>>>>> 8d740ce (refactor: reorganize imports and enhance documentation in service and controller classes)
=======
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
  @PostMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable Long id) {
    service.markNotificationAsRead(id);
  }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  /** CREATE notification /+_+/ \+_+\ . */
=======
  /** CREATE notification /+_+/ \+_+\ */
>>>>>>> 39d342a (fix: CheckStyle Google version 3)
=======
  /** CREATE notification /+_+/ \+_+\ . */
>>>>>>> 3b1a152 (fix: checkStyle Google version 4)
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
<<<<<<< HEAD
<<<<<<< HEAD
  public Notification createNotification(@Valid @RequestBody
  NotificationDto notification) {
=======
  public Notification createNotification(@Valid @RequestBody NotificationDto notification) {
>>>>>>> 3c48d87 (fix: google StyleCheck)
=======
  public Notification createNotification(@Valid @RequestBody
  NotificationDto notification) {
>>>>>>> 010307b (fix: checkStyle Google version 5)

=======
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
>>>>>>> 9398c65 (fix: google CheckStyle version 6)
=======
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
>>>>>>> 76249b4110b16ebdb1c0e97dc71ccb983356e855
    return service.createNotification(notification);
  }
}

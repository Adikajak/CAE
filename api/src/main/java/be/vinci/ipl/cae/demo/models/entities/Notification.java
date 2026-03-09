package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * Notification entity representing all user notifications.
 */

@Entity
@Table(name = "notifications")
public class Notification {

  /**
   * Everything is not null (not date_heure and id bcs it's always will be generated no matter what.
   * */

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notification_id")
  private Long notificationId;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;


  @Column(nullable = false, length = 100)
  @NotBlank
  private String object;


  @Column(nullable = false, length = 500)
  @NotBlank
  private String message;

  private  LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    this.createdAt = LocalDateTime.now();
  }

  @Column(nullable = false)
  private boolean isRead = false;


  public Long getNotificationId() {
    return notificationId;
  }

  public void setNotificationId(Long notificationId) {
    this.notificationId = notificationId;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getObject() {
    return object;
  }

  public void setObject(String object) {
    this.object = object;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public boolean isIsRead() {
    return isRead;
  }

  public void setIsRead(boolean isRead) {
    this.isRead = isRead;
  }
}


package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for Notification entities
 * Used to transfer notification data between layers without exposing the entity.
 */

public class NotificationDto {

  @NotNull
  private Long userId;

  @NotBlank
  @Size(max = 100)
  private String object;

  @NotBlank
  @Size(max = 500)
  private String message;

  private boolean isRead;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
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

  public boolean isIsRead() {
    return isRead;
  }

  public void setIsRead(boolean isRead) {
    this.isRead = isRead;
  }
}

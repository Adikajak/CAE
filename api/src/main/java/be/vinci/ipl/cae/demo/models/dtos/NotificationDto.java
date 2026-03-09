package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class NotificationDTO {

  @NotNull
  private Long userId;

  @NotBlank
  @Size(max=100)
  private String object;

  @NotBlank
  @Size(max=500)
  private String message;

  private boolean is_read;

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

  public boolean isIs_read() {
    return is_read;
  }

  public void setIs_read(boolean is_read) {
    this.is_read = is_read;
  }
}

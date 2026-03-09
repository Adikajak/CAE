package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Register payload DTO.
 */
public class UserDTO {

  @Email
  @NotBlank
  private String email;

  @NotBlank
  @Size(min = 8)
  private String password;

  @NotBlank
  private String tag;

  @NotBlank
  private String speciality;

  @JsonProperty("profile_picture")
  @NotBlank
  private String profilePicture;

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getTag() {
    return tag;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public String getSpeciality() {
    return speciality;
  }

  public void setSpeciality(String speciality) {
    this.speciality = speciality;
  }

  public String getProfilePicture() {
    return profilePicture;
  }

  public void setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }
}

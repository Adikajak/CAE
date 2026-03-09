package be.vinci.ipl.cae.demo.models.dtos;

/**
 * UserProfile DTO.
 */
public class UserProfile {

  private Long id;
  private String email;

  public UserProfile(Long id, String email) {
    this.id = id;
    this.email = email;
  }

  public Long getId() {
    return id; }

  public String getEmail() {
    return email; }
}

package be.vinci.ipl.cae.demo.models.dtos;

/**
 * UserProfile DTO.
 */
public class UserProfile {

  private Long id;
  private String email;

  /**
   * Constructor for UserProfile.
   *
   * @param id the user id.
   * @param email the user email.
   */
  public UserProfile(Long id, String email) {
    this.id = id;
    this.email = email;
  }

  /**
   * Get the user id.
   *
   * @return the user id.
   */
  public Long getId() {
    return id;
  }

  /**
   * Get the user email.
   *
   * @return the user email.
   */
  public String getEmail() {
    return email;
  }
}
package be.vinci.ipl.cae.demo.models.dtos;

/**
 * Credentials DTO.
 */
public class Credentials {

  private String email;
  private String password;

  /**
   * constructor.
   */
  @SuppressWarnings("PMD.UnnecessaryConstructor")
  public Credentials() {
    // empty for jpa generation
  }

  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }
}

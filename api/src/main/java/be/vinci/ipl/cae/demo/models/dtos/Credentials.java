package be.vinci.ipl.cae.demo.models.dtos;

/**
 * Credentials DTO.
 */
public class Credentials {

  private String username;
  private String password;

  /**
   * constructor.
   */
  @SuppressWarnings("PMD.UnnecessaryConstructor")
  public Credentials() {
    // empty for jpa generation
  }

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }
}

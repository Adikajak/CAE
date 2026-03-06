package be.vinci.ipl.cae.demo.models.dtos;

/**
 * AuthenticatedUser DTO.
 */
public class AuthenticatedUser {

  private String email;
  private String token;

  public String getEmail() {
    return email;
  }

  public String getToken() {
    return token;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setToken(String token) {
    this.token = token;
  }
}

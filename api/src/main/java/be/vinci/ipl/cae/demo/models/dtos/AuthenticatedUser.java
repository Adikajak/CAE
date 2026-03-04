package be.vinci.ipl.cae.demo.models.dtos;

/**
 * AuthenticatedUser DTO.
 */
public class AuthenticatedUser {

  private String username;
  private String token;

  public String getUsername() {
    return username;
  }

  public String getToken() {
    return token;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setToken(String token) {
    this.token = token;
  }
}

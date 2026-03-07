package be.vinci.ipl.cae.demo.models.dtos;

/**
 * AuthenticatedUser DTO.
 */
public class AuthenticatedUser {

  private String email;
  private boolean isAdmin;
  private String token;

  public String getEmail() {
    return email;
  }

  public boolean isAdmin() {
    return isAdmin;
  }

  public String getToken() {
    return token;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setAdmin(boolean isAdmin) {
    this.isAdmin = isAdmin;
  }

  public void setToken(String token) {
    this.token = token;
  }
}

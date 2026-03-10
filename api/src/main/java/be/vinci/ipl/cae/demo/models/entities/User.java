package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * User entity.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = {"team_id","tag"})
)
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private @Email @NotBlank String email;

  @Column(nullable = false)
  private @NotBlank @Size(min = 8) String password;

  //@ManyToOne(fetch = FetchType.LAZY, optional = false) Tiago check ?
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "speciality_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Speciality speciality;

  @Column(nullable = false)
  private @NotBlank String tag;

  @Column(nullable = false)
  private @NotBlank String profilePicture;
  
  @Column(nullable = false)
  private boolean isAdmin;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id", nullable = true)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Team team;

  /**
   * constructor.
   * */
  @SuppressWarnings("PMD.UnnecessaryConstructor")
  public User() {
    //empty constructor
  }

  public Long getId() {
    return id;
  }

  public String getPassword() {
    return password;
  }

  public String getTag() {
    return tag;
  }

  public Speciality getSpeciality() {
    return speciality;
  }

  public String getProfilePicture() {
    return profilePicture;
  }

  public String getEmail() {
    return email;
  }

  public Team getTeam() {
    return team;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public void setAdmin(boolean admin) {
    isAdmin = admin;
  }

  public boolean isAdmin() {
    return isAdmin;
  }

  public void setSpeciality(Speciality speciality) {
    this.speciality = speciality;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public void setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }

  public void setTeam(Team team) {
    this.team = team;
  }
}

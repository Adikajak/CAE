package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * User entity.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "tag"})
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

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "profile_picture_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private ProfilePicture profilePicture;

  @Column(nullable = false)
  private @NotBlank String tag;
  
  @Column(nullable = false)
  private boolean isAdmin;

  @Column(nullable = false)
  private LocalDate date;
  
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

  public ProfilePicture getProfilePicture() {
    return profilePicture;
  }

  public String getEmail() {
    return email;
  }

  public LocalDate getDate() {
    return date;
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

  public void setProfilePicture(ProfilePicture profilePicture) {
    this.profilePicture = profilePicture;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }
  
  public void setTeam(Team team) {
    this.team = team;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    };
    if (!(o instanceof User user)) {
      return false;
    }
    return id != null && id.equals(user.id);
  }

  @Override
  public int hashCode() {
    return id != null ? id.hashCode() : 0;
  }
}

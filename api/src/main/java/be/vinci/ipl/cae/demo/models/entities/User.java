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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

import java.time.LocalDate;

/**
 * User entity.
 */
@Entity
@Table(name = "users")
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

  @Column(nullable = false)
  private LocalDate date;

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

  public LocalDate getDate() {
    return date;
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

  public void setDate(LocalDate date) {
    this.date = date;
  }
}

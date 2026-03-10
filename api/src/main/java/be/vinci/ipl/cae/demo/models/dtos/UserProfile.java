package be.vinci.ipl.cae.demo.models.dtos;

/**
 * UserProfile DTO.
 */
public class UserProfile {

  private Long id;
  private String email;
  private String tag;
  private String speciality;
  private String profilePicture;

  /**
   * Constructor for UserProfile.
   *
   * @param id the user id.
   * @param email the user email.
   * @param tag            the user tag.
   * @param speciality     the user speciality.
   * @param profilePicture the user profile picture.
   */
  public UserProfile(Long id, String email, String tag, String speciality, String profilePicture) {
    this.id = id;
    this.email = email;
    this.tag = tag;
    this.speciality = speciality;
    this.profilePicture = profilePicture;
  }

  public Long getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public String getTag() {
    return tag;
  }

  public String getSpeciality() {
    return speciality;
  }

  public String getProfilePicture() {
    return profilePicture;
  }
}
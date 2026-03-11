package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.UserProfile;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.AdministrationService;
import java.util.List;
import java.util.stream.StreamSupport;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RestController pour /administrators.
 */
@RestController
@RequestMapping("/administrators")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  private final AdministrationService administrationService;

  /**
   * Administration controller ctor.
   * @param administrationService the administration service
   */
  public AdminController(AdministrationService administrationService) {
    this.administrationService = administrationService;
  }

  /**
   * Returns all admin profiles.
   *
   * @return the list of admin profiles
   */
  @GetMapping({"", "/"})
  public List<UserProfile> getAllAdmins() {
    return StreamSupport.stream(administrationService.getAllAdmins().spliterator(), false)
        .map(this::toUserProfile)
        .toList();
  }

  /**
   * Converts a User to a UserProfile.
   *
   * @param user the user entity
   * @return the user profile
   */
  private UserProfile toUserProfile(User user) {
    //CPD-OFF
    return new UserProfile(
        user.getId(),
        user.getEmail(),
        user.getTag(),
        user.getSpeciality() != null ? user.getSpeciality().getName() : null,
        user.getProfilePicture() != null ? user.getProfilePicture().getUrl() : null,
        user.getDate()
    );
    //CPD-ON
  }
}

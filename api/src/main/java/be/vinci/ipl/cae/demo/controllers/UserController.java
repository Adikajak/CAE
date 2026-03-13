package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.PasswordUpdateDto;
import be.vinci.ipl.cae.demo.models.dtos.UnavailabilityRequestDto;
import be.vinci.ipl.cae.demo.models.dtos.UserProfileDto;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Unavailability;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * UserController to handle user profile.
 */
@RestController
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  /**
   * Constructor for UserController.
   *
   * @param userService the injected UserService.
   */
  public UserController(UserService userService) {
    this.userService = userService;
  }

  /**
   * Get the profile of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @return the user profile.
   */
  @GetMapping("/me")
  public UserProfileDto getMyProfile(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return toUserProfile(user);
  }

  /**
   * Updates the password of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @param passwordUpdate the old and new passwords.
   */
  @PatchMapping("/me/password")
  public void updatePassword(Authentication authentication,
                             @RequestBody PasswordUpdateDto passwordUpdate) {
    User user = (User) authentication.getPrincipal();
    boolean success = userService.updatePassword(
        user.getEmail(),
        passwordUpdate.oldPassword(),
        passwordUpdate.newPassword()
    );
    if (!success) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Retrieves all unavailabilities of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @return the list of unavailabilities.
   */
  @GetMapping("/me/unavailabilities")
  public Iterable<Unavailability> getUnavailabilities(Authentication authentication) {
    User user = (User) authentication.getPrincipal();
    return userService.getUnavailabilities(user);
  }

  /**
   * Adds a new unavailability for the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @param request        the unavailability dates.
   * @return the created unavailability.
   */
  @PostMapping("/me/unavailabilities")
  @ResponseStatus(HttpStatus.CREATED)
  public Unavailability addUnavailability(
      Authentication authentication,
      @RequestBody UnavailabilityRequestDto request
  ) {
    User user = (User) authentication.getPrincipal();
    return userService.addUnavailability(user, request);
  }

  /**
   * Updates the speciality of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @param body           the request body containing the speciality name.
   */
  @PatchMapping("/me/speciality")
  public void updateSpeciality(Authentication authentication,
                               @RequestBody Map<String, String> body) {
    User user = (User) authentication.getPrincipal();
    boolean success = userService.updateSpeciality(user, body.get("specialityName"));
    if (!success) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Updates the profile picture of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @param body the request body containing the profile picture URL.
   */
  @PatchMapping("/me/profile-picture")
  public void updateProfilePicture(Authentication authentication,
                                   @RequestBody Map<String, String> body) {
    User user = (User) authentication.getPrincipal();
    boolean success = userService.updateProfilePicture(user, body.get("profilePictureUrl"));
    if (!success) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Converts a User to a UserProfile.
   *
   * @param user the user entity
   * @return the user profile
   */
  private UserProfileDto toUserProfile(User user) {
    //CPD-OFF
    Team team = user.getTeam();
    boolean isManager = team != null && (
        (team.getManager() != null && team.getManager().getId().equals(user.getId()))
            || (team.getSecondManager() != null
            && team.getSecondManager().getId().equals(user.getId()))
    );
    return new UserProfileDto(
        user.getId(),
        user.getEmail(),
        user.getTag(),
        user.getSpeciality() != null ? user.getSpeciality().getName() : null,
        user.getProfilePicture() != null ? user.getProfilePicture().getUrl() : null,
        user.getDate(),
        team != null ? team.getName() : null,
        isManager
    );
    //CPD-ON
  }
}
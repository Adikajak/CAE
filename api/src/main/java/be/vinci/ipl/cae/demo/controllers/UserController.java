package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.PasswordUpdate;
import be.vinci.ipl.cae.demo.models.dtos.UnavailabilityRequest;
import be.vinci.ipl.cae.demo.models.dtos.UserProfile;
import be.vinci.ipl.cae.demo.models.entities.Unavailability;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
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
  public UserProfile getMyProfile(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return new UserProfile(user.getId(), user.getEmail(),user.getTag(), user.getSpeciality().getName(), user.getProfilePicture());
  }

  /**
   * Updates the password of the authenticated user.
   *
   * @param authentication the Spring Security authentication object.
   * @param passwordUpdate the old and new passwords.
   */
  @PatchMapping("/me/password")
  public void updatePassword(Authentication authentication,
                             @RequestBody PasswordUpdate passwordUpdate) {
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
  public Unavailability addUnavailability(Authentication authentication, @RequestBody UnavailabilityRequest request) {
    User user = (User) authentication.getPrincipal();
    return userService.addUnavailability(user, request);
  }
}
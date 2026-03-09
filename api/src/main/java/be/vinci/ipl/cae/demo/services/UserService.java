package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.UnavailabilityRequest;
import be.vinci.ipl.cae.demo.models.entities.Unavailability;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * User service.
 */
@Service
public class UserService {

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final UnavailabilityRepository unavailabilityRepository;
  private final SpecialityRepository specialityRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   * @param specialityRepository the speciality repository
   * @param unavailabilityRepository the unavailability repository
   */

  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository,
      UnavailabilityRepository unavailabilityRepository, SpecialityRepository specialityRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the email to included in the claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(String email) {
    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("email", email)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
        .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setToken(token);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the username if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Login a user.
   *
   * @param email the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }

    if (!passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    System.out.println(createJwtToken(email));

    return createJwtToken(email);
  }

  /**
   * Register a new user.
   *
   * @param email the email
   * @param password the password
   * @param tag the user tag
   * @param specialityName the speciality name
   * @param profilePicture the profile picture URL
   * @return the authenticated user if the registration is successful, null otherwise
   */
  public AuthenticatedUser register(String email, String password, String tag,
      String specialityName, String profilePicture) {
    User user = userRepository.findByEmail(email);
    if (user != null) {
      return null;
    }

    Speciality speciality = specialityRepository.findByName(specialityName);
    if (speciality == null) {
      return null;
    }

    createOne(email, password, tag, profilePicture, speciality);

    return createJwtToken(email);
  }

  /**
   * Read a user from its username.
   *
   * @param username the username
   * @return the user if it exists, null otherwise
   */
  public User readOneFromUsername(String username) {
    return userRepository.findByEmail(username);
  }

  /**
   * Create a new user.
   *
   * @param email the email
   * @param password the password
   * @param tag the tag
   * @param profilePicture the profile picture
   * @param speciality the speciality
   */
  public void createOne(String email, String password, String tag,
      String profilePicture, Speciality speciality) {
    String hashedPassword = passwordEncoder.encode(password);

    User user = new User();
    user.setEmail(email);
    user.setPassword(hashedPassword);
    user.setTag(tag);
    user.setProfilePicture(profilePicture);
    user.setSpeciality(speciality);

    userRepository.save(user);
  }

  /**
   * Updates the password of a user after verifying the old password.
   * Returns false if the user does not exist or if the old password is incorrect.
   *
   * @param email the email of the user
   * @param oldPassword the current password to verify
   * @param newPassword the new password to set
   * @return true if the password was updated, false otherwise
   */
  public boolean updatePassword(String email, String oldPassword, String newPassword) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return false;
    }
    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
      return false;
    }
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    return true;
  }

  /**
   * Retrieves all unavailabilities for a given user.
   *
   * @param user the authenticated user
   * @return the list of unavailabilities
   */
  public Iterable<Unavailability> getUnavailabilities(User user) {
    return unavailabilityRepository.findByUser(user);
  }

  /**
   * Creates and saves a new unavailability for a given user.
   *
   * @param user the authenticated user
   * @param request the unavailability dates
   * @return the saved unavailability
   */
  public Unavailability addUnavailability(User user, UnavailabilityRequest request) {
    Unavailability unavailability = new Unavailability();
    unavailability.setUser(user);
    unavailability.setStartDate(request.startDate());
    unavailability.setEndDate(request.endDate());
    return unavailabilityRepository.save(unavailability);
  }

}
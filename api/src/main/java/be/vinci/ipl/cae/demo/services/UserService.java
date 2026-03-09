package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.User;
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

  private int unusedVariable = 0;

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the email to included in the claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(String email, boolean isAdmin) {
    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("email", email)
        .withClaim("isAdmin", isAdmin)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
        .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setAdmin(isAdmin);
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

    System.out.println(createJwtToken(email, user.isAdmin()));

    return createJwtToken(email, user.isAdmin());
  }

  /**
   * Register a new user.
   *
   * @param email the email
   * @param password the password
   * @return the authenticated user if the registration is successful, null otherwise
   */
  public AuthenticatedUser register(String email, String password) {
    User user = userRepository.findByEmail(email);
    if (user != null) {
      return null;
    }

    createOne(email, password, false);

    return createJwtToken(email, false);
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
   */
  public void createOne(String email, String password, boolean isAdmin) {
    String hashedPassword = passwordEncoder.encode(password);

    User user = new User();
    user.setEmail(email);
    user.setPassword(hashedPassword);
    user.setAdmin(isAdmin);

    userRepository.save(user);
  }

}

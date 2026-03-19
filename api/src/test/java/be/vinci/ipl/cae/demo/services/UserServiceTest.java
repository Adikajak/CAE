package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.ProfilePicture;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ProfilePictureRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private UnavailabilityRepository unavailabilityRepository;

  @Mock
  private SpecialityRepository specialityRepository;

  @Mock
  private ProfilePictureRepository profilePictureRepository;

  @Mock
  private NotificationService notificationService;

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  @BeforeEach
  void setUp() {
    // In Mockito-only tests, @PostConstruct is not called automatically.
    ReflectionTestUtils.setField(userService, "jwtSecret", "test-secret");
    userService.init();
  }

  @Test
  void updatePasswordReturnsFalseWhenUserNotFound() {
    when(userRepository.findByEmail("z@mail.com")).thenReturn(null);

    boolean result = userService.updatePassword("z@mail.com", "old", "new");

    assertFalse(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void updatePasswordReturnsFalseWhenOldPasswordIncorrect() {
    User user = new User();
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);

    boolean result = userService.updatePassword("z@mail.com", "wrong", "new");

    assertFalse(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void updatePasswordReturnsTrueWhenSuccessful() {
    User user = new User();
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("old", user.getPassword())).thenReturn(true);
    when(passwordEncoder.encode("new")).thenReturn("hashedNew");

    boolean result = userService.updatePassword("z@mail.com", "old", "new");

    assertTrue(result);
    verify(userRepository).save(user);
  }

  @Test
  void updateSpecialityReturnsFalseWhenSpecialityNotFound() {
    when(specialityRepository.findByName("Unknown")).thenReturn(null);

    boolean result = userService.updateSpeciality(new User(), "Unknown");

    assertFalse(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void updateSpecialityReturnsTrueWhenSuccessful() {
    User user = new User();
    Speciality speciality = new Speciality();
    when(specialityRepository.findByName("Mage")).thenReturn(speciality);

    boolean result = userService.updateSpeciality(user, "Mage");

    assertTrue(result);
    verify(userRepository).save(user);
  }

  @Test
  void updateProfilePictureReturnsFalseWhenPictureNotFound() {
    when(profilePictureRepository.findByUrl("http://unknown.png")).thenReturn(null);

    boolean result = userService.updateProfilePicture(new User(), "http://unknown.png");

    assertFalse(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void updateProfilePictureReturnsTrueWhenSuccessful() {
    User user = new User();
    ProfilePicture picture = new ProfilePicture();
    when(profilePictureRepository.findByUrl("http://avatar.png")).thenReturn(picture);

    boolean result = userService.updateProfilePicture(user, "http://avatar.png");

    assertTrue(result);
    verify(userRepository).save(user);
  }

  @Test
  void loginReturnsNullWhenUserNotFound() {
    when(userRepository.findByEmail("z@mail.com")).thenReturn(null);

    AuthenticatedUser result = userService.login("z@mail.com", "pass");

    assertNull(result);
  }

  @Test
  void loginReturnsNullWhenPasswordIncorrect() {
    User user = new User();
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);

    AuthenticatedUser result = userService.login("z@mail.com", "wrong");

    assertNull(result);
  }

  @Test
  void loginReturnsTokenWhenSuccessful() {
    User user = new User();
    user.setTag("zed");
    user.setAdmin(false);
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("pass", user.getPassword())).thenReturn(true);

    AuthenticatedUser result = userService.login("z@mail.com", "pass");

    assertNotNull(result);
    assertNotNull(result.getToken());
    assertTrue(!result.getToken().isBlank());
  }
}


package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.dtos.UnavailabilityRequestDto;
import be.vinci.ipl.cae.demo.models.entities.ProfilePicture;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Unavailability;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.TeamMembership;
import be.vinci.ipl.cae.demo.repositories.ProfilePictureRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import be.vinci.ipl.cae.demo.repositories.TeamMembershipRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamMembershipRepository teamMembershipRepository;

  @Mock
  private TournamentRegistrationRepository tournamentRegistrationRepository;

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
    ReflectionTestUtils.setField(user, "id", 77L);
    user.setTag("zed");
    user.setAdmin(false);
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("pass", user.getPassword())).thenReturn(true);

    AuthenticatedUser result = userService.login("z@mail.com", "pass");

    assertNotNull(result);
    assertNotNull(result.getToken());
    assertFalse(result.getToken().isBlank());
    assertEquals(77L, result.getId());
    assertNull(result.getTeamId());
  }

  @Test
  void loginReturnsTokenWithTeamIdWhenUserHasTeam() {
    User user = new User();
    Team team = new Team();
    ReflectionTestUtils.setField(user, "id", 12L);
    ReflectionTestUtils.setField(team, "id", 45L);
    user.setTag("zed");
    user.setAdmin(true);
    user.setTeam(team);
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);
    when(passwordEncoder.matches("pass", user.getPassword())).thenReturn(true);

    AuthenticatedUser result = userService.login("z@mail.com", "pass");

    assertNotNull(result);
    assertEquals(45L, result.getTeamId());
    assertTrue(result.isAdmin());
  }

  @Test
  void createJwtTokenReturnsExpectedClaims() {
    AuthenticatedUser result = userService.createJwtToken(1L, "a@mail.com", "tag", true, 99L);

    assertEquals(1L, result.getId());
    assertEquals("a@mail.com", result.getEmail());
    assertEquals("tag", result.getTag());
    assertTrue(result.isAdmin());
    assertEquals(99L, result.getTeamId());
    assertNotNull(result.getToken());
  }

  @Test
  void verifyJwtTokenReturnsEmailWhenTokenIsValid() {
    String token = userService.createJwtToken(8L, "valid@mail.com", "ok", false, null).getToken();

    String result = userService.verifyJwtToken(token);

    assertEquals("valid@mail.com", result);
  }

  @Test
  void verifyJwtTokenReturnsNullWhenTokenIsInvalid() {
    String result = userService.verifyJwtToken("not-a-jwt");

    assertNull(result);
  }

  @Test
  void getJwtClaimsFromTokenReturnsClaimsWhenTokenIsValid() {
    String token = userService.createJwtToken(8L, "claims@mail.com", "ok", true, null).getToken();

    Map<String, Object> claims = userService.getJwtClaimsFromToken(token);

    assertEquals("claims@mail.com", claims.get("email"));
    assertTrue((Boolean) claims.get("isAdmin"));
  }

  @Test
  void getJwtClaimsFromTokenReturnsEmptyMapWhenTokenIsInvalid() {
    Map<String, Object> claims = userService.getJwtClaimsFromToken("invalid");

    assertNotNull(claims);
    assertTrue(claims.isEmpty());
  }

  @Test
  void registerReturnsNullWhenEmailAlreadyExists() {
    when(userRepository.findByEmail("z@mail.com")).thenReturn(new User());

    AuthenticatedUser result = userService.register(
        "z@mail.com", "password", "tag", "Mage", "http://avatar.png");

    assertNull(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void registerThrowsWhenSpecialityIsInvalid() {
    when(userRepository.findByEmail("z@mail.com")).thenReturn(null);
    when(specialityRepository.findByName("Unknown")).thenReturn(null);

    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
        () -> userService.register("z@mail.com", "password", "tag", "Unknown", "http://img"));

    assertEquals("Invalid speciality", exception.getMessage());
  }

  @Test
  void registerThrowsWhenProfilePictureIsInvalid() {
    Speciality speciality = new Speciality();
    when(userRepository.findByEmail("z@mail.com")).thenReturn(null);
    when(specialityRepository.findByName("Mage")).thenReturn(speciality);
    when(profilePictureRepository.findByUrl("http://missing.png")).thenReturn(null);

    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
        () -> userService.register("z@mail.com", "password", "tag", "Mage", "http://missing.png"));

    assertEquals("Invalid profile picture", exception.getMessage());
  }

  @Test
  void registerCreatesUserAndReturnsToken() {
    Speciality speciality = new Speciality();
    ProfilePicture picture = new ProfilePicture();
    ReflectionTestUtils.setField(speciality, "name", "Mage");
    ReflectionTestUtils.setField(picture, "url", "http://avatar.png");

    when(userRepository.findByEmail("z@mail.com")).thenReturn(null);
    when(specialityRepository.findByName("Mage")).thenReturn(speciality);
    when(profilePictureRepository.findByUrl("http://avatar.png")).thenReturn(picture);
    when(passwordEncoder.encode("pass")).thenReturn("hashed");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User saved = invocation.getArgument(0);
      ReflectionTestUtils.setField(saved, "id", 101L);
      return saved;
    });

    AuthenticatedUser result = userService.register(
        "z@mail.com", "pass", "zed", "Mage", "http://avatar.png");

    assertNotNull(result);
    assertEquals(101L, result.getId());
    assertEquals("z@mail.com", result.getEmail());
    assertEquals("zed", result.getTag());
    assertFalse(result.isAdmin());
    assertNull(result.getTeamId());
    assertNotEquals("", result.getToken());
    verify(userRepository).save(any(User.class));
    verify(notificationService).createNotification(any(User.class), any(NotificationDto.class));
  }

  @Test
  void readOneFromUsernameDelegatesToRepository() {
    User user = new User();
    when(userRepository.findByEmail("x@mail.com")).thenReturn(user);

    User result = userService.readOneFromUsername("x@mail.com");

    assertSame(user, result);
  }

  @Test
  void createOneSavesUserAndSendsWelcomeNotification() {
    ProfilePicture picture = new ProfilePicture();
    Speciality speciality = new Speciality();
    when(passwordEncoder.encode("plain")).thenReturn("hashed");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User saved = invocation.getArgument(0);
      ReflectionTestUtils.setField(saved, "id", 55L);
      return saved;
    });

    User result = userService.createOne("mail@test.com", "plain", true, "tag", picture, speciality);

    assertNotNull(result);
    assertEquals("mail@test.com", result.getEmail());
    assertEquals("hashed", result.getPassword());
    assertEquals("tag", result.getTag());
    assertTrue(result.isAdmin());
    assertNotNull(result.getDate());
    assertSame(picture, result.getProfilePicture());
    assertSame(speciality, result.getSpeciality());

    ArgumentCaptor<NotificationDto> notificationCaptor = ArgumentCaptor.forClass(NotificationDto.class);
    verify(notificationService).createNotification(eq(result), notificationCaptor.capture());
    assertEquals(55L, notificationCaptor.getValue().getUserId());
    assertEquals("Bienvenue !", notificationCaptor.getValue().getObject());
  }

  @Test
  void getUnavailabilitiesDelegatesToRepository() {
    User user = new User();
    Iterable<Unavailability> expected = List.of(new Unavailability(), new Unavailability());
    when(unavailabilityRepository.findByUser(user)).thenReturn(expected);

    Iterable<Unavailability> result = userService.getUnavailabilities(user);

    assertSame(expected, result);
  }

  @Test
  void addUnavailabilityCreatesAndSavesUnavailability() {
    User user = new User();
    Unavailability saved = new Unavailability();
    LocalDate startDate = LocalDate.of(2026, 1, 10);
    LocalDate endDate = LocalDate.of(2026, 1, 15);
    UnavailabilityRequestDto request = new UnavailabilityRequestDto(startDate, endDate);
    when(unavailabilityRepository.save(any(Unavailability.class))).thenReturn(saved);

    Unavailability result = userService.addUnavailability(user, request);

    assertSame(saved, result);
    ArgumentCaptor<Unavailability> captor = ArgumentCaptor.forClass(Unavailability.class);
    verify(unavailabilityRepository).save(captor.capture());
    assertSame(user, captor.getValue().getUser());
    assertEquals(startDate, captor.getValue().getStartDate());
    assertEquals(endDate, captor.getValue().getEndDate());
  }

  @Test
  void findUserDelegatesToRepository() {
    User user = new User();
    Optional<User> expected = Optional.of(user);
    when(userRepository.findById(7L)).thenReturn(expected);

    Optional<User> result = userService.findUser(7L);

    assertSame(expected, result);
  }

  @Test
  void getAllUsersDelegatesToRepository() {
    Iterable<User> expected = List.of(new User(), new User());
    when(userRepository.findAll()).thenReturn(expected);

    Iterable<User> result = userService.getAllUsers();

    assertSame(expected, result);
  }

  // ==================== banUser ====================

  @Test
  void banUserDeletesRegistrationsWhenBannedUserWasLastMember() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User user = new User();
    ReflectionTestUtils.setField(user, "id", 1L);
    user.setTeam(team);
    team.setManager(user);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(userRepository.findFirstByTeamAndIsBannedFalseAndIdNotOrderByDateAsc(team, 1L))
        .thenReturn(null);
    when(teamMembershipRepository.findByMember(user)).thenReturn(Optional.empty());

    userService.banUser(1L);

    verify(tournamentRegistrationRepository).deleteByTeam(team);
  }

  @Test
  void banUserDoesNotDeleteRegistrationsWhenTeamStillHasManager() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User manager = new User();
    ReflectionTestUtils.setField(manager, "id", 1L);
    User member = new User();
    ReflectionTestUtils.setField(member, "id", 2L);
    team.setManager(manager);
    member.setTeam(team);

    TeamMembership membership = new TeamMembership();
    when(userRepository.findById(2L)).thenReturn(Optional.of(member));
    when(teamMembershipRepository.findByMember(member)).thenReturn(Optional.of(membership));

    userService.banUser(2L);

    verify(tournamentRegistrationRepository, never()).deleteByTeam(team);
  }

  @Test
  void banUserReturnsFalseWhenUserNotFound() {
    when(userRepository.findById(99L)).thenReturn(Optional.empty());

    boolean result = userService.banUser(99L);

    assertFalse(result);
    verify(userRepository, never()).save(any());
  }

  @Test
  void banUserDesignatesOldestMemberWhenMainManagerHasNoSecondManager() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User manager = new User();
    ReflectionTestUtils.setField(manager, "id", 1L);
    User oldest = new User();
    ReflectionTestUtils.setField(oldest, "id", 2L);
    manager.setTeam(team);
    team.setManager(manager);

    when(userRepository.findById(1L)).thenReturn(Optional.of(manager));
    when(userRepository.findFirstByTeamAndIsBannedFalseAndIdNotOrderByDateAsc(team, 1L))
        .thenReturn(oldest);
    when(teamMembershipRepository.findByMember(manager)).thenReturn(Optional.empty());

    boolean result = userService.banUser(1L);

    assertTrue(result);
    assertEquals(oldest, team.getManager());
  }

  @Test
  void banUserSetsManagerNullWhenNoOldestMemberFound() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User manager = new User();
    ReflectionTestUtils.setField(manager, "id", 1L);
    manager.setTeam(team);
    team.setManager(manager);

    when(userRepository.findById(1L)).thenReturn(Optional.of(manager));
    when(userRepository.findFirstByTeamAndIsBannedFalseAndIdNotOrderByDateAsc(team, 1L))
        .thenReturn(null);
    when(teamMembershipRepository.findByMember(manager)).thenReturn(Optional.empty());

    boolean result = userService.banUser(1L);

    assertTrue(result);
    assertNull(team.getManager());
  }

  @Test
  void banUserPromotesSecondManagerWhenMainManagerBanned() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User manager = new User();
    ReflectionTestUtils.setField(manager, "id", 1L);
    User secondManager = new User();
    ReflectionTestUtils.setField(secondManager, "id", 2L);
    manager.setTeam(team);
    team.setManager(manager);
    team.setSecondManager(secondManager);

    when(userRepository.findById(1L)).thenReturn(Optional.of(manager));
    when(teamMembershipRepository.findByMember(manager)).thenReturn(Optional.empty());

    boolean result = userService.banUser(1L);

    assertTrue(result);
    assertEquals(secondManager, team.getManager());
    assertNull(team.getSecondManager());
  }

  @Test
  void banUserRemovesSecondManagerWhenSecondManagerBanned() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User manager = new User();
    ReflectionTestUtils.setField(manager, "id", 1L);
    User secondManager = new User();
    ReflectionTestUtils.setField(secondManager, "id", 2L);
    secondManager.setTeam(team);
    team.setManager(manager);
    team.setSecondManager(secondManager);

    when(userRepository.findById(2L)).thenReturn(Optional.of(secondManager));
    when(teamMembershipRepository.findByMember(secondManager)).thenReturn(Optional.empty());

    boolean result = userService.banUser(2L);

    assertTrue(result);
    assertNull(team.getSecondManager());
    assertEquals(manager, team.getManager());
  }

  @Test
  void banUserReturnsTrueWhenUserHasNoTeam() {
    User user = new User();
    ReflectionTestUtils.setField(user, "id", 1L);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(teamMembershipRepository.findByMember(user)).thenReturn(Optional.empty());

    boolean result = userService.banUser(1L);

    assertTrue(result);
    assertTrue(user.isBanned());
  }

  @Test
  void banUserWhenTeamHasNoManager() {
    Team team = new Team();
    ReflectionTestUtils.setField(team, "id", 10L);
    User user = new User();
    ReflectionTestUtils.setField(user, "id", 1L);
    user.setTeam(team);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(teamMembershipRepository.findByMember(user)).thenReturn(Optional.empty());

    boolean result = userService.banUser(1L);

    assertTrue(result);
  }

  @Test
  void loginReturnsNullWhenUserIsBanned() {
    User user = new User();
    user.setBanned(true);
    when(userRepository.findByEmail("z@mail.com")).thenReturn(user);

    AuthenticatedUser result = userService.login("z@mail.com", "pass");

    assertNull(result);
  }

  @Test
  void findByEmailDelegatesToRepository() {
    User user = new User();
    when(userRepository.findByEmail("test@mail.com")).thenReturn(user);

    User result = userService.findByEmail("test@mail.com");

    assertSame(user, result);
  }
}


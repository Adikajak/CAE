package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdministrationServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private AdministrationService administrationService;

  @Test
  void getAllAdminsReturnsRepositoryAdmins() {
    Iterable<User> admins = List.of(new User(), new User());
    when(userRepository.findAllByIsAdminTrue()).thenReturn(admins);

    Iterable<User> result = administrationService.getAllAdmins();

    assertSame(admins, result);
    verify(userRepository).findAllByIsAdminTrue();
  }
}


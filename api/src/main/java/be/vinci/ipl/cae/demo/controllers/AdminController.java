package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.User;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RestController pour /admin
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  /**
   * Endpoint de test réservé aux admins.
   *
   * @return un message de confirmation avec l'email de l'admin connecté
   */
  @GetMapping("/users")
  public Map<String, String> demo(@AuthenticationPrincipal User currentUser) {
    return Map.of(
        "message", "Accès admin accordé",
        "email", currentUser.getEmail()
    );
  }
}

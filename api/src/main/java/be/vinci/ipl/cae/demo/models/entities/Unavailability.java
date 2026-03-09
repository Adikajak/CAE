package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Unavailability entity.
 */
@Entity
@Table(name = "unavailabilities")
public class Unavailability {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private LocalDate startDate;

  @Column(nullable = false)
  private LocalDate endDate;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  public Long getId() {
    return id; }

  public LocalDate getStartDate() {
    return startDate; }

  public LocalDate getEndDate() {
    return endDate; }

  public User getUser() {
    return user; }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate; }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate; }

  public void setUser(User user) {
    this.user = user; }
}
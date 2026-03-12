package be.vinci.ipl.cae.demo.models.dtos;

/**
 * DTO returned when a team is created.
 */
public class TeamResponseDto {

  private Long id;
  private String name;
  private UserProfile manager;
  private UserProfile secondManager;

  /**
   * Constructor for TeamCreateResponse.
   *
   * @param id the team id
   * @param name the team name
   * @param manager the manager
   * @param secondManager the second manager
   */
  public TeamResponseDto(Long id, String name, UserProfile manager, UserProfile secondManager) {
    this.id = id;
    this.name = name;
    this.manager = manager;
    this.secondManager = secondManager;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public UserProfile getManager() {
    return manager;
  }

  public UserProfile getSecondManager() {
    return secondManager;
  }
}
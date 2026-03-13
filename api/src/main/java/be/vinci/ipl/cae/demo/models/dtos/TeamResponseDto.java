package be.vinci.ipl.cae.demo.models.dtos;

/**
 * DTO returned when a team is created.
 */
public class TeamResponseDto {

  private Long id;
  private String name;
  private UserProfileDto manager;
  private UserProfileDto secondManager;
  private int managersCount;
  private int membersCount;

  /**
   * Constructor for TeamCreateResponse.
   *
   * @param id the team id
   * @param name the team name
   * @param manager the manager
   * @param secondManager the second manager
   */
  public TeamResponseDto(Long id, String name, UserProfileDto manager, UserProfileDto secondManager, 
      int managersCount,
      int membersCount) {
    this.id = id;
    this.name = name;
    this.manager = manager;
    this.secondManager = secondManager;
    this.managersCount = managersCount;
    this.membersCount = membersCount;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public UserProfileDto getManager() {
    return manager;
  }

  public UserProfileDto getSecondManager() {
    return secondManager;
  }

  public int getManagersCount() {
    return managersCount;
  }

  public int getMembersCount() {
    return membersCount;
  }
}
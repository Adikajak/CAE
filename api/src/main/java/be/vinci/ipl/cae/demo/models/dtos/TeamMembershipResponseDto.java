package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.MembershipStatus;

/**
 * DTO for TeamMembership responses.
 */
public class TeamMembershipResponseDto {

  private Long id;
  private UserProfileDto member;
  private TeamResponseDto team;
  private MembershipStatus status;
  private String rejectionReason;

  /**
   * Constructor for TeamMembershipResponseDto.
   *
   * @param id the membership id
   * @param member the member user profile
   * @param team the team response
   * @param status the membership status
   * @param rejectionReason the rejection reason (nullable)
   */
  public TeamMembershipResponseDto(
      Long id,
      UserProfileDto member,
      TeamResponseDto team,
      MembershipStatus status,
      String rejectionReason
  ) {
    this.id = id;
    this.member = member;
    this.team = team;
    this.status = status;
    this.rejectionReason = rejectionReason;
  }

  public Long getId() {
    return id;
  }

  public UserProfileDto getMember() {
    return member;
  }

  public TeamResponseDto getTeam() {
    return team;
  }

  public MembershipStatus getStatus() {
    return status;
  }

  public String getRejectionReason() {
    return rejectionReason;
  }
}

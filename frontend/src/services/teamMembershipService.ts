import { TeamMembership } from '../types';
import { createHeaders, ensureRequestSucceeded } from './apiUtils';

const MEMBERSHIPS_BASE_URL = '/api/teams/memberships';

const fetchCurrentMembership = async (
  token: string,
): Promise<TeamMembership | null> => {
  const response = await fetch(`${MEMBERSHIPS_BASE_URL}/me`, {
    method: 'GET',
    headers: createHeaders(token),
  });

  if (response.status === 204) {
    return null;
  }

  ensureRequestSucceeded(response);

  return response.json() as Promise<TeamMembership>;
};

const fetchTeamMembers = async (
  teamId: number,
  token: string,
): Promise<TeamMembership[]> => {
  const response = await fetch(`${MEMBERSHIPS_BASE_URL}/${teamId}/members`, {
    method: 'GET',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);

  const members: TeamMembership[] | null = await response.json();
  return members ?? [];
};

const joinTeam = async (token: string, teamId: number): Promise<void> => {
  const response = await fetch(`${MEMBERSHIPS_BASE_URL}/${teamId}/membership`, {
    method: 'POST',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(
    response,
    undefined,
    'Impossible de rejoindre la team :\n un membre possède déjà le même tag',
  );
};

const excludeMember = async (
  token: string,
  membershipId: number,
): Promise<void> => {
  const response = await fetch(`${MEMBERSHIPS_BASE_URL}/${membershipId}`, {
    method: 'DELETE',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);
};

export { fetchCurrentMembership, fetchTeamMembers, joinTeam, excludeMember };

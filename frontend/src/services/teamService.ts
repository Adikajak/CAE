import { Team } from '../types';
import { createHeaders, ensureRequestSucceeded } from './apiUtils';

const TEAMS_BASE_URL = '/api/teams';

const fetchAllTeams = async (): Promise<Team[]> => {
  const response = await fetch(TEAMS_BASE_URL, {
    method: 'GET',
  });

  ensureRequestSucceeded(response);

  const teams: Team[] | null = await response.json();
  return teams ?? [];
};

const fetchTeamById = async (teamId: number, token: string): Promise<Team> => {
  const response = await fetch(`${TEAMS_BASE_URL}/${teamId}`, {
    method: 'GET',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);

  return response.json() as Promise<Team>;
};

const createTeam = async (token: string, name: string): Promise<Team> => {
  const response = await fetch(TEAMS_BASE_URL, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify({ name }),
  });

  ensureRequestSucceeded(
    response,
    'Impossible de créer une nouvelle team (une ou plusieurs raisons) :\n' +
      "• Vous faites déjà partie d'une team\n" +
      '• Le nom de la team que vous voulez créer existe déjà\n' +
      "• Vous avez une demande d'adhésion en attente",
  );

  return response.json() as Promise<Team>;
};

const designateSecondManager = async (
  token: string,
  teamId: number,
  memberId: number,
): Promise<Team> => {
  const response = await fetch(
    `${TEAMS_BASE_URL}/${teamId}/second-manager/${memberId}`,
    {
      method: 'PATCH',
      headers: createHeaders(token),
    },
  );

  ensureRequestSucceeded(response);

  return response.json() as Promise<Team>;
};

const renounceManagerRole = async (
  token: string,
  teamId: number,
): Promise<Team> => {
  const response = await fetch(`${TEAMS_BASE_URL}/${teamId}/manager/renounce`, {
    method: 'PATCH',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);

  return response.json() as Promise<Team>;
};

const leaveTeam = async (token: string, teamId: number): Promise<void> => {
  const response = await fetch(`${TEAMS_BASE_URL}/${teamId}/leave`, {
    method: 'PATCH',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);
};

export {
  fetchAllTeams,
  fetchTeamById,
  createTeam,
  designateSecondManager,
  renounceManagerRole,
  leaveTeam,
};

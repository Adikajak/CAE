import { TeamActivity, TournamentRegistration } from '../types';
import { createHeaders, ensureRequestSucceeded } from './apiUtils';

const TOURNAMENT_BASE_URL = '/api/tournaments';
const TEAMS_BASE_URL = '/api/teams';

const fetchTournamentRegistrations = async (
  tournamentId: number,
): Promise<TournamentRegistration[]> => {
  const response = await fetch(
    `${TOURNAMENT_BASE_URL}/${tournamentId}/registrations`,
    { method: 'GET' },
  );

  ensureRequestSucceeded(response);

  const registrations: TournamentRegistration[] | null = await response.json();
  return registrations ?? [];
};

const registerTeamToTournament = async (
  tournamentId: number,
  token: string,
): Promise<TournamentRegistration> => {
  const response = await fetch(
    `${TOURNAMENT_BASE_URL}/${tournamentId}/registrations`,
    {
      method: 'POST',
      headers: createHeaders(token),
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("La période d'inscription est finie");
    }

    if (response.status === 400) {
      throw new Error(
        "Votre team doit avoir au moins 4 membres pour s'inscrire à un tournoi.",
      );
    }

    ensureRequestSucceeded(response);
  }

  return response.json() as Promise<TournamentRegistration>;
};

const fetchTeamActivity = async (teamId: number): Promise<TeamActivity[]> => {
  const response = await fetch(`${TEAMS_BASE_URL}/${teamId}/registrations`, {
    method: 'GET',
  });

  ensureRequestSucceeded(response);

  const activity: TeamActivity[] | null = await response.json();
  return activity ?? [];
};

export {
  fetchTournamentRegistrations,
  registerTeamToTournament,
  fetchTeamActivity,
};

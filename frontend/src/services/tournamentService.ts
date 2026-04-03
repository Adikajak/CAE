import {
  Tournament,
  CreateTournamentPayload,
  PublishTournamentPayload,
} from '../types';
import { ensureRequestSucceeded } from './apiUtils';

const TOURNAMENT_BASE_URL = '/api/tournaments';
const DUPLICATE_TOURNAMENT_NAME_MESSAGE = 'Un tournoi avec ce nom existe déjà';

const fetchTournamentById = async (
  id: number,
  token?: string,
): Promise<Tournament> => {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(`${TOURNAMENT_BASE_URL}/${id}`, {
    method: 'GET',
    headers,
  });

  ensureRequestSucceeded(response);

  return response.json() as Promise<Tournament>;
};

const fetchTournaments = async (
  token?: string,
  state?: string,
): Promise<Tournament[]> => {
  const headers: HeadersInit = {};
  const url = state
    ? `${TOURNAMENT_BASE_URL}/?state=${state}`
    : `${TOURNAMENT_BASE_URL}/`;

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  ensureRequestSucceeded(response);

  const tournamentList: Tournament[] | null = await response.json();
  return tournamentList ?? [];
};

const createTournament = async (
  token: string,
  payload: CreateTournamentPayload,
): Promise<Tournament> => {
  const response = await fetch(`${TOURNAMENT_BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  ensureRequestSucceeded(
    response,
    undefined,
    undefined,
    DUPLICATE_TOURNAMENT_NAME_MESSAGE,
  );

  return response.json() as Promise<Tournament>;
};

const publishTournament = async (
  token: string,
  tournamentId: number,
  payload: PublishTournamentPayload,
): Promise<Tournament> => {
  const response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  ensureRequestSucceeded(response);

  return response.json() as Promise<Tournament>;
};

const updateTournament = async (
  token: string,
  tournamentId: number,
  payload: CreateTournamentPayload,
): Promise<Tournament> => {
  const response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  ensureRequestSucceeded(
    response,
    undefined,
    undefined,
    DUPLICATE_TOURNAMENT_NAME_MESSAGE,
  );

  return response.json() as Promise<Tournament>;
};

const fetchTournamentsFiltered = async (
  filter: { teamName?: string; playerTag?: string },
  token?: string,
): Promise<Tournament[]> => {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = token;
  }

  const params = new URLSearchParams();
  if (filter.teamName) params.set('teamName', filter.teamName);
  if (filter.playerTag) params.set('playerTag', filter.playerTag);

  const response = await fetch(`${TOURNAMENT_BASE_URL}/?${params.toString()}`, {
    method: 'GET',
    headers,
  });

  ensureRequestSucceeded(response);

  const tournamentList: Tournament[] | null = await response.json();
  return tournamentList ?? [];
};

export {
  fetchTournaments,
  fetchTournamentById,
  fetchTournamentsFiltered,
  createTournament,
  publishTournament,
  updateTournament,
};

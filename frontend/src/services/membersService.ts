import { UserPublicProfile } from '../types';
import { createHeaders, ensureRequestSucceeded } from './apiUtils';

const MEMBRES_BASE_URL = '/api/users';

const fetchAllMembers = async (): Promise<UserPublicProfile[]> => {
  const response = await fetch(MEMBRES_BASE_URL, {
    method: 'GET',
  });

  ensureRequestSucceeded(response);

  const members: UserPublicProfile[] | null = await response.json();
  return members ?? [];
};

const fetchMemberById = async (id: number): Promise<UserPublicProfile> => {
  const response = await fetch(`${MEMBRES_BASE_URL}/${id}`, {
    method: 'GET',
  });

  ensureRequestSucceeded(response);

  return response.json() as Promise<UserPublicProfile>;
};

const banMember = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${MEMBRES_BASE_URL}/${id}/ban`, {
    method: 'PATCH',
    headers: createHeaders(token),
  });

  ensureRequestSucceeded(response);
};

export { fetchAllMembers, fetchMemberById, banMember };

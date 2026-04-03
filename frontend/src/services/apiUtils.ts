const createHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: token,
});

const ensureRequestSucceeded = (
  response: Response,
  forbiddenMessage?: string,
  badRequestMessage?: string,
  conflictMessage?: string,
) => {
  if (response.ok) {
    return;
  }

  if (response.status === 403 && forbiddenMessage) {
    throw new Error(forbiddenMessage);
  }

  if (response.status === 400 && badRequestMessage) {
    throw new Error(badRequestMessage);
  }

  if (response.status === 409 && conflictMessage) {
    throw new Error(conflictMessage);
  }

  throw new Error(`Erreur ${response.status}`);
};

export { createHeaders, ensureRequestSucceeded };

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useNavigate, useParams } from 'react-router-dom';
import TournamentDetailsPage from '../tournamentsDetails/TournamentDetailsPage';
import TournamentDetailsPageContent from '../tournamentsDetails/TournamentDetailsPageContent';
import { TournamentDetailsContext } from '../../../contexts/TournamentDetailsContext';
import { UserContext } from '../../../contexts/UserContext';
import { TournamentDetailsContextType, UserContextType } from '../../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn(), useParams: vi.fn() };
});

describe('TournamentDetailsPage', () => {
  const tournament = {
    id: 1,
    name: 'Spring Cup',
    description: 'Tournoi de printemps',
    state: 'PLANIFIED',
    stateDisplayName: 'Planifié',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    startInscriptionDate: '2026-04-01',
    endInscriptionDate: '2026-05-31',
    maxTeams: 4,
    registrationsCount: 0,
  };

  const manager = {
    id: 10,
    email: 'manager@mail.com',
    tag: 'Lynx',
    speciality: 'support',
    profilePicture: 'url',
    date: '2025-01-01',
  };

  const team = {
    id: 5,
    name: 'TEAM_ALPHA',
    manager,
    secondManager: null,
    managersCount: 1,
    membersCount: 4,
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  const createAnonymousUserContext = (): UserContextType => ({
    authenticatedUser: undefined,
    setAuthenticatedUser: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    jwtData: vi.fn().mockReturnValue(null),
    refreshUser: vi.fn(),
  });

  const createManagerUserContext = (): UserContextType => ({
    authenticatedUser: {
      id: 10,
      email: 'manager@mail.com',
      tag: 'Lynx',
      token: 'manager-token',
      teamId: 5,
    },
    setAuthenticatedUser: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    jwtData: vi
      .fn()
      .mockReturnValue({ id: 10, email: 'manager@mail.com', isAdmin: false }),
    refreshUser: vi.fn(),
  });

  const renderAnonymous = () =>
    render(
      <UserContext.Provider value={createAnonymousUserContext()}>
        <TournamentDetailsPage />
      </UserContext.Provider>,
    );

  const renderAsManager = () =>
    render(
      <UserContext.Provider value={createManagerUserContext()}>
        <TournamentDetailsPage />
      </UserContext.Provider>,
    );

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
    vi.mocked(useParams).mockReturnValue({ tournamentId: '1' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('shows invalid id message when tournamentId param is not a number', () => {
    vi.mocked(useParams).mockReturnValue({ tournamentId: 'abc' });

    const { container } = renderAnonymous();

    expect(container.textContent).toMatch(/identifiant de tournoi invalide/i);
  });

  test('returns null while loading', () => {
    fetchMock.mockImplementation(
      () => new Promise(() => undefined) as Promise<Response>,
    );

    const { container } = renderAnonymous();

    expect(container.firstChild).toBeNull();
  });

  test('renders tournament details after loading', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tournament),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    renderAnonymous();

    await waitFor(() => {
      expect(screen.getByText('Spring Cup')).toBeTruthy();
    });

    expect(screen.getByText('Tournoi de printemps')).toBeTruthy();
    expect(screen.getByText(/planifié/i)).toBeTruthy();
    expect(screen.getByText(/0 \/ 4/)).toBeTruthy();
  });

  test('renders the list of registered teams', async () => {
    const registrations = [
      {
        tournamentId: 1,
        tournamentName: 'Spring Cup',
        teamId: 99,
        teamName: 'OTHER_TEAM',
      },
    ];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tournament),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(registrations),
      });

    renderAnonymous();

    await waitFor(() => {
      expect(screen.getByText('OTHER_TEAM')).toBeTruthy();
    });
  });

  test('shows register button when user is manager of PLANIFIED tournament with room', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tournament),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(team) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    renderAsManager();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /inscrire ma team/i }),
      ).toBeTruthy();
    });
  });

  test('displays an error message when tournament fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

    renderAnonymous();

    await waitFor(() => {
      expect(
        screen.getByText(/ce tournoi n'est pas encore publié ou n'existe pas/i),
      ).toBeTruthy();
    });
  });

  test('shows and clears register error after failed registration', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tournament),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(team) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: false, status: 400 });

    renderAsManager();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /inscrire ma team/i }),
      ).toBeTruthy();
    });

    await userEvent.click(
      screen.getByRole('button', { name: /inscrire ma team/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/votre team doit avoir au moins 4 membres/i),
      ).toBeTruthy();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/votre team doit avoir au moins 4 membres/i),
      ).toBeNull();
    });
  });

  test('returns null when not loading, no error and no tournament', () => {
    const ctx: TournamentDetailsContextType = {
      tournament: null,
      registrations: [],
      loading: false,
      error: null,
      success: null,
      actionLoading: null,
      canRegister: false,
      registering: false,
      registerError: null,
      registerSuccess: false,
      isAdmin: false,
      currentUserId: undefined,
      refreshRegistrations: vi.fn(),
      registerTeam: vi.fn(),
      clearRegisterError: vi.fn(),
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      handleRefresh: vi.fn(),
      handlePublishTournament: vi.fn(),
    };

    const { container } = render(
      <TournamentDetailsContext.Provider value={ctx}>
        <TournamentDetailsPageContent />
      </TournamentDetailsContext.Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  test('shows success alert after successful registration', () => {
    const ctx: TournamentDetailsContextType = {
      tournament,
      registrations: [],
      loading: false,
      error: null,
      success: null,
      actionLoading: null,
      canRegister: false,
      registering: false,
      registerError: null,
      registerSuccess: true,
      isAdmin: false,
      currentUserId: undefined,
      refreshRegistrations: vi.fn(),
      registerTeam: vi.fn(),
      clearRegisterError: vi.fn(),
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      handleRefresh: vi.fn(),
      handlePublishTournament: vi.fn(),
    };

    render(
      <TournamentDetailsContext.Provider value={ctx}>
        <TournamentDetailsPageContent />
      </TournamentDetailsContext.Provider>,
    );

    expect(
      screen.getByText(/votre team a été inscrite avec succès/i),
    ).toBeTruthy();
  });

  test('navigates to team page when clicking a registered team link', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    const ctx: TournamentDetailsContextType = {
      tournament,
      registrations: [
        {
          tournamentId: 1,
          tournamentName: 'Spring Cup',
          teamId: 5,
          teamName: 'TEAM_ALPHA',
        },
      ],
      loading: false,
      error: null,
      success: null,
      actionLoading: null,
      canRegister: false,
      registering: false,
      registerError: null,
      registerSuccess: false,
      isAdmin: false,
      currentUserId: undefined,
      refreshRegistrations: vi.fn(),
      registerTeam: vi.fn(),
      clearRegisterError: vi.fn(),
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      handleRefresh: vi.fn(),
      handlePublishTournament: vi.fn(),
    };

    render(
      <TournamentDetailsContext.Provider value={ctx}>
        <TournamentDetailsPageContent />
      </TournamentDetailsContext.Provider>,
    );

    await userEvent.click(screen.getByText('TEAM_ALPHA'));

    expect(navigateMock).toHaveBeenCalledWith('/teams/5');
  });

  test('shows disabled button with Inscription... text while registering', () => {
    const ctx: TournamentDetailsContextType = {
      tournament,
      registrations: [],
      loading: false,
      error: null,
      success: null,
      actionLoading: null,
      canRegister: true,
      registering: true,
      registerError: null,
      registerSuccess: false,
      isAdmin: false,
      currentUserId: undefined,
      refreshRegistrations: vi.fn(),
      registerTeam: vi.fn(),
      clearRegisterError: vi.fn(),
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
      handleRefresh: vi.fn(),
      handlePublishTournament: vi.fn(),
    };

    render(
      <TournamentDetailsContext.Provider value={ctx}>
        <TournamentDetailsPageContent />
      </TournamentDetailsContext.Provider>,
    );

    const button = screen.getByRole('button', { name: /inscription\.\.\./i });
    expect(button).toBeTruthy();
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});

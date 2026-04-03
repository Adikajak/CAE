import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import TournamentTable from './TournamentTable';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

describe('TournamentTable', () => {
  const tournaments = [
    {
      id: 1,
      name: 'Spring Clash',
      description: 'Tournoi du printemps',
      state: 'IN_PREPARATION',
      stateDisplayName: 'En préparation',
      startDate: '2026-04-10',
      endDate: '2026-04-12',
      startInscriptionDate: '2026-03-01',
      endInscriptionDate: '2026-03-31',
      maxTeams: 16,
      registrationsCount: 3,
    },
  ];

  let navigateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('renders the empty state when there is no tournament', () => {
    render(<TournamentTable tournamentList={[]} />);

    expect(screen.getByText(/aucun tournoi actuellement/i)).toBeTruthy();
  });

  test('renders the expected table columns', () => {
    render(<TournamentTable tournamentList={tournaments} />);

    expect(screen.getByText('Nom')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('État')).toBeTruthy();
    expect(screen.getByText('Date de début')).toBeTruthy();
    expect(screen.getByText('Date de fin')).toBeTruthy();
    expect(screen.getByText('Début des inscriptions')).toBeTruthy();
    expect(screen.getByText('Fin des inscriptions')).toBeTruthy();
    expect(screen.getByText('Nombre de teams inscrites')).toBeTruthy();
  });

  test('renders a tournament row with formatted dates and registrationsCount', () => {
    render(<TournamentTable tournamentList={tournaments} />);

    expect(screen.getByText('Spring Clash')).toBeTruthy();
    expect(screen.getByText('Tournoi du printemps')).toBeTruthy();
    expect(screen.getByText('En préparation')).toBeTruthy();
    expect(screen.getByText('10/04/2026')).toBeTruthy();
    expect(screen.getByText('12/04/2026')).toBeTruthy();
    expect(screen.getByText('01/03/2026')).toBeTruthy();
    expect(screen.getByText('31/03/2026')).toBeTruthy();
    expect(screen.getByText('3 / 16')).toBeTruthy();
  });

  test('navigates to tournament detail page when clicking a row', async () => {
    render(<TournamentTable tournamentList={tournaments} />);

    await userEvent.click(screen.getByText('Spring Clash'));

    expect(navigateMock).toHaveBeenCalledWith('/tournaments/1');
  });

  test('renders only name and status in showOnlyName mode', () => {
    render(<TournamentTable tournamentList={tournaments} showOnlyName />);

    expect(screen.getByText('Spring Clash')).toBeTruthy();
    expect(screen.queryByText('Description')).toBeNull();
    expect(screen.queryByText('Nom')).toBeNull();
  });

  test('navigates to tournament detail page when clicking a row in showOnlyName mode', async () => {
    render(<TournamentTable tournamentList={tournaments} showOnlyName />);

    await userEvent.click(screen.getByText('Spring Clash'));

    expect(navigateMock).toHaveBeenCalledWith('/tournaments/1');
  });

  test('getStatusConfig returns correct color for OPEN state', () => {
    const openTournament = [
      { ...tournaments[0], id: 2, state: 'OPEN', name: 'Open Cup' },
    ];
    render(<TournamentTable tournamentList={openTournament} showOnlyName />);

    expect(screen.getByText('Ouvert')).toBeTruthy();
  });

  test('getStatusConfig returns correct color for PLANIFIED state', () => {
    const planifiedTournament = [
      { ...tournaments[0], id: 3, state: 'PLANIFIED', name: 'Plan Cup' },
    ];
    render(
      <TournamentTable tournamentList={planifiedTournament} showOnlyName />,
    );

    expect(screen.getByText('Planifié')).toBeTruthy();
  });

  test('getStatusConfig returns correct color for ONGOING state', () => {
    const ongoingTournament = [
      { ...tournaments[0], id: 4, state: 'ONGOING', name: 'On Cup' },
    ];
    render(<TournamentTable tournamentList={ongoingTournament} showOnlyName />);

    expect(screen.getByText('En cours')).toBeTruthy();
  });

  test('getStatusConfig returns state name for unknown state', () => {
    const unknownTournament = [
      { ...tournaments[0], id: 5, state: 'FINISHED', name: 'Done Cup' },
    ];
    render(<TournamentTable tournamentList={unknownTournament} showOnlyName />);

    expect(screen.getByText('FINISHED')).toBeTruthy();
  });

  test('getStatusConfig returns Inconnu when state is empty', () => {
    const emptyStateTournament = [
      { ...tournaments[0], id: 6, state: '', name: 'Unknown Cup' },
    ];
    render(
      <TournamentTable tournamentList={emptyStateTournament} showOnlyName />,
    );

    expect(screen.getByText('Inconnu')).toBeTruthy();
  });

  test('renders a registered tournament row without errors', () => {
    const registeredIds = new Set([1]);

    render(
      <TournamentTable
        tournamentList={tournaments}
        registeredTournamentIds={registeredIds}
      />,
    );

    expect(screen.getByText('Spring Clash')).toBeTruthy();
  });

  test('shows edit action for admin and opens a prefilled dialog', async () => {
    render(<TournamentTable tournamentList={tournaments} isAdmin />);

    await userEvent.click(screen.getByRole('button', { name: /^modifier$/i }));

    const dialog = screen.getByRole('dialog', { name: /modifier le tournoi/i });
    const dialogContent = within(dialog);

    expect(screen.getByText('Modifier le tournoi')).toBeTruthy();
    expect(dialogContent.getByDisplayValue('Spring Clash')).toBeTruthy();
    expect(
      dialogContent.getByDisplayValue('Tournoi du printemps'),
    ).toBeTruthy();
    expect(dialogContent.getByDisplayValue('2026-04-10')).toBeTruthy();
    expect(dialogContent.getByDisplayValue('2026-04-12')).toBeTruthy();
    expect(dialogContent.getByDisplayValue('2026-03-01')).toBeTruthy();
    expect(dialogContent.getByDisplayValue('2026-03-31')).toBeTruthy();
    expect(dialogContent.getByDisplayValue('16')).toBeTruthy();
  });

  test('calls onEditTournament with the selected tournament and payload', async () => {
    const onEditTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onEditTournament={onEditTournament}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /^modifier$/i }));

    const dialog = screen.getByRole('dialog');
    const dialogContent = within(dialog);

    fireEvent.change(dialogContent.getByLabelText(/^nom$/i), {
      target: { value: '  Spring Clash Reloaded  ' },
    });
    fireEvent.change(dialogContent.getByLabelText(/description/i), {
      target: { value: '  Tournoi du printemps mis a jour  ' },
    });
    fireEvent.change(
      dialogContent.getByRole('spinbutton', {
        name: /nombre maximum de teams/i,
      }),
      {
        target: { value: '32' },
      },
    );
    fireEvent.change(
      dialogContent.getByLabelText(/date du début du tournoi/i),
      {
        target: { value: '2099-04-10' },
      },
    );
    fireEvent.change(dialogContent.getByLabelText(/date de fin du tournoi/i), {
      target: { value: '2099-04-12' },
    });
    fireEvent.change(
      dialogContent.getByLabelText(/date début des inscriptions/i),
      {
        target: { value: '2099-03-01' },
      },
    );
    fireEvent.change(
      dialogContent.getByLabelText(/date limite des inscriptions/i),
      {
        target: { value: '2099-03-31' },
      },
    );

    await userEvent.click(
      dialogContent.getByRole('button', { name: /^modifier$/i }),
    );

    await waitFor(() => {
      expect(onEditTournament).toHaveBeenCalledWith(tournaments[0], {
        name: 'Spring Clash Reloaded',
        description: 'Tournoi du printemps mis a jour',
        startDate: '2099-04-10',
        endDate: '2099-04-12',
        startInscriptionDate: '2099-03-01',
        endInscriptionDate: '2099-03-31',
        maxTeams: 32,
      });
    });
  });

  test('cancelling the edit dialog does not call onEditTournament', async () => {
    const onEditTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onEditTournament={onEditTournament}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /^modifier$/i }));

    const dialog = screen.getByRole('dialog', { name: /modifier le tournoi/i });
    const dialogContent = within(dialog);
    await userEvent.click(
      dialogContent.getByRole('button', { name: /annuler/i }),
    );

    expect(onEditTournament).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /modifier le tournoi/i }),
      ).toBeNull();
    });
  });

  test('shows publish action for admin and calls onPublishTournament with payload', async () => {
    const onPublishTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onPublishTournament={onPublishTournament}
      />,
    );

    const publishButton = screen.getByRole('button', { name: /publier/i });
    expect((publishButton as HTMLButtonElement).disabled).toBe(false);

    await userEvent.click(publishButton);

    expect(screen.getByText('Confirmer la publication')).toBeTruthy();

    const confirmButton = screen
      .getAllByRole('button', { name: /publier/i })
      .find((btn) => btn.closest('[role="dialog"]'))!;
    await userEvent.click(confirmButton);

    expect(onPublishTournament).toHaveBeenCalledWith(1, {
      name: 'Spring Clash',
      description: 'Tournoi du printemps',
      startDate: '2026-04-10',
      endDate: '2026-04-12',
      startInscriptionDate: '2026-03-01',
      endInscriptionDate: '2026-03-31',
      maxTeams: 16,
      state: 'PLANIFIED',
    });
  });

  test('cancelling the confirmation dialog does not call onPublishTournament', async () => {
    const onPublishTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onPublishTournament={onPublishTournament}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /publier/i }));
    expect(screen.getByText('Confirmer la publication')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /annuler/i }));

    expect(onPublishTournament).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  test('disables publish button when tournament is not in preparation', () => {
    const onPublishTournament = vi.fn().mockResolvedValue(undefined);
    const nonPublishableTournament = [
      { ...tournaments[0], id: 7, state: 'PLANIFIED', name: 'Already Planned' },
    ];

    render(
      <TournamentTable
        tournamentList={nonPublishableTournament}
        isAdmin
        onPublishTournament={onPublishTournament}
      />,
    );

    const publishButton = screen.getByRole('button', { name: /publier/i });
    expect((publishButton as HTMLButtonElement).disabled).toBe(true);
  });

  test('disables edit button when tournament is not in preparation', () => {
    const onEditTournament = vi.fn().mockResolvedValue(undefined);
    const nonEditableTournament = [
      { ...tournaments[0], id: 8, state: 'PLANIFIED', name: 'Already Planned' },
    ];

    render(
      <TournamentTable
        tournamentList={nonEditableTournament}
        isAdmin
        onEditTournament={onEditTournament}
      />,
    );

    const editButton = screen.getByRole('button', { name: /modifier/i });
    expect((editButton as HTMLButtonElement).disabled).toBe(true);
  });

  test('disables publish button when isPublishing is true', () => {
    const onPublishTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onPublishTournament={onPublishTournament}
        isPublishing
      />,
    );

    const publishButton = screen.getByRole('button', { name: /publier/i });
    expect((publishButton as HTMLButtonElement).disabled).toBe(true);
  });

  test('disables edit button when isEditing is true', () => {
    const onEditTournament = vi.fn().mockResolvedValue(undefined);

    render(
      <TournamentTable
        tournamentList={tournaments}
        isAdmin
        onEditTournament={onEditTournament}
        isEditing
      />,
    );

    const editButton = screen.getByRole('button', { name: /modifier/i });
    expect((editButton as HTMLButtonElement).disabled).toBe(true);
  });

  test('does not fail when publish is clicked without onPublishTournament handler', async () => {
    render(<TournamentTable tournamentList={tournaments} isAdmin />);

    await userEvent.click(screen.getByRole('button', { name: /publier/i }));
    expect(screen.getByText('Confirmer la publication')).toBeTruthy();

    await userEvent.click(
      screen
        .getAllByRole('button', { name: /publier/i })
        .find((btn) => btn.closest('[role="dialog"]'))!,
    );

    expect(screen.getAllByText('Spring Clash').length).toBeGreaterThan(0);
  });
});

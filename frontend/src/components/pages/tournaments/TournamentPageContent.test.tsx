import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TournamentPageContent from './TournamentPageContent';
import { TournamentContext } from '../../../contexts/TournamentContext';
import { TournamentContextType } from '../../../types';

vi.mock('./components/TournamentActions', () => ({
  default: () => <div>Tournament actions</div>,
}));

vi.mock('./components/TournamentCreateFormContainer', () => ({
  default: () => <div>Tournament create form</div>,
}));

vi.mock('./components/TournamentFilters', () => ({
  default: () => <div>Tournament filters</div>,
}));

vi.mock('./components/TournamentTable', () => ({
  default: (props: {
    isAdmin: boolean;
    isPublishing: boolean;
    isEditing: boolean;
  }) => (
    <div>
      <div>Table admin: {String(props.isAdmin)}</div>
      <div>Table publishing: {String(props.isPublishing)}</div>
      <div>Table editing: {String(props.isEditing)}</div>
    </div>
  ),
}));

const defaultTournament = {
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
  registrationsCount: 0,
};

const createTournamentContextValue = (
  overrides: Partial<TournamentContextType> = {},
): TournamentContextType =>
  ({
    loading: false,
    error: null,
    tournamentList: [defaultTournament],
    filteredTournaments: [defaultTournament],
    helpText: 'Cliquez sur un tournoi pour consulter son détail.',
    isAdmin: true,
    today: '2026-03-27',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startInscriptionDate: '',
    endInscriptionDate: '',
    maxTeams: '2',
    submitting: false,
    formError: null,
    formSuccess: null,
    publishing: false,
    publishError: null,
    publishSuccess: null,
    editing: false,
    editError: null,
    editSuccess: null,
    refreshTournaments: vi.fn().mockResolvedValue(undefined),
    setName: vi.fn(),
    setDescription: vi.fn(),
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    setStartInscriptionDate: vi.fn(),
    setEndInscriptionDate: vi.fn(),
    setMaxTeams: vi.fn(),
    submitTournamentCreation: vi.fn(),
    handlePublishTournament: vi.fn(),
    handleEditTournament: vi.fn(),
    stateFilter: null,
    yearFilter: null,
    monthFilter: null,
    tournamentNameFilter: '',
    dayOfWeekFilter: null,
    durationFilter: null,
    availabilityFilter: null,
    teamNameFilter: '',
    playerTagFilter: '',
    fromDateFilter: '',
    toDateFilter: '',
    setFromDateFilter: vi.fn(),
    setToDateFilter: vi.fn(),
    registeredTournamentIds: new Set(),
    setStateFilter: vi.fn(),
    setYearFilter: vi.fn(),
    setMonthFilter: vi.fn(),
    setTournamentNameFilter: vi.fn(),
    setDayOfWeekFilter: vi.fn(),
    setDurationFilter: vi.fn(),
    setAvailabilityFilter: vi.fn(),
    setTeamNameFilter: vi.fn(),
    setPlayerTagFilter: vi.fn(),
    resetFilters: vi.fn(),
    hasActiveFilters: false,
    isTeamNameDisabled: false,
    isPlayerTagDisabled: false,
    isAvailableOptionDisabled: false,
    isYearIncompatibleWithState: false,
    isMonthIncompatibleWithState: false,
    disabledMonths: new Set<number>(),
    ...overrides,
  }) as TournamentContextType;

const renderComponent = (
  tournamentContextValue: TournamentContextType = createTournamentContextValue(),
) =>
  render(
    <TournamentContext.Provider value={tournamentContextValue}>
      <TournamentPageContent />
    </TournamentContext.Provider>,
  );

describe('TournamentPageContent', () => {
  test('renders loading state', () => {
    renderComponent(createTournamentContextValue({ loading: true }));

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  test('renders error state', () => {
    renderComponent(createTournamentContextValue({ error: 'Erreur 500' }));

    expect(screen.getByText(/erreur : erreur 500/i)).toBeTruthy();
  });

  test('shows creation form only for admins', () => {
    const { rerender } = render(
      <TournamentContext.Provider
        value={createTournamentContextValue({ isAdmin: false })}
      >
        <TournamentPageContent />
      </TournamentContext.Provider>,
    );

    expect(screen.queryByText('Tournament create form')).toBeNull();

    rerender(
      <TournamentContext.Provider
        value={createTournamentContextValue({ isAdmin: true })}
      >
        <TournamentPageContent />
      </TournamentContext.Provider>,
    );

    expect(screen.getByText('Tournament create form')).toBeTruthy();
  });

  test('renders help text and filters', () => {
    renderComponent(
      createTournamentContextValue({
        helpText: 'Custom help text',
      }),
    );

    expect(screen.getByText('Custom help text')).toBeTruthy();
    expect(screen.getByText('Tournament filters')).toBeTruthy();
  });

  test('renders publish and edit feedback messages from context', () => {
    renderComponent(
      createTournamentContextValue({
        publishError: 'Erreur 409',
        publishSuccess: 'Tournoi publié avec succès.',
        editError: 'Erreur modification',
        editSuccess: 'Tournoi modifié avec succès.',
      }),
    );

    expect(screen.getByText(/erreur : erreur 409/i)).toBeTruthy();
    expect(screen.getByText('Tournoi publié avec succès.')).toBeTruthy();
    expect(screen.getByText(/erreur : erreur modification/i)).toBeTruthy();
    expect(screen.getByText('Tournoi modifié avec succès.')).toBeTruthy();
  });

  test('passes admin and action loading flags to the table', () => {
    renderComponent(
      createTournamentContextValue({
        isAdmin: true,
        publishing: true,
        editing: true,
      }),
    );

    expect(screen.getByText('Table admin: true')).toBeTruthy();
    expect(screen.getByText('Table publishing: true')).toBeTruthy();
    expect(screen.getByText('Table editing: true')).toBeTruthy();
  });
});

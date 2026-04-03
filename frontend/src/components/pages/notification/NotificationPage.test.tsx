import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../contexts/UserContext';
import NotificationPage from './NotificationPage';
import type {
  UserContextType,
  Notification as NotificationType,
} from '../../../types';
import {
  fetchNotifications,
  markNotificationAsRead,
  acceptTeamInvitation,
  declineTeamInvitation,
} from '../../../services/notificationService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('../../../services/notificationService', () => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  acceptTeamInvitation: vi.fn(),
  declineTeamInvitation: vi.fn(),
}));

describe('NotificationPage', () => {
  let navigateMock: ReturnType<typeof vi.fn>;

  const authenticatedUser = {
    id: 1,
    email: 'test@test.com',
    token: 'test-token',
    tag: 'testuser',
    admin: false,
  };

  const mockNotifications: NotificationType[] = [
    {
      notificationId: 1,
      object: 'Bienvenue !',
      message: 'Votre compte a été créé avec succès.',
      createdAt: new Date('2026-03-01T10:00:00'),
      isRead: false,
      type: 'WELCOME',
    },
    {
      notificationId: 2,
      object: 'Nouvelle demande',
      message: 'Un joueur souhaite rejoindre votre équipe.',
      createdAt: new Date('2026-03-01T10:00:00'),
      isRead: false,
      type: 'TEAM_INVITATION',
      membershipId: 5,
    },
    {
      notificationId: 3,
      object: 'Notification lue',
      message: 'Cette notification a déjà été lue.',
      createdAt: new Date('2026-03-01T10:00:00'),
      isRead: true,
      type: 'GENERAL',
    },
  ];

  const createUserContextValue = (
    user: typeof authenticatedUser | null = authenticatedUser,
  ): UserContextType => ({
    authenticatedUser: user ?? undefined,
    setAuthenticatedUser: vi.fn(), // ADD THIS
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    refreshUser: vi.fn(),
    jwtData: vi
      .fn()
      .mockReturnValue(user ? { email: user.email, isAdmin: false } : null),
  });

  const renderNotificationPage = (
    userContextValue = createUserContextValue(),
  ) =>
    render(
      <UserContext.Provider value={userContextValue}>
        <NotificationPage />
      </UserContext.Provider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(fetchNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);
    vi.mocked(acceptTeamInvitation).mockResolvedValue(undefined);
    vi.mocked(declineTeamInvitation).mockResolvedValue(undefined);
  });

  test('redirects to login when not authenticated', () => {
    renderNotificationPage(createUserContextValue(null));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('renders notifications list after fetch', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Bienvenue !')).toBeDefined();
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
      expect(screen.getByText('Notification lue')).toBeDefined();
    });
  });

  test('shows "Aucune notification" when list is empty', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([]);
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Aucune notification')).toBeDefined();
    });
  });

  test('expands notification on click and shows message', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Bienvenue !')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() => {
      expect(
        screen.getByText('Votre compte a été créé avec succès.'),
      ).toBeDefined();
    });
  });

  test('collapses notification on second click', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Bienvenue !')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() => {
      expect(
        screen.getByText('Votre compte a été créé avec succès.'),
      ).toBeDefined();
    });
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() => {
      expect(
        screen.queryByText('Votre compte a été créé avec succès.'),
      ).toBeNull();
    });
  });

  test('marks notification as read on button click', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Bienvenue !')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() => {
      expect(screen.getByText('Marquer comme lu')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Marquer comme lu'));
    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith('test-token', 1);
    });
  });

  test('shows accept and decline buttons for TEAM_INVITATION', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Accepter')).toBeDefined();
      expect(screen.getByText('Refuser')).toBeDefined();
    });
  });

  test('accepts team invitation and calls correct service', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Accepter')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Accepter'));
    await waitFor(() => {
      expect(acceptTeamInvitation).toHaveBeenCalledWith('test-token', 5);
    });
  });

  test('opens decline dialog when refuse button clicked', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Refuser')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Refuser la demande')).toBeDefined();
    });
  });

  test('shows error when declining with empty reason', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Refuser')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Confirmer le refus')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Confirmer le refus'));
    await waitFor(() => {
      expect(screen.getByText('Veuillez entrer une raison.')).toBeDefined();
    });
  });

  test('declines team invitation with reason and calls correct service', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Refuser')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Confirmer le refus')).toBeDefined();
    });
    fireEvent.change(screen.getByLabelText('Raison du refus'), {
      target: { value: 'Pas assez expérimenté' },
    });
    fireEvent.click(screen.getByText('Confirmer le refus'));
    await waitFor(() => {
      expect(declineTeamInvitation).toHaveBeenCalledWith(
        'test-token',
        5,
        'Pas assez expérimenté',
      );
    });
  });
  test('shows unknown error when fetchNotifications throws non-Error', async () => {
    vi.mocked(fetchNotifications).mockRejectedValue('unknown error');
    renderNotificationPage();
    await waitFor(() => {
      expect(
        screen.getByText('Une erreur inconnue est survenue'),
      ).toBeDefined();
    });
  });
  test('shows unknown error when markAsRead throws non-Error', async () => {
    vi.mocked(markNotificationAsRead).mockRejectedValue('unknown error');
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Bienvenue !')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() => {
      expect(screen.getByText('Marquer comme lu')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Marquer comme lu'));
    await waitFor(() => {
      expect(
        screen.getByText('Une erreur inconnue est survenue'),
      ).toBeDefined();
    });
  });

  test('shows unknown error when acceptTeamInvitation throws non-Error', async () => {
    vi.mocked(acceptTeamInvitation).mockRejectedValue('unknown error');
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => {
      expect(screen.getByText('Accepter')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Accepter'));
    await waitFor(() => {
      expect(
        screen.getByText('Une erreur inconnue est survenue'),
      ).toBeDefined();
    });
  });

  test('shows unknown error when declineTeamInvitation throws non-Error', async () => {
    vi.mocked(declineTeamInvitation).mockRejectedValue('unknown error');
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Confirmer le refus')).toBeDefined();
    });
    fireEvent.change(screen.getByLabelText('Raison du refus'), {
      target: { value: 'raison' },
    });
    fireEvent.click(screen.getByText('Confirmer le refus'));
    await waitFor(() => {
      expect(
        screen.getByText('Une erreur inconnue est survenue'),
      ).toBeDefined();
    });
  });
  test('closes dialog when onClose is triggered', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Refuser la demande')).toBeDefined();
    });
    fireEvent.keyDown(screen.getByText('Refuser la demande'), {
      key: 'Escape',
      code: 'Escape',
    });
    await waitFor(() => {
      expect(screen.queryByText('Refuser la demande')).toBeNull();
    });
  });
  test('closes dialog when Annuler is clicked', async () => {
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('Nouvelle demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle demande'));
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => {
      expect(screen.getByText('Refuser la demande')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => {
      expect(screen.queryByText('Refuser la demande')).toBeNull();
    });
  });
  test('fetchNotificationsData returns early when user is null mid-render', async () => {
    const ctx = createUserContextValue();
    vi.mocked(fetchNotifications).mockResolvedValue([]);
    renderNotificationPage(ctx);
    await waitFor(() => {
      expect(fetchNotifications).toHaveBeenCalledTimes(1);
    });
  });

  test('shows error message when fetchNotifications throws an Error instance', async () => {
    vi.mocked(fetchNotifications).mockRejectedValue(new Error('fetch failed'));
    renderNotificationPage();
    await waitFor(() => {
      expect(screen.getByText('fetch failed')).toBeDefined();
    });
  });

  test('shows error message when markNotificationAsRead throws an Error instance', async () => {
    vi.mocked(markNotificationAsRead).mockRejectedValue(
      new Error('mark failed'),
    );
    renderNotificationPage();
    await waitFor(() => expect(screen.getByText('Bienvenue !')).toBeDefined());
    fireEvent.click(screen.getByText('Bienvenue !'));
    await waitFor(() =>
      expect(screen.getByText('Marquer comme lu')).toBeDefined(),
    );
    fireEvent.click(screen.getByText('Marquer comme lu'));
    await waitFor(() => {
      expect(screen.getByText('mark failed')).toBeDefined();
    });
  });

  test('calls markAsRead after accepting team invitation', async () => {
    renderNotificationPage();
    await waitFor(() =>
      expect(screen.getByText('Nouvelle demande')).toBeDefined(),
    );
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => expect(screen.getByText('Accepter')).toBeDefined());
    fireEvent.click(screen.getByText('Accepter'));
    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith('test-token', 2);
    });
  });

  test('shows error message when acceptTeamInvitation throws an Error instance', async () => {
    vi.mocked(acceptTeamInvitation).mockRejectedValue(
      new Error('accept failed'),
    );
    renderNotificationPage();
    await waitFor(() =>
      expect(screen.getByText('Nouvelle demande')).toBeDefined(),
    );
    fireEvent.click(screen.getByText('Nouvelle demande'));
    await waitFor(() => expect(screen.getByText('Accepter')).toBeDefined());
    fireEvent.click(screen.getByText('Accepter'));
    await waitFor(() => {
      expect(screen.getByText('accept failed')).toBeDefined();
    });
  });

  test('shows error message when declineTeamInvitation throws an Error instance', async () => {
    vi.mocked(declineTeamInvitation).mockRejectedValue(
      new Error('decline failed'),
    );
    renderNotificationPage();
    await waitFor(() =>
      expect(screen.getByText('Nouvelle demande')).toBeDefined(),
    );
    fireEvent.click(screen.getByText('Nouvelle demande'));
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() =>
      expect(screen.getByText('Confirmer le refus')).toBeDefined(),
    );
    fireEvent.change(screen.getByLabelText('Raison du refus'), {
      target: { value: 'raison valide' },
    });
    fireEvent.click(screen.getByText('Confirmer le refus'));
    await waitFor(() => {
      expect(screen.getByText('decline failed')).toBeDefined();
    });
  });
});

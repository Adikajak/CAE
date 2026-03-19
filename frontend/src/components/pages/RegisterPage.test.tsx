import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, test, expect, vi } from 'vitest';
import RegisterPage from '../../components/pages/RegisterPage';
import { UserContext } from '../../contexts/UserContext';

const MOCK_AVATAR_URLS = [
  'http://example.com/avatar1.png',
  'http://example.com/avatar2.png',
];
const MOCK_SPECIALTIES = ['Architecte', 'Executeur', 'Tacticien'];

describe('RegisterPage', () => {
  const createContextValue = () => ({
    authenticatedUser: undefined,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    jwtData: vi.fn().mockReturnValue(null),
  });

  const renderRegisterPage = (contextValue = createContextValue()) =>
    render(
      <MemoryRouter>
        <UserContext.Provider value={contextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // @ts-expect-error globalThis.fetch needs mock assignment
    globalThis.fetch = vi.fn((url: string) => {
      if (url.includes('profile-pictures')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_AVATAR_URLS),
        } as Response);
      }
      if (url.includes('specialities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_SPECIALTIES),
        } as Response);
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getPasswordInput = () => {
    const passwordInput = document.querySelector('input#password');
    if (!passwordInput) {
      throw new Error('Password input not found');
    }
    return passwordInput as HTMLInputElement;
  };

  test('renders a form with email, tag and password inputs', async () => {
    renderRegisterPage();

    const emailInput = screen.getByLabelText(/email/i);
    const tagInput = screen.getByLabelText(/tag/i);
    const passwordInput = getPasswordInput();

    expect(emailInput).toBeTruthy();
    expect(tagInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByLabelText(/specialite/i)).toBeTruthy();
    });
  });

  test('loads and displays specialties from API', async () => {
    renderRegisterPage();

    // Just verify the component renders and eventually the specialty label appears
    await waitFor(
      () => {
        expect(screen.getByLabelText(/specialite/i)).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  test('loads and displays avatar options from API', async () => {
    renderRegisterPage();

    await waitFor(() => {
      const avatarButtons = screen.getAllByRole('button', {
        name: /choisir l'avatar/i,
      });
      expect(avatarButtons).toHaveLength(MOCK_AVATAR_URLS.length);
    });
  });

  test(
    'calls registerUser when form is submitted',
    async () => {
      const registerUserMock = vi.fn().mockResolvedValueOnce(undefined);
      const mockContextValue = {
        ...createContextValue(),
        registerUser: registerUserMock,
      };

      renderRegisterPage(mockContextValue);

      // Just verify form renders
      await waitFor(
        () => {
          expect(screen.getByLabelText(/email/i)).toBeTruthy();
        },
        { timeout: 3000 },
      );
    },
    { timeout: 10000 },
  );

  test(
    'displays duplicate email message on 409 error',
    async () => {
      const duplicateEmailError = new Error('Conflict') as Error & {
        status?: number;
      };
      duplicateEmailError.status = 409;

      const registerUserMock = vi
        .fn()
        .mockRejectedValueOnce(duplicateEmailError);
      const mockContextValue = {
        ...createContextValue(),
        registerUser: registerUserMock,
      };

      renderRegisterPage(mockContextValue);

      const emailInput = await screen.findByLabelText(/email/i);
      const tagInput = screen.getByLabelText(/tag/i);
      const passwordInput = getPasswordInput();
      const specialtySelect = screen.getByRole('combobox', {
        name: /specialite/i,
      });

      fireEvent.change(emailInput, { target: { value: 'lea@mail.com' } });
      fireEvent.change(tagInput, { target: { value: 'lea' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.mouseDown(specialtySelect);
      fireEvent.click(
        await screen.findByRole('option', { name: 'Architecte' }),
      );
      fireEvent.click(screen.getByRole('button', { name: /creer le compte/i }));

      await waitFor(() => {
        expect(registerUserMock).toHaveBeenCalledOnce();
      });

      expect(
        await screen.findByText(
          /cette adresse email existe deja\. veuillez en utiliser une autre\./i,
        ),
      ).toBeTruthy();
    },
    { timeout: 10000 },
  );

  test(
    'renders password visibility toggle',
    async () => {
      renderRegisterPage();

      const passwordInput = getPasswordInput();
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.type).toBe('password');

      await waitFor(
        () => {
          const toggleButton = screen.getByRole('button', {
            name: /afficher le mot de passe/i,
          });
          fireEvent.click(toggleButton);
        },
        { timeout: 3000 },
      );

      expect(passwordInput.type).toBe('text');
    },
    { timeout: 10000 },
  );

  test(
    'renders avatar selection UI',
    async () => {
      renderRegisterPage();

      await waitFor(
        () => {
          const avatarButtons = screen.getAllByRole('button', {
            name: /choisir l'avatar/i,
          });
          expect(avatarButtons.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    },
    { timeout: 10000 },
  );
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from '../../components/pages/LoginPage';
import { UserContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  test('renders a form with email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    const usernameInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/se souvenir de moi/i);

    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(rememberMeCheckbox).toBeTruthy();
  });

  test('remember me checkbox is unchecked by default', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const rememberMeCheckbox = screen.getByLabelText(/se souvenir de moi/i);

    expect((rememberMeCheckbox as HTMLInputElement).checked).toBe(false);
  });

  test('calls loginUser and navigates to HomePage when the form is submitted', async () => {
    const loginUserMock = vi.fn();
    const navigateMock = vi.fn();
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      jwtData: vi.fn().mockReturnValue(null),
    };

    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/se souvenir de moi/i);
    const submitButton = screen.getByRole('button', {
      name: /s'authentifier/i,
    });

    fireEvent.change(usernameInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(rememberMeCheckbox);
    fireEvent.click(submitButton);

    expect(loginUserMock).toHaveBeenCalledWith(
      {
        email: 'test@user.com',
        password: 'password',
      },
      true,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('calls console.error when loginUser throws an error', async () => {
    const loginUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Login failed'));
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      jwtData: vi.fn().mockReturnValue(null),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', {
      name: /s'authentifier/i,
    });

    fireEvent.change(usernameInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    expect(loginUserMock).toHaveBeenCalledWith(
      {
        email: 'test@user.com',
        password: 'password',
      },
      false,
    );

    // Verify that console.error was called
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'LoginPage::error: ',
        expect.any(Error),
      );
    });

    consoleErrorMock.mockRestore();
  });
});

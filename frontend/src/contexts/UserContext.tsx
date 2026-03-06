import { createContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
  UserRegister,
  JwtPayload,
} from '../types';

import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {},
  clearUser: () => {},
  jwtData: () => {
    return null;
  },
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(() => getAuthenticatedUser());

  const registerUser = async (newUser: UserRegister) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/register', options);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const createdUser: AuthenticatedUser = await response.json();

      setAuthenticatedUser(createdUser);
      storeAuthenticatedUser(createdUser);
      console.log('createdUser: ', createdUser);
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  const loginUser = async (user: User) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/login', options);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const authenticatedUser: AuthenticatedUser = await response.json();
      console.log('authenticatedUser: ', authenticatedUser);

      setAuthenticatedUser(authenticatedUser);
      storeAuthenticatedUser(authenticatedUser);
    } catch (err) {
      console.error('loginUser::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
  };

  const jwtData = () => {
    if (authenticatedUser == null || authenticatedUser.token == null) {
      return null;
    }

    const decodedToken = jwtDecode(authenticatedUser.token);

    if (decodedToken == null || typeof decodedToken === 'string') {
      return null;
    }

    return decodedToken as JwtPayload;
  };

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
    jwtData,
  };

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };

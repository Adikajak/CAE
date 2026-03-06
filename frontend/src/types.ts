interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
  jwtData: () => JwtPayload | null;
}

interface User {
  email: string;
  password: string;
}

interface AuthenticatedUser {
  email: string;
  token: string;
}

interface JwtPayload {
  email: string;
  admin: boolean;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  JwtPayload,
};

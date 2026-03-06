interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: UserRegister) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
  jwtData: () => JwtPayload | null;
}

interface User {
  email: string;
  password: string;
}

interface UserRegister {
  email: string;
  password: string;
  tag: string;
  speciality: string;
  profile_picture: string;
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
  UserRegister,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  JwtPayload,
};

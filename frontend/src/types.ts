interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: UserRegister) => Promise<void>;
  loginUser: (user: User) => Promise<void>;
  clearUser: () => void;
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

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  User,
  UserRegister,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
};

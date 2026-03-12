interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  setAuthenticatedUser?: (user: AuthenticatedUser) => void;
  registerUser: (newUser: UserRegister) => Promise<void>;
  loginUser: (user: User, rememberMe: boolean) => Promise<void>;
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
  teamId?: number;
}

interface JwtPayload {
  email: string;
  admin: boolean;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

interface Notification {
  notificationId: number;
  object: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

interface TeamUserProfile {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  profilePicture: string;
  date: string;
}

interface Team {
  id: number;
  name: string;
  manager?: TeamUserProfile | null;
  secondManager?: TeamUserProfile | null;
}

interface TeamMembership {
  id: number;
  member: TeamUserProfile;
  team: Team;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED';
  rejectionReason?: string;
}

export type {
  User,
  UserRegister,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  JwtPayload,
  Notification,
  TeamUserProfile,
  Team,
  TeamMembership,
};

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  setAuthenticatedUser?: (user: MaybeAuthenticatedUser) => void;
  registerUser: (newUser: UserRegister) => Promise<void>;
  loginUser: (user: User, rememberMe: boolean) => Promise<void>;
  clearUser: () => void;
  jwtData: () => JwtPayload | null;
}

interface User {
  email: string;
  password: string;
}

interface UserProfile {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  profilePicture: string;
  date: string;
}

interface UserRegister {
  email: string;
  password: string;
  tag: string;
  speciality: string;
  profile_picture: string;
}

interface AuthenticatedUser {
  id: number;
  email: string;
  tag: string;
  token: string;
  teamId?: number;
}

interface TeamUser {
  id: number;
}
interface JwtPayload {
  id: number;
  email: string;
  isAdmin: boolean;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

interface Notification {
  notificationId: number;
  object: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  type: 'WELCOME' | 'TEAM_INVITATION' | 'GENERAL';
  membershipId?: number;
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
  manager?: TeamUser | null;
  secondManager?: TeamUser | null;
  managersCount: number;
  membersCount: number;
}

interface TeamMembership {
  id: number;
  member: TeamUserProfile;
  team: Team;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED';
  rejectionReason?: string;
}

interface Profile {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  teamName?: string;
  profilePicture: string;
  date: string;
  isManager?: boolean;
  isAdmin: boolean;
}

interface Unavailability {
  id: number;
  startDate: string;
  endDate: string;
}

interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

export type {
  User,
  UserProfile,
  UserRegister,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  JwtPayload,
  Notification,
  TeamUserProfile,
  Team,
  TeamUser,
  TeamMembership,
  Profile,
  Unavailability,
  AvatarOption,
};

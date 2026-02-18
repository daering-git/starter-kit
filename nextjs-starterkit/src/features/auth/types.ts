// Auth feature types — add your domain types here

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
};

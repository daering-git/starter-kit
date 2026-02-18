// Users feature types — add your domain types here

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarUrl?: string;
  createdAt: string;
};

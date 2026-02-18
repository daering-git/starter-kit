import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // UI hint: only show accounts from this Workspace domain
          ...(ALLOWED_DOMAIN && { hd: ALLOWED_DOMAIN }),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const googleProfile = profile as {
          hd?: string;
          email_verified?: boolean;
          email?: string;
        };

        // Skip domain restriction if ALLOWED_DOMAIN is not set
        if (!ALLOWED_DOMAIN) return true;

        // 3-layer domain verification
        return (
          googleProfile.email_verified === true &&
          googleProfile.hd === ALLOWED_DOMAIN &&
          googleProfile.email?.endsWith(`@${ALLOWED_DOMAIN}`) === true
        );
      }
      return false;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (profile) {
        token.hd = (profile as { hd?: string }).hd;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

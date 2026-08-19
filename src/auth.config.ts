import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma / bcrypt) shared by middleware and the full
// server-side auth setup in `src/auth.ts`.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.level = user.level;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.level = token.level as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

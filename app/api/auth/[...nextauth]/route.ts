import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log('[Auth] authorize called', { username: credentials?.username });
        if (!credentials?.username || !credentials?.password) {
          console.log('[Auth] missing credentials');
          throw new Error("Credenciales inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.passwordHash) {
          console.log('[Auth] user not found or no passwordHash', { username: credentials.username });
          throw new Error("Usuario no encontrado");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          console.log('[Auth] invalid password for', { username: credentials.username });
          throw new Error("Contraseña incorrecta");
        }

        console.log('[Auth] authorize success', { userId: user.id, role: user.role });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('[Auth][jwt] called', { token, user });
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[Auth][session] called', { session, token });
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async signIn({ user }) {
      console.log('[Auth][signIn] called', { user });
      // If the user is an admin, redirect to the admin dashboard after sign in
      try {
        if ((user as any).role === "ADMIN") {
          console.log('[Auth][signIn] redirecting admin to /dashboard/admin');
          // allow sign in; actual redirect handled in `redirect` callback
          return true;
        }
      } catch (e) {
        console.log('[Auth][signIn] error checking role', e);
        // fallback to default
      }
      return true;
    },
    async redirect({ url, baseUrl, token }) {
      console.log('[Auth][redirect] called', { url, baseUrl, token });
      try {
        if ((token as any)?.role === 'ADMIN') {
          console.log('[Auth][redirect] admin detected, redirecting to /dashboard/admin');
          return '/dashboard/admin';
        }
      } catch (e) {
        console.log('[Auth][redirect] error', e);
      }
      // default
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

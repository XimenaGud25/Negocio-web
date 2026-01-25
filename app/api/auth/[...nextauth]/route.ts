import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  // Ensure a stable secret is provided via environment. If this value
  // changes while users have active sessions, existing encrypted tokens
  // will fail to decrypt ("Invalid Compact JWE"). Set NEXTAUTH_SECRET
  // in your environment (e.g. .env.local) and ask users to clear cookies
  // if you rotate the secret.
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Por favor ingresa usuario y contraseña");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.passwordHash) {
            throw new Error("Usuario o contraseña incorrectos");
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            throw new Error("Usuario o contraseña incorrectos");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email || "",
            username: user.username,
            role: user.role,
          };
        } catch (error: any) {
          // Log del error real para debugging (solo en consola del servidor)
          console.error('Auth error:', error);
          
          // Si es un error de Prisma/Base de datos
          if (error.code === 'P1001' || error.message?.includes('database server') || error.message?.includes('connect')) {
            throw new Error("Servicio temporalmente no disponible. Por favor intenta más tarde");
          }
          
          // Si es un error de credenciales que ya manejamos arriba
          if (error.message?.includes('Usuario o contraseña') || error.message?.includes('Por favor ingresa')) {
            throw error;
          }
          
          // Para cualquier otro error técnico, mostrar mensaje genérico
          throw new Error("Error al iniciar sesión. Por favor intenta nuevamente");
        }
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
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si es una URL relativa, construir la URL completa
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Si la URL es del mismo dominio, permitirla
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Por defecto, redirigir al baseUrl
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

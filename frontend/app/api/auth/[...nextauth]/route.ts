import NextAuth, { AuthOptions, DefaultSession, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

// 1. EXTENSIÓN DE TIPOS (Module Augmentation)
// Esto le enseña a TypeScript que nuestros usuarios tienen "id" y "jwt"
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      jwt: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    jwt: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    jwt: string;
  }
}

// 2. CONFIGURACIÓN DE AUTH
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Conectamos con Strapi
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`, {
            method: 'POST',
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();

          if (!res.ok || !data.jwt) {
            return null;
          }

          // Retornamos el objeto con la estructura que definimos arriba en "interface User"
          return {
            id: data.user.id.toString(),
            name: data.user.username,
            email: data.user.email,
            jwt: data.jwt, 
          };
        } catch (error) {
          console.error("Error auth:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Aquí pasamos el token JWT a la sesión del navegador
    async jwt({ token, user }) {
      if (user) {
        token.jwt = user.jwt;
        token.id = user.id;
      }
      return token;
    },
    // Aquí hacemos disponible el token en el frontend (useSession)
    async session({ session, token }) {
      if (token) {
        session.user.jwt = token.jwt;
        session.user.id = token.id;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
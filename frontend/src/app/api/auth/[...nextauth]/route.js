import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import jwt from 'jsonwebtoken';

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      const res = await fetch('http://backend:5000/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          avatar_url: user.image,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
        }),
      });
      if (!res.ok) return false;
      const dbUser = await res.json();
      user.userId = dbUser.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId;
      session.backendToken = jwt.sign(
        { userId: token.userId, email: token.email },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '1h' }
      );
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

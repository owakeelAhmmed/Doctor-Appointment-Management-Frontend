import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log("Login API response:", res.data);

          if (res.data.success && res.data.data) {
            const { user, token } = res.data.data;
            
            // Return complete user object with role and verification status
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role,
              token: token,
              verificationStatus: user.verificationStatus,
              needsProfileCompletion: user.needsProfileCompletion,
              needsDocumentSubmission: user.needsDocumentSubmission,
              isVerified: user.isVerified
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.token = user.token;
        token.email = user.email;
        token.name = user.name;
        token.verificationStatus = user.verificationStatus;
        token.needsProfileCompletion = user.needsProfileCompletion;
        token.needsDocumentSubmission = user.needsDocumentSubmission;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        token: token.token,
        verificationStatus: token.verificationStatus,
        needsProfileCompletion: token.needsProfileCompletion,
        needsDocumentSubmission: token.needsDocumentSubmission,
        isVerified: token.isVerified
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
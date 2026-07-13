import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import connectToDatabase from "./lib/db/mongodb";
import User from "./lib/db/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectToDatabase();
          
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name || "Unknown",
              email: user.email || "",
              image: user.image || "",
            });
          }
          
          // Override the provider's user ID with our database user ID
          user.id = dbUser._id.toString();
          
          return true;
        } catch (error) {
          console.error("Error saving user to database", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add the user ID to the session object
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
});

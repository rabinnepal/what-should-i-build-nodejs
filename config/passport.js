const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./index');
const { generateToken } = require('../utils/auth');

// Only set up serialization in non-test environment
if (process.env.NODE_ENV !== 'test') {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails[0].value },
                { googleId: profile.id }
              ]
            }
          });

          if (!user) {
            // Create new user if doesn't exist
            user = await prisma.user.create({
              data: {
                email: profile.emails[0].value,
                username: profile.displayName,
                googleId: profile.id,
                password: '', // Social login users don't need password
              }
            });
          } else if (!user.googleId) {
            // Update existing user with Google ID
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id }
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails?.[0]?.value },
                { githubId: profile.id }
              ]
            }
          });

          if (!user) {
            // Create new user if doesn't exist
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value || `${profile.id}@github.com`,
                username: profile.username,
                githubId: profile.id,
                password: '', // Social login users don't need password
              }
            });
          } else if (!user.githubId) {
            // Update existing user with GitHub ID
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId: profile.id }
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport; 
const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserModel = require('../models/User');

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret_key123', 
};

passport.use(new JWTstrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await UserModel.findById(jwt_payload.id);
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));


passport.initialize();

module.exports = passport;

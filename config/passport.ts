const utility = require("../utils/packages");

const JWTStrategy = utility.passportJWT.Strategy;
var ExtractJWT = utility.passportJWT.ExtractJwt;
var opts: any = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

var LocalStrategy = require("passport-local").Strategy;
const mysql = require("../database/mysql");

utility.passport.use(
  new JWTStrategy(opts, async (jwt_payload: any, done: any) => {
    let checkers = utility.appCache.has(
      "checkToken" +
        jwt_payload.id +
        ":" +
        jwt_payload.email +
        jwt_payload.iat +
        jwt_payload.exp
    );
    if (checkers) {
      let user = utility.appCache.get(
        "checkToken" +
          jwt_payload.id +
          ":" +
          jwt_payload.email +
          jwt_payload.iat +
          jwt_payload.exp
      );
      return done(null, user);
    } else {
      var checkToken = await mysql.dbs.Oauth.findOne({
        where: {
          id: jwt_payload.id,
          email: jwt_payload.email,
          iat: jwt_payload.iat,
          exp: jwt_payload.exp,
        },
      });

      if (!checkToken) {
        return done({ message: "Unathorized" });
      }

      await mysql.dbs.Users.findOne({ where: { id: jwt_payload.id } })
        .then((user: any) => {
          if (!user) {
            return done({ message: "Unathorized" });
          }

          utility.appCache.set(
            "checkToken" +
              jwt_payload.id +
              ":" +
              jwt_payload.email +
              jwt_payload.iat +
              jwt_payload.exp,
            user
          );
          return done(null, user);
        })
        .catch((error: any) => {
          return done({ message: "Unathorized" });
        });
    }
  })
);

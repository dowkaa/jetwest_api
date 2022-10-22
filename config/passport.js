"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const utility = require("../utils/packages");
const JWTStrategy = utility.passportJWT.Strategy;
var ExtractJWT = utility.passportJWT.ExtractJwt;
var opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;
var LocalStrategy = require("passport-local").Strategy;
const mysql = require("../database/mysql");
utility.passport.use(new JWTStrategy(opts, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    var checkToken = yield mysql.dbs.Oauth.findOne({
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
    yield mysql.dbs.Users.findOne({ where: { id: jwt_payload.id } })
        .then((user) => {
        if (!user) {
            return done({ message: "Unathorized" });
        }
        return done(null, user);
    })
        .catch((error) => {
        return done({ message: "Unathorized" });
    });
})));

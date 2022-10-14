"use strict";
const packages = require("./packages");
function createServer() {
    const app = packages.express();
    // cross origin middleware
    app.use(packages.cors());
    // set security HTTP headers
    app.use(packages.helmet());
    // session
    app.use(packages.cookieParser());
    app.use(packages.session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: { maxAge: 600000 },
    }));
    app.use(packages.bodyParser.urlencoded({ extended: true }));
    app.use(packages.bodyParser.json());
    app.use("/api/jetwest/public/", packages.publicRoute);
    app.use("/api/jetwest/auth/", packages.authRouth);
    app.use(packages.passport.initialize());
    app.use((req, res, next) => {
        res.header("Acces-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if (req.method == "OPTIONS") {
            req.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATCH, GET");
            return res.status(200).json({});
        }
        next();
    });
    app.use((error, req, res, next) => {
        if (error.message == "Unathorized from server") {
            return res
                .status(401)
                .json(packages.helpers.sendError("Email does not exist"));
        }
        res.status(error.status || 500);
        res.json({
            error: {
                status: "ERROR",
                message: error.message,
            },
        });
    });
    // Error handling middleware
    app.use((err, req, res, next) => {
        let errCode, errMessage;
        if (err.errors) {
            errCode = 400;
            const keys = Object.keys(err.errors);
            errMessage = err.errors[keys[0]].message;
        }
        else {
            errCode = err.status || 500;
            errMessage = err.message || "Internal Server Error";
        }
        res.status(errCode).type("txt").send(errMessage);
    });
    // Landing page
    app.use("/", (req, res, next) => {
        res.status(200).json({ success: true });
    });
    return app;
}
module.exports = { createServer };

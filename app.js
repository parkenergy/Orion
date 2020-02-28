"use strict";

require("@google-cloud/debug-agent").start({
    projectId: "park-energy-production",
    keyFilename: "./service-account.json",
    serviceContext: {
        service: "Orion",
        version: require("./package.json").version
    }
});

const express = require("express"),
    config = require("./config.js"),
    path = require("path"),
    fs = require("fs"),
    helpers = require("./lib/helpers"),
    DS = require("./lib/databaseScripts"),
    Agenda = require("agenda"),
    log = require("./lib/helpers/logger"),
    sessions = require("client-sessions"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    compression = require("compression");

//Catch uncaught exceptions to log in bunyan
process.on("uncaughtException", err => {
    log.fatal(
        {
            stack: err.stack || null,
            code: err.code || null
        },
        err.message || err
    );

    //DO NOT CONTINUE EXECUTION. Process could be in undefined state, safer to exit.
    process.exit(1); //Uncaught exception exit code
});

// use es6 promises
mongoose.Promise = Promise;

//log environment
log.info({ env: process.env.NODE_ENV }, "Starting for environment");

//start mongoose and restart mongoose
log.info({ uri: config.mongodb }, "Connecting to MongoDB[Mongoose]");
const connectWithRetry = () => {
    console.log("MongoDB connection with retry");
    return mongoose.connect(config.mongodb);
};
mongoose.connection.on("error", err => {
    console.log(`Mongodb connection error: ${err}`);
    setTimeout(connectWithRetry, 5000);
});
mongoose.connection.on("connect", () => {
    console.log("MongoDB connected");
});
const connection = connectWithRetry();
// mongoose.createConnection(config.mongodb).catch(err => {console.log(err)});
// mongoose.connect(config.mongodb);

//Init Express
const app = express();

app.use(compression());

//CORS
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
    }
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "POST, PUT, GET, PATCH, OPTIONS"
    );
    next();
});

log.info({ path: path.resolve(config.viewsPath) }, "Setup views path");
app.set("view engine", "ejs");
app.set("views", path.resolve(config.viewsPath));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/lib/public", express.static(path.join(__dirname, "/lib/public")));

//Serve SPA(index.ejs)
app.get("/", (req, res) => {
    const model = { appName: "Orion", title: "Orion" };
    res.render("index", model);
});

//Standard middleware
log.info("Load standard middleware");
app.use(bodyParser.json({ type: "*/*", limit: "100mb", extended: true }));

app.use(cookieParser());
app.use(
    sessions({
        cookieName: "identity", // cookie name dictates the key name added to the request object
        secret: "?wG!6C5/gn@6&W{U+]Rn>B#9/p.ku&*{x~XCjfw+E)q56Hxr", // should be a large unguessable string
        duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    })
);

//Load custom middleware
log.info(
    { path: path.join(__dirname, "/lib/middleware") },
    "Load middleware from path"
);
loader(path.join(__dirname, "/lib/middleware"));

//Load routes
log.info(
    { path: path.join(__dirname, "/lib/routes") },
    "Load routes from path"
);
loader(path.join(__dirname, "/lib/routes"));

// Pull in the agenda tasks to. They are gathered and all started in this file. require it here.
// require('./lib/tasks/Agenda/agenda');
const ApplicationAgenda = require("./lib/tasks/Agenda/agenda");
ApplicationAgenda.start();

//Listen
log.info("Starting app...");

app.listen(process.env.PORT || config.port, () => {
    log.info({ port: process.env.PORT || config.port }, "App started");
});

//Loader helper
function loader(dir) {
    dir = path.resolve(dir);

    fs.readdirSync(dir).forEach(fileName => {
        const modulePath = path.join(dir, fileName);
        log.info(
            { path: modulePath, file: __filename, fn: "#loader()" },
            "Load module"
        );
        require(modulePath)(app);
    });
}

process.on("SIGTERM", ApplicationAgenda.graceful);
process.on("SIGINT", ApplicationAgenda.graceful); // ctrl+c

const express = require("express");
const port = 8000;
const path = require("path");
const logger = require("morgan");
const env = require("./config/environment");
var session = require("express-session");
const sassMiddleware = require("node-sass-middleware");
const expressLayout = require("express-ejs-layouts");
const db = require("./config/mongoose");
const MongoStore = require("connect-mongo")(session);

const passport = require("passport");
const passportLocal = require("./config/passport-local-stratergy");
const googlePassport = require("./config/passport-google-auth2-Stratergy");
const morgan = require("morgan");
const app = express();
require("./config/view-helpers")(app);
const chatServer = require("http").Server(app);
const chatSockets = require("./config/chat_socket").chatSockets(chatServer);
chatServer.listen(5000);
console.log("chat server is listening on port :>> 5000");
app.use(expressLayout);
app.use(
  sassMiddleware({
    src: path.join(env.asset_path, "scss"),
    dest: path.join(env.asset_path, "css"),
    debug: true,
    outputStyle: "extended",
    prefix: "/css",
  })
);
app.use(
  session({
    name: "ChatEngine",
    secret: env.session_cookie_key,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);
app.use(express.static("./assets"));
app.use(logger(env.morgan.mode, env.morgan.options));
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layouts extractStyles", true);
app.set("layouts extractScripts", true);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/", require("./routes"));
app.listen(port, (error) => {
  if (error) {
    console.log(`Error in connecting to PORT :>> ${port} `);
  }
  console.log(`Successfully connected to PORT :>> ${port} `);
});

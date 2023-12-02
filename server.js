const express = require("express");
const expressLayout = require("express-ejs-layouts");
const { PrismaClient } = require("@prisma/client");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const cors = require("cors");
const homeRouter = require("./server/routes/home.route");
const userRouter = require("./server/routes/user.route");
const errorController = require("./server/controllers/error.controller");

const app = express();

const { port } = require("./server/config/config");
// const session = require("express-session");

const myport = port || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(expressLayout);

app.use(
  session({
    secret: "yoursecret starts here",
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
    },
  })
);

app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.user = req.cookies.token;
  next();
});

app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use(homeRouter);
app.use(userRouter);

//app.use(errorController.get401);
app.use(errorController.get404);

app.listen(process.env.PORT || myport, () => {
  console.log(`listening on port ${myport}`);
});

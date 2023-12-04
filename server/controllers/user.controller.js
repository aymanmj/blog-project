const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorController = require("./error.controller");
const flash = require("connect-flash");

const jwtSecret = process.env.JWT_SECRET;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.render("401", { pageTitle: "Unauthorized Page" });
  }

  try {
    const decode = jwt.verify(token, jwtSecret);
    req.userId = decode.userId;
    next();
  } catch (error) {
    return res.render("401", { pageTitle: "Unauthorized Page" });
  }
};

async function userLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.User.findUnique({
      where: { email: email },
    });

    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
      //return res.status(401).json({ messsage: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save((err) => {
      console.log("session error: ", err);
      res.redirect("/admin/dashboard");
    });
    //console.log(req.session.user);
    //return res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error);
  }
}

async function AddUser(req, res, next) {
  try {
    const { fullname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          fullname: fullname,
          email: email,
          password: hashedPassword,
        },
      });
      req.flash(
        "success",
        "Congratulations, your account has been successfully created"
      );
      return res.redirect("/registration-success");
      //return res.redirect("/login");
      //res.status(201).json({ messsage: "User created", user });
    } catch (error) {
      if (error.code === "P2002") {
        console.log(error);
        req.flash("error", "User already exists");
        return res.redirect("/signup");
        //return res.status(409).json({ messsage: "User already exists" });
      }
      req.flash("serverError", "Internal server error");
      return res.redirect("/signup");
      // res.status(500).json({ messsage: "Internal server error" });
      //console.log(error);
    }
  } catch (error) {
    console.log("userLogin: ", error.message);
  }
}

async function userLogout(req, res, next) {
  try {
    req.session.isLoggedIn = false;
    req.user = false;
    req.session.destroy((err) => {
      console.log(err);
    });
    res.clearCookie("token");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  AddUser,
  userLogin,
  authMiddleware,
  userLogout,
  // AddTask,
  // updateTask,
  // deleteTask,
};

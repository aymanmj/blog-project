const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorController = require("./error.controller");

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
      return res.status(401).json({ messsage: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ messsage: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    req.session.user = true;
    res.redirect("/dashboard");
  } catch (error) {}
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
      res.status(201).json({ messsage: "User created", user });
    } catch (error) {
      if (error.code === "P2002") {
        console.log(error);
        return res.status(409).json({ messsage: "User already exists" });
      }
      res.status(500).json({ messsage: "Internal server error" });
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function userLogout(req, res, next) {
  try {
    req.session.user = false;
    req.session.destroy();
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

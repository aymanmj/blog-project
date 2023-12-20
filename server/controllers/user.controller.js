const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { addHours } = require("date-fns");
const nodemailer = require("../../node_modules/nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const sendgridMail = require("@sendgrid/mail");
const { validationResult } = require("express-validator");
// const errorController = require("./error.controller");
// const flash = require("connect-flash");

const jwtSecret = process.env.JWT_SECRET;

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
      // "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",
    },
  })
);

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  return;
};

async function getUserLogin(req, res, next) {
  try {
    const isLoggedIn = req.session.isLoggedIn;

    if (!isLoggedIn) {
      return res.render("login", {
        pageTitle: "Login Page",
        isLoggeIn: req.session.isLoggeIn,
        messages: req.flash(),
      });
    }

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error);
  }
}

async function postUserLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
      //return res.status(401).json({ messsage: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash("error", "Invalid email or password");
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

async function getAddUser(req, res, next) {
  try {
    const isLoggedIn = req.session.isLoggedIn;

    if (!isLoggedIn) {
      return res.render("signup", {
        pageTitle: "Sign-up Page",
        messages: req.flash(),
      });
    }
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error);
  }
}

async function postAddUser(req, res, next) {
  try {
    const { fullname, email, password } = req.body;
    const error = validationResult(req);
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

      res.redirect("/registration-success");
      const msg = {
        to: email, // Change to your recipient
        from: "info@ayman.ly", // Change to your verified sender
        subject: "Signup succeeded!",
        //text: "Your account has been successfully created",
        html: "<h1>Your account has been successfully created</h1>",
      };
      return sendgridMail
        .send(msg)
        .then(() => {
          console.log("Email sent successfully!");
        })
        .catch((error) => {
          console.error(error);
        });

      // return transporter.sendMail({
      //   to: email,
      //   from: "aymanjaballa@gmail.com",
      //   subject: "Signup succeeded!",
      //   html: "<h1>Your account has been successfully created</h1",
      // });

      //return res.redirect("/login");
      //res.status(201).json({ messsage: "User created", user });
    } catch (error) {
      if (error.code === "P2002") {
        req.flash("error", "User already exists");
        return res.redirect("/signup");
        //return res.status(409).json({ messsage: "User already exists" });
      }

      console.log(error);
      req.flash("serverError", "Internal server error");
      return res.redirect("/signup");
      //console.log(error);
      // res.status(500).json({ messsage: "Internal server error" });
    }
  } catch (error) {
    console.log("userLoginError ", error.message);
  }
}

async function getPasswordReset(req, res, next) {
  res.render("reset", {
    pageTitle: "Reset password page",
    // isLoggeIn: req.session.isLoggeIn,
    messages: req.flash(),
  });
}

async function postPasswordReset(req, res, next) {
  crypto.randomBytes(32, (err, buf) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const email = req.body.email;
    const token = buf.toString("hex");
    prisma.user
      .findUnique({
        where: { email: email },
      })
      .then((user) => {
        if (!user) {
          req.flash("error", "there is no user with email " + email);
          return res.redirect("/reset");
        }
        const useresetToken = token;
        const userDateTokenExp = addHours(Date.now(), 1);
        const updateUser = prisma.user
          .update({
            where: { email: email },
            data: {
              resetToken: useresetToken,
              resetTokenExpiration: userDateTokenExp,
            },
          })
          .then((updateUser) => {
            console.log("user updated: ", updateUser.fullname);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .then(async (result) => {
        const msg = {
          to: email, // Change to your recipient
          from: "info@ayman.ly", // Change to your verified sender
          subject: "Reset Password!",
          //text: "Your account has been successfully created",
          html: `
          <strong>You requested reset password</strong>
          <p>click this <a href="http://3.14.147.81:5000/reset/${token}">link</a> to set a new password for your account</p>
          `,
        };
        try {
          await sendgridMail.send(msg);
          console.log("Reset email sent successfully!");
        } catch (error) {
          console.error(error);
        }
        res.redirect("/");
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

async function getNewPassword(req, res, next) {
  const token = req.params.token;
  const email = req.body.email;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiration: { gt: new Date() },
      },
    });
    if (!user) {
      return console.log("couldn't find user");
    }
    res.render("new-password", {
      pageTitle: "New password page",
      userId: user.id,
      passwordToken: token,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
  }
}

async function postNewPassword(req, res, next) {
  try {
    const newPassword = req.body.password;
    const userId = parseInt(req.body.userId);
    const passwordToken = req.body.passwordToken;
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await prisma.user.update({
      where: {
        id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: { gt: new Date() },
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiration: null,
      },
    });

    if (user) {
      return res.redirect("/login");
    }
    req.flash("error", "Something went wrong!!");
  } catch (error) {
    console.log(error);
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
  getUserLogin,
  postUserLogin,
  getAddUser,
  postAddUser,
  authMiddleware,
  userLogout,
  getPasswordReset,
  postPasswordReset,
  getNewPassword,
  postNewPassword,
  // AddTask,
  // updateTask,
  // deleteTask,
};

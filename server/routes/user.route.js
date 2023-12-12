const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
const { query, check } = require("express-validator");

const adminLayout = "../views/layouts/admin";

userRouter.get("/login", userController.getUserLogin);
userRouter.post("/login", userController.postUserLogin);

userRouter.get("/reset", userController.getPasswordReset);

userRouter.post("/reset", userController.postPasswordReset);

userRouter.get("/reset/:token", userController.getNewPassword);
userRouter.post("/new-password", userController.postNewPassword);

userRouter.get(
  "/admin/dashboard",
  userController.authMiddleware,
  postController.getUserPosts
);

userRouter.get("/signup", userController.getAddUser);
userRouter.post(
  "/signup",
  check("email").isEmail(),
  userController.postAddUser
);

userRouter.get("/registration-success", (req, res) => {
  res.render("registration-success", {
    pageTitle: "Sign-up Page",
    messages: req.flash(),
  });
});

userRouter.get(
  "/logout",
  userController.authMiddleware,
  userController.userLogout
);
module.exports = userRouter;

// userRouter.get("/dashboard", userController.authMiddleware, (req, res) => {
//   res.render("admin/dashboard", {
//     pageTitle: "Admin Page",
//     layout: adminLayout,
//   });
// });

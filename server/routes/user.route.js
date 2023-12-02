const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");

const adminLayout = "../views/layouts/admin";

userRouter.get("/login", (req, res) => {
  res.render("login", { pageTitle: "Login Page" });
});

userRouter.get(
  "/dashboard",
  userController.authMiddleware,
  postController.getUserPosts
);

// userRouter.get("/dashboard", userController.authMiddleware, (req, res) => {
//   res.render("admin/dashboard", {
//     pageTitle: "Admin Page",
//     layout: adminLayout,
//   });
// });

userRouter.post("/login", userController.userLogin);

userRouter.get("/signup", (req, res) => {
  res.render("signup", { pageTitle: "Sign-up Page" });
});
userRouter.post("/signup", userController.AddUser);

userRouter.get(
  "/logout",
  userController.authMiddleware,
  userController.userLogout
);
module.exports = userRouter;

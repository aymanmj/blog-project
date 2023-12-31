const express = require("express");
const homeRouter = express.Router();
const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");

homeRouter.get("/", postController.getIndex);

homeRouter.get(
  "/admin/add-post",
  userController.authMiddleware,
  postController.getAddPost
);

homeRouter.post(
  "/admin/add-post",
  userController.authMiddleware,
  postController.AddPost
);

homeRouter.get(
  "/admin/edit-post/:id",
  userController.authMiddleware,
  postController.getEditPost
);

homeRouter.post(
  "/admin/edit-post",
  userController.authMiddleware,
  postController.postEditPost
);

homeRouter.post(
  "/admin/delete-post",
  userController.authMiddleware,
  postController.deletePost
);

homeRouter.get("/about", (req, res) => {
  res.render("about", { pageTitle: "About Page" });
});

homeRouter.get("/contact", (req, res) => {
  res.render("contact", { pageTitle: "Contact Page" });
});

homeRouter.get("/post/:id", postController.getPost);

module.exports = homeRouter;

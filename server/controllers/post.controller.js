const { PrismaClient } = require("@prisma/client");
const userController = require("../controllers/user.controller");
const flash = require("connect-flash");

const prisma = new PrismaClient();

const adminLayout = "../views/layouts/admin";

// Home page
async function getIndex(req, res, next) {
  try {
    const perPage = 3;
    const page = parseInt(req.query.page) || 1;
    const skip = perPage * page - perPage;
    9;
    const posts = await prisma.post.findMany({
      where: {
        postStatus: true,
      },
      take: perPage,
      skip: skip,
      orderBy: { createdAt: "desc" },
    });

    //const count = posts.length;
    const totalCount = await prisma.post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(totalCount / perPage);

    res.render("index", {
      posts: posts,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      pageTitle: "Home Page",
    });
  } catch (error) {
    console.log(error);
  }
}

async function getPost(req, res, next) {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    const authorId = post.authorId;
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    res.render("post", {
      post: post,
      author: author,
      pageTitle: "Post Page",
    });
  } catch (error) {
    console.log(error);
  }
}

async function getAddPost(req, res, next) {
  try {
    const userid = parseInt(req.userId);

    const user = await prisma.user.findUnique({
      where: { id: userid },
    });

    res.render("admin/add-post", {
      user: user,
      pageTitle: "Add Post",
      messages: req.flash(),
      layout: adminLayout,
    });
  } catch (error) {
    // req.flash("serverError", "Internal server error");
    // return res.redirect("/admin/add-post");
    console.log(error);
  }
}

async function AddPost(req, res, next) {
  try {
    const { title, content, imageUrl } = req.body;
    //const userid = parseInt(req.userId);
    const user = req.user;
    try {
      const post = await prisma.post.create({
        data: {
          title: title,
          content: content,
          authorId: user.id,
          imageUrl: imageUrl,
        },
      });

      res.redirect("/admin/dashboard");
    } catch (error) {
      req.flash("serverError", "Internal server error addpost");
      return res.redirect("/admin/add-post");
      //console.log(error);
      //res.status(500).json({ messsage: "Internal server error" });
    }
  } catch (error) {
    req.flash("serverError", "Internal server error");
    return res.redirect("/admin/add-post");
    //console.log(error);
  }
}

async function getEditPost(req, res, next) {
  try {
    //const userid = parseInt(req.userId);
    const edituser = req.user;
    const user = await prisma.user.findUnique({
      where: { id: edituser.id },
    });
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    res.render("admin/edit-post", {
      post: post,
      user: user,
      pageTitle: "Edit Post",
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
}

async function postEditPost(req, res, next) {
  try {
    const userid = parseInt(req.user.id);
    const editpost = req.body;

    const userPost = await prisma.post.findFirst({
      where: {
        authorId: userid,
      },
    });

    if (!userPost) {
      return res.redirect("/");
    }

    await prisma.post.update({
      where: { id: parseInt(editpost.postId) },
      data: {
        title: editpost.title,
        imageUrl: editpost.imageUrl,
        content: editpost.content,
      },
    });

    res.redirect("/admin/dashboard");
    // const user = await prisma.User.findUnique({
    //   where: { id: userid },
    // });
    // const postId = parseInt(req.params.id);
    // const post = await prisma.Post.findUnique({
    //   where: { id: postId },
    // });

    // res.render("admin/edit-post", {
    //   post: post,
    //   user: user,
    //   pageTitle: "Edit Post",
    //   layout: adminLayout,
    // });
  } catch (error) {
    console.log(error);
  }
}

async function getUserPosts(req, res, next) {
  try {
    const user = req.user;
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        postStatus: true,
      },
    });
    return res.render("admin/dashboard", {
      posts: posts,
      user: user,
      pageTitle: "Admin Page",
      // messages: req.flash(),
      layout: adminLayout,
    });

    // req.flash("serverError", "Internal server error getuerspost");
    // return res.redirect("/admin/dashboard");
  } catch (error) {
    //req.flash("serverError", "Internal server error");
    //res.redirect("/admin/dashboard");
    console.log(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const postId = parseInt(req.body.postId);
    await prisma.post.update({
      where: { id: postId, authorId: req.user.id },
      data: {
        postStatus: false,
      },
    });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getIndex,
  getPost,
  getAddPost,
  AddPost,
  getEditPost,
  postEditPost,
  getUserPosts,
  deletePost,
  // AddTask,
  // updateTask,
  // deleteTask,
};

// async function getIndex(req, res, next) {
//     try {
//       const posts = await prisma.post.findMany();

//       res.render("index", {
//         posts: posts,
//         pageTitle: "Home Page",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   }

// const posts = await prisma.post
//   .aggregate({ orderBy: { createdAt: -1 } })
//   .skip(perPage * Page - perPage)
//   .limit(perPage)

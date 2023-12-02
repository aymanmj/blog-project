const { PrismaClient } = require("@prisma/client");
const userController = require("../controllers/user.controller");
const prisma = new PrismaClient();

const adminLayout = "../views/layouts/admin";

// Home page
async function getIndex(req, res, next) {
  try {
    // res.locals.user = req.cookies.token;
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
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    res.render("post", {
      post: post,
      pageTitle: "Post Page",
    });
  } catch (error) {
    console.log(error);
  }
}

async function getAddPost(req, res, next) {
  try {
    const userid = parseInt(req.userId);
    const user = await prisma.User.findUnique({
      where: { id: userid },
    });

    res.render("admin/add-post", {
      user: user,
      pageTitle: "Add Post",
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
}

async function AddPost(req, res, next) {
  try {
    const { title, content } = req.body;
    const userid = parseInt(req.userId);
    try {
      const post = await prisma.post.create({
        data: {
          title: title,
          content: content,
          authorId: userid,
          imageUrl: "https://mdbcdn.b-cdn.net/img/new/standard/city/018.jpg",
        },
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      res.status(500).json({ messsage: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function getEditPost(req, res, next) {
  try {
    const userid = parseInt(req.userId);
    const user = await prisma.User.findUnique({
      where: { id: userid },
    });
    const postId = parseInt(req.params.id);
    const post = await prisma.Post.findUnique({
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
    const userid = parseInt(req.userId);
    const editpost = req.body;

    await prisma.Post.update({
      where: { id: parseInt(editpost.postId) },
      data: {
        title: editpost.title,
        content: editpost.content,
      },
    });

    res.redirect("/dashboard");
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
    const userid = parseInt(req.userId);
    const user = await prisma.User.findUnique({
      where: { id: userid },
    });

    const posts = await prisma.post.findMany({
      where: {
        authorId: userid,
        postStatus: true,
      },
    });

    res.render("admin/dashboard", {
      posts: posts,
      user: user,
      pageTitle: "Admin Page",
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const postId = parseInt(req.body.postId);
    console.log(postId);
    await prisma.Post.update({
      where: { id: postId },
      data: {
        postStatus: false,
      },
    });
    res.redirect("/dashboard");
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

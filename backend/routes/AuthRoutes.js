const express = require("express");
const UserModel = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PostModel = require("../Model/PostModel");
const BookmarkModel = require("../Model/BookmarkModel");
const router = express.Router();
const mongoose = require("mongoose");

const secretKey = "#$%%#$%%%#$$%!!!";

router.post("/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
    if (user) {
      return res.status(409).json({
        message: "User is already exist, you can login",
        success: false,
      });
    }
    const userModel = new UserModel({ name, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({
      message: "Signup successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server errror33",
      success: false,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res
        .send(404)
        .json({ status: false, message: "Require alll fields" });
    }

    const user = await UserModel.findOne({ name });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.send({ status: false, message: "Invalid credntials" });
    }

    const token = jwt.sign({ id: user._id, name: name }, secretKey, {
      expiresIn: "1hr",
    });

    return res.status(200).json({ message: "sucess", token: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

router.post("/post", async (req, res) => {
  try {
    const { slides, postedBy, MainCategory } = req.body; // Expect the 'slides' array in the request body

    // Check if slides are provided and if they meet the required criteria
    if (!slides || slides.length < 3) {
      return res.status(400).json({
        message: "At least 3 slides are required.",
        success: false,
      });
    }

    // Create a new PostModel document with the slides array
    const postModal = new PostModel({ slides, postedBy, MainCategory });

    // Save the post in the database
    await postModal.save();

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: postModal, // Optionally return the saved post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Assuming you are using Express and your PostModel is imported

router.get("/posts/:username", async (req, res) => {
  try {
    const { username } = req.params; // Get the user's name from the URL

    // Find posts where 'postedBy' matches the username
    const userPosts = await PostModel.find({ postedBy: username });

    if (!userPosts.length) {
      return res.status(404).json({
        message: "No posts found for this user",
        success: false,
      });
    }

    res.status(200).json({
      message: "Posts retrieved successfully",
      success: true,
      posts: userPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Route to get stories by category
router.get("/stories/:category", async (req, res) => {
  const category = req.params.category;

  try {
    // Find all posts with slides that match the given category
    const stories = await PostModel.find({ MainCategory: category });

    if (stories.length === 0) {
      return res
        .status(404)
        .json({ message: "No stories found for this category" });
    }

    res.json({ posts: stories });
  } catch (error) {
    console.error("Error fetching stories by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/post/:postId/slide/:slideId/like", async (req, res) => {
  const { postId, slideId } = req.params;

  try {
    // Find the post by postId
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the specific slide by slideId
    const slide = post.slides.id(slideId);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    // Return the likeCount of the specific slide
    res.json({ likeCount: slide.likeCount });
  } catch (error) {
    console.error("Error fetching like count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Backend Route for incrementing like count for a slide
router.put("/post/:postId/slide/:slideId/like", async (req, res) => {
  const { postId, slideId } = req.params;

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the slide within the post
    const slide = post.slides.id(slideId);

    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    // Increment like count
    slide.likeCount += 1;

    // Save the post with updated like count
    await post.save();

    // Return the updated like count
    res.json({ likeCount: slide.likeCount });
  } catch (error) {
    console.error("Error updating like count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Bookmark a story
// router.post("/posts/:postId/bookmark", async (req, res) => {
//   const { postId } = req.params;
//   const userId = req.body.userId; // This will come from the request body (logged-in user)

//   try {
//     const post = await PostModel.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     // Check if the user already bookmarked the post
//     const alreadyBookmarked = post.bookmarkedBy.includes(userId);

//     if (alreadyBookmarked) {
//       return res.status(400).json({ message: "Post already bookmarked" });
//     }

//     // Add user to the bookmarkedBy array
//     post.bookmarkedBy.push(userId);
//     await post.save();

//     return res.status(200).json({ message: "Post bookmarked successfully" });
//   } catch (error) {
//     console.error("Error bookmarking the post:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.post("/posts/:postId/bookmark", async (req, res) => {
  const { postId } = req.params;
  const userId = req.body.userId; // This comes from the request body

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already bookmarked the post in PostModel
    const alreadyBookmarked = post.bookmarkedBy.includes(userId);
    if (alreadyBookmarked) {
      return res.status(400).json({ message: "Post already bookmarked" });
    }

    // Add user to the bookmarkedBy array in PostModel
    post.bookmarkedBy.push(userId);
    await post.save();

    // Find or create a Bookmark record for the user
    let userBookmarks = await BookmarkModel.findOne({ user: userId });

    if (!userBookmarks) {
      // If the user doesn't have a Bookmark document yet, create one
      userBookmarks = new BookmarkModel({
        user: userId,
        bookmarkedStories: [postId],
      });
    } else {
      // Add the postId to the bookmarkedStories array if it isn't already there
      if (!userBookmarks.bookmarkedStories.includes(postId)) {
        userBookmarks.bookmarkedStories.push(postId);
      }
    }

    await userBookmarks.save();

    return res.status(200).json({ message: "Post bookmarked successfully" });
  } catch (error) {
    console.error("Error bookmarking the post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by-name/:name", async (req, res) => {
  const { name } = req.params;
  console.log("Route hit for name:", req.params.name);
  // res.send("User found");

  try {
    // Find the user by name
    const user = await UserModel.findOne({ name });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user ID
    res.json({ userId: user._id });
  } catch (error) {
    console.error("Error fetching user by name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/bookmarks/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user's bookmarks based on userId
    const bookmarks = await BookmarkModel.findOne({ user: userId }).populate(
      "bookmarkedStories"
    );

    if (!bookmarks || bookmarks.bookmarkedStories.length === 0) {
      return res.status(404).json({ message: "No bookmarked stories found" });
    }

    res.json({ posts: bookmarks.bookmarkedStories });
  } catch (error) {
    console.error("Error fetching bookmarked stories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find the post by its ID
    const post = await PostModel.findById(id);

    // If post not found, return 404
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return the post if found
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { slides, mainCategory } = req.body;

    // Find the post by ID and update it with the new details
    const updatedPost = await PostModel.findByIdAndUpdate(
      id,
      {
        slides,
        MainCategory: mainCategory,
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

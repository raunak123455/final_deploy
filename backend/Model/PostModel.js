const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SlideSchema = new Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },

  likeCount: {
    type: Number,
    required: true,
  },
});

const PostSchema = new mongoose.Schema(
  {
    slides: {
      type: [SlideSchema],
      required: true,
      minLength: 3,
      maxLength: 6,
    },
    postedBy: {
      type: String,
      required: true,
    },
    MainCategory: {
      type: String,
      required: true,
    },
    // Add an array to track which users bookmarked the post
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId, // Assuming users have unique IDs
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("post", PostSchema);
module.exports = PostModel;

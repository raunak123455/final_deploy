const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to User model (matches UserModel registration)
    required: true,
  },
  bookmarkedStories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // Matches the model name in PostModel
      required: true,
    },
  ],
});

const BookmarkModel = mongoose.model("Bookmark", BookmarkSchema);
module.exports = BookmarkModel;

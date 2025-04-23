const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
    },
    image: {
      type: String,
    },
    tags: [String],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    location: {
      type: {
        type: String, 
        enum: ['Point'], 
        // required: true
      },
      coordinates: {
        type: [Number], 
        // required: true
      }
    },
  },
  { timestamps: true }
);

postSchema.index({ location: "2dsphere" }, { sparse: true });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;

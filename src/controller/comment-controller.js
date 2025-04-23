const Post = require("../modals/post-model");
const Comment = require("../modals/comment-model");

const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const user = req.user.id;
    const newComment = await Comment.create({
      postId: id,
      user,
      comment,
    });

    if(!newComment) {
      return res.status(500).json({
        success: false,
        message: "Failed to add comment",
      });
    }

    return res.status(200).json({message : "comment added successfully"});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentId } = req.body;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const user = req.user.id;

    if (user.toString() !== post.userId.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ postId: postId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: err.message,
    });
  }
};

module.exports = {
  commentOnPost,
  deleteComment,
  getCommentsByPostId,
};

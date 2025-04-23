const {Router} = require("express");
const { commentOnPost, deleteComment, getCommentsByPostId } = require("../controller/comment-controller");
const verifyUser = require("../middleware/auth.middleware");

const router = Router();


router.post("/comment-post/:id",verifyUser,commentOnPost);
router.delete("/delete-comment/:id",verifyUser,deleteComment);
router.get("/comments/:postId",getCommentsByPostId);


module.exports = router;
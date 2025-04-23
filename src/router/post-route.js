const {Router} = require("express");
const verifyUser = require("../middleware/auth.middleware");
const { createPost, deletePost, editPost, likePost, getAllPost, getSmartFeed } = require("../controller/post-controller");
const upload = require("../middleware/multer.middleware");

const router = Router();


router.post("/create-post",verifyUser,upload.fields([
    {name:"postImg",maxCount:1},
]),createPost);
router.delete("/delete-post/:id",verifyUser,deletePost);
router.patch("/edit-post/:id",verifyUser,editPost);
router.post("/like-post-toggle/:id",verifyUser,likePost);

router.get("/get-all-post",verifyUser,getAllPost);


router.get("/feed",getSmartFeed);

module.exports = router;
const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logOutUser,
  generateAccessToken,
  updateProfile,
  changeUserName,
  uploadImg,
  saveLocation,
  getFollowers,
  getFollowing,
  toggleFollowandUnFollow,
  getMyProfile,
} = require("../controller/user-controller");
const verifyUser = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", verifyUser, logOutUser);

router.get("/generate-access-token", generateAccessToken);

router.put("/update-profile", verifyUser, updateProfile);
router.patch("/change-username", verifyUser, changeUserName);
router.post(
  "/upload-profilepic",
  verifyUser,
  upload.fields([
    {
      name: "profileImg",
      maxCount: 1,
    },
  ]),
  uploadImg
);

router.patch("/save-location", verifyUser, saveLocation);
router.get("/get-followers/:id", verifyUser, getFollowers);
router.get("/get-following/:id", verifyUser, getFollowing);

router.post(
  "/toggle-follow-unfollow/:userId",
  verifyUser,
  toggleFollowandUnFollow
);

router.get("/get-user", verifyUser, getMyProfile);

module.exports = router;

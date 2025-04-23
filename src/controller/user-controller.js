const bcrypt = require("bcrypt");
const User = require("../modals/user-model");
const jwt = require("jsonwebtoken");
const uploadOnCloudinary = require("../utils/cloudinary");

const generateTokens = async (payload, secreateKey, expiresIn) => {
  const token = await jwt.sign(payload, secreateKey, { expiresIn });
  return token;
};

const registerUser = async (req, res) => {
  console.log("Register claaadfs")
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json({ message: "User already exist" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashedPassword });
  if (user) {
    return res.status(200).json({ message: "User created successfully" });
  } else {
    return res.status(400).json({ message: "User not created" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("login user")

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User does not exists" });
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);

    if (!comparePassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = await generateTokens(
      { id: findUser._id, email: findUser.email },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
    );
    const refreshToken = await generateTokens(
      { id: findUser._id, email: findUser.email },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
    );

    if (!accessToken || !refreshToken) {
      return res.status(400).json({ message: "Something went wrong" });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
    });

    findUser.refreshToken = refreshToken;
    await findUser.save();

    let updatedUser = await User.findById(findUser._id);

   

    return res.status(200).json({
      message: "Login successfully",
      accessToken,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const logOutUser = async (req, res) => {
  console.log("Logout function called");

  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found" });
  }

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const generateAccessToken = async (req, res) => {
  console.log("Call generateAccesstoken");
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found" });
  }
  const findUser = await User.findOne({ refreshToken });
  if (!findUser) {
    return res.status(400).json({ message: "User not found" });
  }
  const accessToken = await generateTokens(
    { id: findUser._id, email: findUser.email },
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
  });

  return res.status(200).json({
    message: "Access token generated successfully",
    accessToken,
  });
};

const updateProfile = async (req, res) => {
  const { name, college, bio, skills } = req.body;

  let id = req.user.id;

  if (!name && !college && !bio && !skills) {
    return res.status(400).json({ message: "Any one field is required" });
  }

  try {
    let findUser = await User.findById(id);
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }

    findUser.name = name ? name : findUser.name;
    findUser.college = college ? college : findUser.college;
    findUser.bio = bio ? bio : findUser.bio;
    findUser.skills = skills ? skills : findUser.skills;
    await findUser.save();
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const changeUserName = async (req, res) => {
  let { username, userId } = req.body;

  userId = req.user.id;

  if (!username || !userId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(400).json({ message: "User does not exists" });
    }

    let findUserName = await User.findOne({ username });
    if (findUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    findUser.username = username;
    await findUser.save();
    return res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const uploadImg = async (req, res) => {
  try {
    let profileImg = req.files?.profileImg[0]?.path;
    const id = req.user.id;
    console.log("come to dubai ")

    if (!profileImg) {
      return res.status(400).json({ message: "Profile image is required" });
    }
    let img = await uploadOnCloudinary(profileImg);
    if (!img) {
      return res.status(400).json({ message: "Something went wrong" });
    }
    let findUser = await User.findById(id);
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }
    findUser.avatar = img.url;
    await findUser.save();
    return res
      .status(200)
      .json({ message: "Profile image updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const id = req.user.id;
    await User.findByIdAndUpdate(id, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return res.status(200).json({ message: "Location saved successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const toggleFollowandUnFollow = async (req, res) => {
  const { userId } = req.params;
  const id = req.user.id;

  if (!userId || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (id === userId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const currentUser = await User.findById(id);
    const userToFollow = await User.findById(userId);

    if (!currentUser || !userToFollow) {
      return res.status(400).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userId)) {
      currentUser.following.pull(userId);
      userToFollow.followers.pull(id);
      await currentUser.save();
      await userToFollow.save();
      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      currentUser.following.push(userId);
      userToFollow.followers.push(id);
      await currentUser.save();
      await userToFollow.save();
      return res.status(200).json({ message: "Follow successfully" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "name username avatar _id",
        options: {
          limit: limit,
          skip: skip,
        },
      })
      .select("followers");

    return res.status(200).json({
      followers: user.followers,
      page,
      limit,
      hasMore: user.followers.length === limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "name username avatar _id",
        options: {
          limit: limit,
          skip: skip,
        },
      })
      .select("following");

    return res.status(200).json({
      following: user.following,
      page,
      limit,
      hasMore: user.following.length === limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getMyProfile = async(req,res)=>{
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    return res.status(200).json({user});
  } catch (error) {
    return res.status(400).json({message:"Something went wrong"});
  }
}




module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  generateAccessToken,
  updateProfile,
  changeUserName,
  uploadImg,
  toggleFollowandUnFollow,
  getFollowers,
  getFollowing,
  saveLocation,
  getMyProfile,
};

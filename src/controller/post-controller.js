const Post = require("../modals/post-model");
const uploadOnCloudinary = require("../utils/cloudinary");

const createPost = async (req, res) => {
  let { caption, tags, location } = req.body; // location = { latitude, longitude }
  const id = req.user.id;
  location = JSON.parse(location);

  try {
    const postImg = req.files?.postImg?.[0]?.path;

    if (!caption || !postImg) {
      return res.status(400).json({
        success: false,
        message: "Caption and post image are required",
      });
    }

    // Upload image
    let img = null;
    if (postImg) {
      img = await uploadOnCloudinary(postImg);
    }

    // Build post data
    const postData = {
      caption: caption || "",
      tags: tags || [],
      image: img?.url || "",
      userId: id,
    };

    // If location is provided, add GeoJSON formatted location
    if (
      location &&
      location.latitude &&
      location.longitude &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude)
    ) {
      postData.location = {
        type: "Point",
        coordinates: [
          parseFloat(location.longitude),
          parseFloat(location.latitude),
        ],
      };
    }

    console.log(postData);

    const post = await Post.create(postData);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await Post.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, tags } = req.body;
    console.log(caption, tags);
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (caption) {
      post.caption = caption;
    }
    if (tags) {
      post.tags = tags;
    }
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const user = req.user.id;
    if (post.likes.includes(user)) {
      post.likes.pull(user);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        post,
      });
    } else {
      post.likes.push(user);
      await post.save();
    }
    return res.status(200).json({
      success: true,
      message: "Post liked successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPost = async (req, res) => {
  try {
    let userId = req.user.id;
    let limit = req.query.limit || 10;
    let page = req.query.page || 1;
    let skip = (page - 1) * limit;
    let posts = await Post.find({ userId })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar");
    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSmartFeed = async (req, res) => {
  const { lat, lng, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;



  try {
    let posts = [];

    if (lat && lng) {
      posts = await Post.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: "distance",
            spherical: true,
            // maxDistance: 50000,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: Number(skip) },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "users", // match with your users collection name
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            caption: 1,
            image: 1,
            createdAt: 1,
            distance: 1,
            "user.name": 1,
            "user.avatar": 1,
            "user._id" : 1,
            tags:1,
            likes:1,
          },
        },
      ]);
    } else {
      posts = await Post.find()
        .sort({ likes: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "name avatar");
    }

    console.log(posts);

    return res.status(200).json({
      posts,
      message: "Posts fetched successfully",
      hasMore: posts.length === Number(limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


module.exports = {
  createPost,
  deletePost,
  editPost,
  likePost,
  getAllPost,
  getSmartFeed,
};

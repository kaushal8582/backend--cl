const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

app.use(cors({
  origin: "https://clinkv1.netlify.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const connectDb = require("./src/utils/connectDb");


const userRoute = require("./src/router/user-route")
const postRoute = require("./src/router/post-route")
const commentRoute = require("./src/router/comment-route")

dotenv.config();

const port = 3000;

const Post = require("./src/modals/post-model");

// Post.collection.createIndex({ location: "2dsphere" }, { sparse: true })
//   .then(() => console.log("✅ 2dsphere index created"))
//   .catch((err) => console.error("❌ Error creating 2dsphere index:", err));





app.use("/api/v1/user",userRoute)
app.use("/api/v1/post",postRoute)
app.use("/api/v1/comment",commentRoute)

app.get("/infinite",(req,res)=>{
  res.send("success");
})

try {
  setInterval(() => {
    let response = fetch('http://localhost:3000/infinite').then((res)=>{
      console.log("success");
    }).catch((err)=>{
      console.log(err);
    })
  }, 1000 * 10);
} catch (error) {
  console.log(error);
}




connectDb()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

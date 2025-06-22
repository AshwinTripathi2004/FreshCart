import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebHooks } from "./controllers/orderController.js";
import 'dotenv/config';
const app = express();
const port = process.env.PORT || 4000;

// Connect to DB
await connectDB();

// Connect Cloudinary
await connectCloudinary();

//Allow mutiple origin
const allowedOrigins = ['http://localhost:5173','https://freshcart-frontend.vercel.app'];

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebHooks);

app.set("trust proxy", 1);

//Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Api is working!!");
});

//user routes setup
app.use("/api/user", userRouter);

//seller routes setup
app.use("/api/seller", sellerRouter);

//product routes setup
app.use("/api/product", productRouter);

//cart route setup
app.use("/api/cart", cartRouter);

//address route setup
app.use("/api/address", addressRouter);

//order route setup
app.use("/api/order", orderRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
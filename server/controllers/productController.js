import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

//Add Product: /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (img) => {
        let result = await cloudinary.uploader.upload(img.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    res.json({
      success: true,
      message: "Product Added Successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get Product List: /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get single Product: /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ${id}`,
      });
    } else {
      res.json({
        success: true,
        product,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Change Product inStock: /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    // 1. Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ${id}`,
      });
    }

    // 2. Update stock
    product.inStock = inStock;
    await product.save();

    return res.json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//delete product: api/product/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
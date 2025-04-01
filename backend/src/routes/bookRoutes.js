import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

router.post("/add", protectRoute, async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;

    if (!title || !caption) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    if (!uploadResponse) {
      return res.status(400).json({ message: "Image upload failed" });
    }
    const existingTitle = await Book.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const imageUrl = uploadResponse.secure_url;
    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json({
      message: "Book added successfully",
      book: {
        id: newBook._id,
        title: newBook.title,
        caption: newBook.caption,
        image: newBook.image,
        rating: newBook.rating,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

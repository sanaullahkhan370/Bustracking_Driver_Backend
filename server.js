import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ======================
// Load .env file
// ======================
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ======================
// User Schema
// ======================
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  phone: String,
  password: String,
  role: String,
  busId: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
});

const User = mongoose.model("users", userSchema);

// ======================
// LOGIN Route
// ======================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Username not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Login Successful",
      busId: user.busId,
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ======================
// LOCATION UPDATE (Mobile App)
// ======================
app.post("/api/location/update", async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing Data" });
    }

    const result = await User.updateOne(
      { busId },
      {
        $set: {
          latitude,
          longitude,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      message: "Location Updated",
      matched: result.matchedCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ======================
// GF-07 GPS Tracker Route
// ======================
app.get("/api/gps", async (req, res) => {
  try {
    const { busId, lat, lng } = req.query;

    console.log("📡 GPS:", busId, lat, lng);

    if (!busId || !lat || !lng) {
      return res.status(400).send("Invalid GPS Data");
    }

    await User.updateOne(
      { busId },
      {
        $set: {
          latitude: Number(lat),
          longitude: Number(lng),
          updatedAt: new Date(),
        },
      }
    );

    res.send("OK");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ======================
// Root Test Route
// ======================
app.get("/", (req, res) => {
  res.send("🚍 Bus Tracking Server Running");
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});

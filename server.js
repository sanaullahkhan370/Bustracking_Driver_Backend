import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// MongoDB Connect
// ----------------------
mongoose.connect(
  "mongodb+srv://khansanaullah370:sana195@cluster0.ye79ran.mongodb.net/school-bus-tracking"
).then(() => console.log("MongoDB Connected"))
 .catch(err => console.log("MongoDB Error:", err));


// ----------------------
// User Schema
// ----------------------
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


// ----------------------
// LOGIN Route
// ----------------------
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: "Username not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  return res.json({
    message: "Login Successful",
    busId: user.busId,
  });
});


// ----------------------
// LOCATION UPDATE Route
// ----------------------
app.post("/api/location/update", async (req, res) => {
  const { busId, latitude, longitude } = req.body;

  console.log("Incoming:", busId, latitude, longitude);

  const result = await User.updateOne(
    { busId: busId },
    {
      $set: {
        latitude,
        longitude,
        updatedAt: new Date(),
      }
    }
  );

  console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);

  res.json({ message: "Location Updated" });
});


// ----------------------
// Start Server
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));

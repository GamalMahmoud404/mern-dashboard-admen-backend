const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
const { verifyAdmin } = require("./middleware/auth");
require("dotenv").config();

const app = express()
app.use(cors());
app.use(express.json())

const _PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI;
const UserModel = require("./models/Users")

// connect to DB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// routes
app.get("/users", async (req,res) => {
  const users = await UserModel.find();
  res.json(users)
})

app.post("/createUser", verifyAdmin, async (req, res) => {
  const user = req.body;
  const newUser = new UserModel(user);
  await newUser.save();
  res.json(user)
})

app.delete("/deleteUser/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await UserModel.findByIdAndDelete(id);
    res.json({ message: `User ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

app.put("/updateUser/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Error updating user" });
  }
});

app.use("/admin", require("./routes/admin.js"));

app.listen(_PORT, () => {
  console.log("🚀 Server is running on port", _PORT);
});

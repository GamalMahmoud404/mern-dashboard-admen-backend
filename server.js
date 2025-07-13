
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
const { verifyAdmin } = require("./middleware/auth");

const app = express()
app.use(cors());
app.use(express.json())
require("dotenv").config();
const _PORT = process.env.PORT

const UserModel = require("./models/Users")


// connect to DB

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(`MONGO_URI`)


// import user model

app.get("/users", async (req,res) => {
    const users = await UserModel.find();
    res.json(users)
})

// create user

app.post("/createUser", verifyAdmin, async (req, res) => {
    const user = req.body ;
    const newUser = new UserModel(user);
    await newUser.save();
    res.json(user)
})

// ✅ Delete user by ID

app.delete("/deleteUser/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await UserModel.findByIdAndDelete(id);
    res.json({ message: `User ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// ✅ update user by ID

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

app.listen(_PORT,()=>{
    console.log("Server is runing !!!!!!!")
})



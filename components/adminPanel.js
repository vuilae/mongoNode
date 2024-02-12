const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users
router.get("/", async (req, res) => {
  const adminId = req.userId;
  try {
    // Fetch admin user
    const adminUser = await User.findById(adminId);

    // Fetch all users except the admin
    const users = await User.find({ _id: { $ne: adminId } });

    res.render("admin", {
      users: users,
      adminUsername: adminUser.username,
      adminId: adminId,
    });
  } catch (error) {
    res.render("admin", { error: error.message });
  }
});

router.post("/create/:id", async (req, res) => {
  try {
    console.log("createing");
    const adminId = req.userId;
    const { username, password } = req.body;

    // Create a new user instance
    const newUser = new User({
      username,
      password,
      createdAt: new Date(), // Set createdAt field
      updatedAt: new Date(), // Set updatedAt field
    });

    // Save the new user to the database
    await newUser.save();

    console.log("User created successfully");

    res.redirect(`/admin/${adminId}`);
  } catch (error) {
    res.render("admin", { error: error.message });
  }
});

// Update user by ID
router.post("/edit/:id", async (req, res) => {
  try {
    const adminId = req.userId;
    console.log("editing");
    const { id } = req.params;
    const { username, password } = req.body;

    // Update the fields if provided
    const updateFields = {};
    if (username !== undefined && username !== "") {
      updateFields.username = username;
    }
    if (password !== undefined && password !== "") {
      updateFields.password = password;
    }

    // Add updatedAt field
    updateFields.updatedAt = new Date();

    // Update the user using findByIdAndUpdate
    await User.findByIdAndUpdate(id, updateFields);

    console.log("User updated successfully");
    res.redirect(`/admin/${adminId}`); // Redirect to admin page after successful update
  } catch (error) {
    res.render("admin", { error: error.message });
  }
});

// Delete user by ID
router.post("/delete/:deleteId", async (req, res) => {
  try {
    const deleteId = req.params.deleteId;
    const adminId = req.userId;
    await User.findByIdAndDelete(deleteId);
    res.redirect(`/admin/${adminId}`);
  } catch (error) {
    res.render("admin", { error: error.message });
  }
});

// Middleware function to get user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.render("admin", { error: "User not found" });
    }
  } catch (error) {
    return res.render("admin", { error: error.message });
  }

  res.user = user;
  next();
}

module.exports = router;

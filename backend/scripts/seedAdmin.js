require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");

const seedAdmin = async () => {
  await connectDB();

  const email = "admin@worktrack.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    await mongoose.connection.close();
    return;
  }

  await User.create({
    name: "Admin User",
    email,
    password: "admin123",
    role: "admin",
    isActive: true,
  });

  console.log("Admin created: admin@worktrack.com / admin123");
  await mongoose.connection.close();
};

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin", error);
  await mongoose.connection.close();
  process.exit(1);
});

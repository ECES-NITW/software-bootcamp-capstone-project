const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected Successfully ✅");
  } catch (error) {
    console.log("MongoDB connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;

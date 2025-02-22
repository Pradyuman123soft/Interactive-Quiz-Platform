require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Question = require("./models/Question");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected!");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Read questions from `questions.json`
const questionsPath = path.resolve(__dirname, "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

// Insert Questions into Database
const seedDB = async () => {
  try {
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log("✅ Questions seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding questions:", err);
    process.exit(1);
  }
};

// Run the functions
(async () => {
  await connectDB();
  await seedDB();
})();

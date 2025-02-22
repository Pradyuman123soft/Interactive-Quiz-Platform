const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: function () { return this.type === "mcq"; } }, // Only required for MCQs
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can store String (MCQ) or Number (Integer)
  type: { type: String, enum: ["mcq", "integer"], required: true } // Determines question type
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]); //stores all the question
  const [currentQuestion, setCurrentQuestion] = useState(0); //stores the index number of current question
  const [selectedAnswer, setSelectedAnswer] = useState(null); //store the selected answer by users
  const [typedAnswer, setTypedAnswer] = useState(""); //stores the typed answer
  const [score, setScore] = useState(0); //store the correct answer score +1
  const [showScore, setShowScore] = useState(false); // help to hanlde the result score
  const [timeLeft, setTimeLeft] = useState(30); //handle timer
  const [feedback, setFeedback] = useState(null); // stores the feedback of every answer whether it is right or wrong
  const [attemptedAnswer, setAttemptedAnswer] = useState([])

  useEffect(() => {
    // fetched all the questions stored in database
    async function fetchQuestions() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/quizzes`);
      const data = await res.json();
      setQuestions(data);
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Handle the timing of every quizz
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNextQuestion();
    }
  }, [timeLeft]);

  // Hanlde the Selected Answers by users
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setAttemptedAnswer((prev) => {
      const updatedAnswers = [...prev];
      updatedAnswers[currentQuestion] = answer; // Store answer by question index
      return updatedAnswers;
    });
    checkAnswer(answer);
  };

  // Handle the typed answer by user like integer based question
  const handleTypedAnswerSubmit = () => {
    if (typedAnswer.trim() !== "") {
      checkAnswer(parseInt(typedAnswer)); // Convert user input to number
      setAttemptedAnswer((prev) => {
        const updatedAnswers = [...prev];
        updatedAnswers[currentQuestion] = typedAnswer; // Store answer by question index
        return updatedAnswers;
      });
      setTypedAnswer(""); // Clear input after submission
    }
  };

  // Check the Answer whether it is Right OR Wrong
  const checkAnswer = (userAnswer) => {
    const correctAnswer = String(
      questions[currentQuestion].correctAnswer
    ).trim();
    const userInput = String(userAnswer).trim();

    if (userInput === correctAnswer) {
      setScore((prev) => prev + 1);
      setFeedback("🎉 Correct! Congratulations!");
    } else {
      setFeedback(`❌ Wrong! The correct answer is: ${correctAnswer}`);
    }
    
    setTimeout(() => {
      setFeedback(null);
      handleNextQuestion();
    }, 1000);
  };

  // Handle the Next question if remains otherwise shows the result
  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setShowScore(true);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-4 text-center">
        Interactive Quiz Platform
      </h1>

      {!showScore ? (
        <motion.div
          className="w-full max-w-full sm:max-w-lg md:max-w-xl p-6 bg-gray-800 rounded-lg shadow-lg text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold">
            {questions[currentQuestion]?.question}
          </h2>

          <div className="mt-4 space-y-2">
            {questions[currentQuestion]?.type === "mcq" ? (
              questions[currentQuestion]?.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full sm:w-3/4 p-2 rounded-lg text-lg font-semibold transition duration-300 mx-auto block ${
                    selectedAnswer === option
                      ? option === questions[currentQuestion].correctAnswer
                        ? "bg-green-500"
                        : "bg-red-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {option}
                </motion.button>
              ))
            ) : (
              <div className="w-full sm:w-3/4 mx-auto">
                <input
                  type="number"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="w-full p-2 text-black rounded-lg text-lg"
                  placeholder="Enter your answer..."
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTypedAnswerSubmit}
                  className="w-full mt-3 p-2 bg-blue-500 rounded-lg text-lg font-semibold"
                >
                  Submit
                </motion.button>
              </div>
            )}
          </div>

          {feedback && <p className="mt-4 text-lg font-semibold">{feedback}</p>}
          <p className="mt-4 text-sm text-red-400">Time Left: {timeLeft}s</p>
        </motion.div>
      ) : (
        <motion.div
          className="w-full max-w-full sm:max-w-lg md:max-w-xl p-6 bg-green-600 rounded-lg shadow-lg text-center"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Quiz Completed!</h2>
          <p className="mt-2 text-lg">Your Score: {score} / {questions.length}</p>
        </motion.div>
      )}

      {showScore && (
        <div className="w-full max-w-full sm:max-w-lg md:max-w-xl p-6 bg-gray-800 rounded-lg shadow-lg text-center mt-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-4">Quiz Summary</h2>
          {questions.map((q, index) => {
            const userAnswer = attemptedAnswer[index];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold">{q.question}</h3>
                {q.type === "mcq" ? (
                  <ul className="mt-2">
                    {q.options.map((op, opIndex) => (
                      <li
                        key={opIndex}
                        className={`w-full p-2 rounded-lg text-lg font-semibold transition duration-300 ${
                          userAnswer === op
                            ? isCorrect
                              ? "bg-green-500"
                              : "bg-red-500"
                            : "bg-gray-700"
                        }`}
                      >
                        {op}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-lg mt-2">
                    Your Answer: <span className={`${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {userAnswer ? userAnswer : "Not Attempted"}
                    </span>
                  </p>
                )}
                {!isCorrect && (
                  <p className="text-sm text-gray-300 mt-2">
                    Correct Answer: <span className="text-green-400">{q.correctAnswer}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

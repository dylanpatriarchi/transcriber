"use client";

import { useState } from "react";
import { QuizQuestion } from "@/types";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

export default function QuizModule({ questions }: { questions: QuizQuestion[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    if (!questions || questions.length === 0) return null;

    const currentQ = questions[currentIndex];

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        if (option === currentQ.correctAnswer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        return (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm space-y-6">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-black" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                    <p className="text-gray-500 mt-2">You scored <span className="text-black font-black">{score}</span> out of {questions.length}</p>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full transition-all duration-500" style={{ width: `${(score / questions.length) * 100}%` }} />
                </div>
                <button
                    onClick={restart}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    Knowledge Quiz
                </h3>
                <span className="text-xs font-bold text-gray-400">
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h4 className="text-xl font-bold leading-tight mb-8">
                    {currentQ.question}
                </h4>

                <div className="space-y-3">
                    {currentQ.options.map((option) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === currentQ.correctAnswer;

                        let btnClass = "w-full text-left p-4 rounded-2xl text-sm font-medium transition-all flex items-center justify-between border ";

                        if (!isAnswered) {
                            btnClass += "bg-white border-gray-100 hover:border-black hover:bg-gray-50";
                        } else if (isCorrect) {
                            btnClass += "bg-green-50 border-green-200 text-green-700 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]";
                        } else if (isSelected && !isCorrect) {
                            btnClass += "bg-red-50 border-red-200 text-red-700";
                        } else {
                            btnClass += "bg-white border-gray-50 text-gray-300 opacity-60";
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionClick(option)}
                                disabled={isAnswered}
                                className={btnClass}
                            >
                                {option}
                                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Explanation</h5>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">{currentQ.explanation}</p>
                        <button
                            onClick={nextQuestion}
                            className="mt-6 w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            Next Question
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { ChevronLeft, ChevronRight, RotateCw, HelpCircle } from "lucide-react";

export default function FlashcardModule({ cards }: { cards: Flashcard[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return null;

    const currentCard = cards[currentIndex];

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    return (
        <div className="space-y-8 py-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" />
                    Study Flashcards
                </h3>
                <span className="text-xs font-bold text-gray-400">
                    {currentIndex + 1} / {cards.length}
                </span>
            </div>

            <div className="relative h-[300px] w-full perspective-1000">
                <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center p-10 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 px-2 py-0.5 bg-indigo-50 rounded">Question</span>
                        <p className="text-xl font-bold leading-snug text-gray-900">{currentCard.question}</p>
                        <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            <RotateCw className="w-3 h-3" />
                            Click to reveal answer
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black border border-black rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-10 text-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Answer</span>
                        <p className="text-lg font-medium leading-relaxed">{currentCard.answer}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={prevCard}
                    className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextCard}
                    className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-md flex items-center gap-2 font-bold px-8"
                >
                    Next Card
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </div>
    );
}

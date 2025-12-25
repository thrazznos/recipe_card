"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RecipeData {
    title: string;
    image?: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    yield?: string;
    url?: string;
}

interface RecipeCardProps {
    data: RecipeData;
}

const AutoFitInstructionList = ({ instructions }: { instructions: string[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(10); // Start at 10px

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeText = () => {
            // Reset to max size to check if it fits now
            // But for simplicity in this "shrink to fit" logic, we just check overflow
            // If we want to support resizing window, we might need more complex logic.
            // For now, let's just shrink.

            let currentSize = 10;
            container.style.fontSize = `${currentSize}px`;

            // Loop down until it fits or hits min size
            while (container.scrollHeight > container.clientHeight && currentSize > 6) {
                currentSize -= 0.5;
                container.style.fontSize = `${currentSize}px`;
            }
            setFontSize(currentSize);
        };

        resizeText();

        // Optional: Re-run on window resize if the card size was fluid, 
        // but here it is fixed 4in height, so maybe not strictly needed unless print mode changes things.
    }, [instructions]);

    return (
        <div ref={containerRef} className="h-full overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
            <ol className="list-decimal pl-4 text-gray-900 leading-tight columns-2 gap-4" style={{ fontSize: 'em' }}>
                {instructions.map((inst, idx) => (
                    <li key={idx} className="mb-1 break-inside-avoid">{inst}</li>
                ))}
            </ol>
        </div>
    );
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ data }) => {
    return (
        <div className="flex flex-col gap-8 items-center print:block print:gap-0">
            {/* Front Card */}
            <div
                className="
          flex flex-row bg-white text-black shadow-2xl overflow-hidden
          w-[6in] h-[4in] min-w-[6in] min-h-[4in]
          print:shadow-none print:break-after-page print:border-none border border-zinc-200
        "
            >
                {/* Left Half: Image */}
                <div className="w-1/2 h-full relative bg-gray-100 flex items-center justify-center overflow-hidden">
                    {data.image ? (
                        <img
                            src={data.image}
                            alt={data.title}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 text-center p-4">
                            <span className="block text-4xl mb-2">📷</span>
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Right Half: Ingredients & Meta */}
                <div className="w-1/2 h-full p-4 flex flex-col relative">
                    <h2 className="text-lg font-bold leading-tight mb-2 uppercase tracking-wide line-clamp-2">
                        {data.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-gray-600 mb-3 border-b border-gray-200 pb-2">
                        {data.prepTime && <span>Prep: {data.prepTime.replace('PT', '').toLowerCase()}</span>}
                        {data.cookTime && <span>Cook: {data.cookTime.replace('PT', '').toLowerCase()}</span>}
                        {data.yield && <span className="ml-auto">Yields: {data.yield}</span>}
                    </div>

                    <div className="flex-grow overflow-hidden relative">
                        <h3 className="font-bold text-xs uppercase mb-1 text-gray-800">Ingredients</h3>
                        <ul className="text-[10px] space-y-1 list-disc pl-3 text-gray-900 leading-snug">
                            {data.ingredients.slice(0, 15).map((ing, idx) => (
                                <li key={idx} className="line-clamp-2">{ing}</li>
                            ))}
                            {data.ingredients.length > 15 && (
                                <li className="italic text-gray-500">...and {data.ingredients.length - 15} more</li>
                            )}
                        </ul>
                        {/* Fade out at bottom if too long */}
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>

                    <div className="mt-2 text-[8px] text-gray-400 text-right">
                        Card 1/2 • Front
                    </div>
                </div>
            </div>

            {/* Back Card */}
            <div
                className="
          flex flex-col bg-white text-black shadow-2xl overflow-hidden
          w-[6in] h-[4in] min-w-[6in] min-h-[4in]
          print:shadow-none print:break-after-page print:border-none border border-zinc-200 p-5
        "
            >
                <div className="h-full flex flex-col">
                    <h3 className="font-bold text-sm uppercase border-b-2 border-black pb-1 mb-2">Preparation</h3>

                    {/* Auto-scaling Instructions Container */}
                    <div className="flex-grow overflow-hidden relative">
                        <AutoFitInstructionList instructions={data.instructions} />
                    </div>

                    <div className="mt-1 text-[7px] text-gray-400 flex justify-between">
                        <span>{new URL(data.url || "").hostname}</span>
                        <span>Card 2/2 • Back</span>
                    </div>
                </div>
            </div>

            {/* Print Instructions helper */}
            <div className="fixed bottom-4 right-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 transition font-bold"
                >
                    🖨️ Print Cards
                </button>
            </div>
        </div>
    );
};

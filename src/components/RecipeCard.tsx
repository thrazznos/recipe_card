"use client";

import React from "react";

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

export const RecipeCard: React.FC<RecipeCardProps> = ({ data }) => {
    return (
        <div className="flex justify-center">
            {/* 
        Container for the card. 
        On screen: shadow, centering, fixed 4x6 aspect ratio roughly (scaled up for visibility).
        On print: NO shadow, exact dimensions, no external margins.
      */}
            <div
                className="
          bg-white text-black p-8 shadow-2xl rounded-sm 
          w-[600px] min-h-[400px] h-auto
          print:shadow-none print:w-full print:max-w-[4in] print:h-auto print:p-4 print:mx-auto
          relative overflow-hidden font-serif border border-zinc-200 print:border-none
        "
                style={{
                    // Attempt to simulate 4x6 ratio or just fluid height
                }}
            >
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wider">{data.title}</h2>
                    {data.yield && (
                        <p className="text-sm italic mt-1 text-gray-600 print:text-black">
                            Yields: {data.yield}
                        </p>
                    )}
                    <div className="flex gap-4 text-xs font-bold mt-2 uppercase">
                        {data.prepTime && <span>Prep: {data.prepTime.replace('PT', '').toLowerCase()}</span>}
                        {data.cookTime && <span>Cook: {data.cookTime.replace('PT', '').toLowerCase()}</span>}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                    {/* Ingredients */}
                    <div>
                        <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Ingredients</h3>
                        <ul className="text-sm space-y-1 list-disc pl-4 text-gray-800 print:text-black">
                            {data.ingredients.map((ing, idx) => (
                                <li key={idx} className="leading-snug">{ing}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Instructions</h3>
                        <ol className="text-sm space-y-2 list-decimal pl-4 text-gray-800 print:text-black">
                            {data.instructions.map((inst, idx) => (
                                <li key={idx} className="leading-snug">{inst}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Footer / Source */}
                {data.url && (
                    <div className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center print:text-gray-600">
                        Source: {new URL(data.url).hostname}
                    </div>
                )}
            </div>

            {/* Print Instructions helper, visible only on screen */}
            <div className="fixed bottom-4 right-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 transition"
                >
                    🖨️ Print Card
                </button>
            </div>
        </div>
    );
};

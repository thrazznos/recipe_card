"use client";

import { useState } from "react";
import { RecipeCard, RecipeData } from "@/components/RecipeCard";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setRecipeData(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to scrape recipe");
      }

      setRecipeData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Make sure the URL is a valid recipe page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center print:hidden">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Recipe Card Maker
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Turn any web recipe into a printable card instantly.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-700 print:hidden">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Recipe URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  name="url"
                  id="url"
                  required
                  className="flex-1 block w-full rounded-md border-slate-300 dark:border-slate-600 py-3 px-4 focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white dark:bg-slate-700 sm:text-sm"
                  placeholder="https://www.allrecipes.com/recipe/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Processing..." : "Create Recipe Card"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Result Area */}
        <div className="mt-8 flex justify-center">
          {recipeData && <RecipeCard data={recipeData} />}
        </div>
      </div>
    </div>
  );
}

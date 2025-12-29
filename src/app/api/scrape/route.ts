import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // 1. Fetch the HTML
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();

        // 2. Parse HTML with Cheerio
        const $ = cheerio.load(html);

        // 3. Find LD+JSON data
        let recipeData: any = null;

        $('script[type="application/ld+json"]').each((_, element) => {
            try {
                const data = JSON.parse($(element).html() || "{}");

                // Helper to find Recipe entity in graph or array
                const findRecipe = (obj: any): any => {
                    if (Array.isArray(obj)) {
                        return obj.find(item => findRecipe(item));
                    }
                    if (obj["@graph"] && Array.isArray(obj["@graph"])) {
                        return obj["@graph"].find((item: any) => item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe")));
                    }
                    if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) {
                        return obj;
                    }
                    return null;
                };

                const found = findRecipe(data);
                if (found) {
                    recipeData = found;
                    return false; // break loop
                }
            } catch (e) {
                console.error("Error parsing JSON-LD", e);
            }
        });

        if (!recipeData) {
            return NextResponse.json({ error: "No recipe data found on this page (looking for ld+json Recipe)" }, { status: 404 });
        }

        // 4. Normalize Data
        // Clean up ingredients (sometimes they are just strings, sometimes objects)
        const ingredients = Array.isArray(recipeData.recipeIngredient)
            ? recipeData.recipeIngredient
            : [];

        // Clean up instructions
        let instructions: string[] = [];
        if (Array.isArray(recipeData.recipeInstructions)) {
            recipeData.recipeInstructions.forEach((inst: any) => {
                if (typeof inst === 'string') {
                    instructions.push(inst);
                } else if (inst.text) {
                    instructions.push(inst.text);
                } else if (inst.itemListElement) {
                    // Handling HowToStep wrapped in HowToSection possibly
                    inst.itemListElement.forEach((step: any) => {
                        if (step.text) instructions.push(step.text);
                    });
                }
            });
        } else if (typeof recipeData.recipeInstructions === 'string') {
            instructions = [recipeData.recipeInstructions];
        }

        // Helper to extract image URL
        const getImageUrl = (image: any): string | undefined => {
            if (!image) return undefined;
            if (typeof image === 'string') return image;
            if (Array.isArray(image)) {
                return getImageUrl(image[0]);
            }
            if (typeof image === 'object') {
                return image.url || image.contentUrl || undefined;
            }
            return undefined;
        };

        const cleanedData = {
            title: recipeData.name,
            image: getImageUrl(recipeData.image),
            description: recipeData.description,
            ingredients: ingredients,
            instructions: instructions,
            prepTime: recipeData.prepTime,
            cookTime: recipeData.cookTime,
            totalTime: recipeData.totalTime,
            yield: recipeData.recipeYield ? (Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield) : null,
            url: url
        };

        return NextResponse.json(cleanedData);

    } catch (error: any) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

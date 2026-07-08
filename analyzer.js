const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Retry khi Gemini bận
async function generateWithRetry(prompt, maxRetry = 5) {

    for (let i = 1; i <= maxRetry; i++) {

        try {

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            return result.text;

        } catch (err) {

            if (err.status === 429 || err.status === 503) {

                console.log(
                    `Gemini busy (${err.status}) Retry ${i}/${maxRetry}`
                );

                await new Promise(r => setTimeout(r, 10000));

            } else {

                throw err;

            }

        }

    }

    throw new Error("Gemini unavailable.");

}

async function analyzeReview(reviews, app) {

    console.log("--------------------------------");
    console.log("Preparing reviews...");
    console.log("Total reviews:", reviews.length);

    // Không gửi quá nhiều review
    const selectedReviews = reviews.slice(0, 300);

    let reviewText = "";

    selectedReviews.forEach(r => {

        reviewText += `
Reviewer: ${r.userName || ""}

Rating: ${r.score || ""}

Helpful Votes: ${r.thumbsUp || 0}

Review Date: ${r.date || ""}

Review:
${r.text || ""}

--------------------------------------------------

`;

    });

    console.log("Review characters:", reviewText.length);

    const prompt = fs.readFileSync(
        "prompt.txt",
        "utf8"
    );

    const finalPrompt = prompt
        .replace(
            "[TÊN APP, mô tả ngắn 1-2 câu về app này làm gì]",
            `${app.title}

${app.summary}`
        )
        .replace(
            "[DÁN DỮ LIỆU REVIEW VÀO ĐÂY]",
            reviewText
        );

    console.log("Prompt size:", finalPrompt.length);

    // Lưu prompt để debug
    fs.writeFileSync(
        "debug_prompt.txt",
        finalPrompt,
        "utf8"
    );

    console.log("Sending to Gemini...");

    const report = await generateWithRetry(finalPrompt);

    // Lưu raw response để debug
    fs.writeFileSync(
        "gemini_response.txt",
        report,
        "utf8"
    );

    return report;

}

module.exports = {
    analyzeReview
};
const XLSX = require("xlsx");
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

            if (err.status === 503 || err.status === 429) {

                console.log(
                    `Gemini busy (${err.status}). Retry ${i}/${maxRetry}...`
                );

                await new Promise(resolve => setTimeout(resolve, 10000));

            } else {

                throw err;

            }

        }

    }

    throw new Error("Gemini unavailable after multiple retries.");
}

async function analyzeReview(excelFile, app) {

    const workbook = XLSX.readFile(excelFile);

    const sheet = workbook.Sheets["Reviews"];

    const rows = XLSX.utils.sheet_to_json(sheet);

    let reviewText = "";

    rows.forEach(r => {

        reviewText += `
User: ${r.userName}

Rating: ${r.score}

Helpful: ${r.thumbsUp || 0}

Date: ${r.date}

Review:
${r.text || ""}

-----------------------------------
`;

    });

    const prompt = fs.readFileSync(
        "prompt.txt",
        "utf8"
    );

    const finalPrompt = prompt
        .replace(
            "[TÊN APP, mô tả ngắn 1-2 câu về app này làm gì]",
            `${app.title}\n\n${app.summary}`
        )
        .replace(
            "[DÁN DỮ LIỆU REVIEW VÀO ĐÂY]",
            reviewText
        );

    console.log("Sending to Gemini...");

    const report = await generateWithRetry(finalPrompt);

    return report;
}

module.exports = {
    analyzeReview
};
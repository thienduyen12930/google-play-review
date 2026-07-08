const gplay = require("google-play-scraper").default;
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const { analyzeReview } = require("./analyzer");
const { saveWord } = require("./word");

async function downloadReviews(appId) {

    let reviews = [];
    let token = null;

    do {

        const result = await gplay.reviews({

            appId,

            lang: "en",

            country: "us",

            sort: gplay.sort.NEWEST,

            paginate: true,

            nextPaginationToken: token,

            num: 200

        });

        reviews.push(...result.data);

        token = result.nextPaginationToken;

        console.log(`Downloaded ${reviews.length} reviews`);

    } while (token);

    const app = await gplay.app({ appId });

    const appName = app.title
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_");

    const developer = app.developer
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_");

 const folderName = `${appName}_${developer}`;

const outputFolder = path.join(
    "output",
    "reviews",
    folderName
);

fs.mkdirSync(outputFolder, {
    recursive: true
});



    const worksheet =
        XLSX.utils.json_to_sheet(reviews);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Reviews"
    );

    const excelPath =
        path.join(
            outputFolder,
            "reviews.xlsx"
        );

    XLSX.writeFile(
        workbook,
        excelPath
    );

    console.log("Excel saved");

    console.log("Gemini analyzing...");

    const report =
        await analyzeReview(
            excelPath,
            app
        );



    await saveWord(

        report,

        path.join(
            outputFolder,
            "analysis.docx"
        )

    );

    console.log("");

    console.log("Finished");

    console.log(outputFolder);

}

module.exports = {

    downloadReviews

};
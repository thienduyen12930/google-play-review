const { downloadReviews } = require("./crawler");

async function main() {

    const url = process.argv[2];

    if (!url) {
        console.log('Usage: node index.js "Google Play URL"');
        return;
    }

    const appId = new URL(url).searchParams.get("id");

    if (!appId) {
        console.log("Invalid Google Play URL");
        return;
    }

    await downloadReviews(appId);

}

main();
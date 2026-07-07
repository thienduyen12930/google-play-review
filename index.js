const gplay = require("google-play-scraper").default;
const XLSX = require("xlsx");

async function main() {
    try {
        let reviews = [];
        let token = null;

        do {
            const result = await gplay.reviews({
                appId: "com.edgelighting.lightingcolors.rgb.borderlight.livewallpaper",
                lang: "en",
                country: "us",
                sort: gplay.sort.NEWEST,
                paginate: true,
                nextPaginationToken: token,
                num: 200,
            });

            reviews.push(...result.data);
            token = result.nextPaginationToken;

            console.log(`Downloaded ${reviews.length} reviews`);
        } while (token);

        // Tạo worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(reviews);

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

        // Ghi file Excel
        XLSX.writeFile(workbook, "reviews_Edge_Lighting_Color_wallpapers_DictionaryAndTranslator.xlsx");

        console.log("Done! File saved as reviews.xlsx");
    } catch (err) {
        console.error(err);
    }
}

main();
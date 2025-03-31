import axios from "axios";

interface Website {
    url: string;
    tags?: string;
    script?: string;  // To hold custom script
    type: "scraping" | "custom_script";  // New type to distinguish between the two
}

const SCRAPING_SERVER = "http://localhost:3000/sel";
const CUSTOM_SCRIPT_SERVER = "http://localhost:3000/execute";

export async function scrape(website: Website) {
    // Construct request body properly based on the type
    const requestData = website.type === "scraping" 
        ? { url: website.url, tags: website.tags }
        : { url: website.url, script: website.script };  // Ensure URL is included for custom scripts

    return axios
        .post(website.type === "scraping" ? SCRAPING_SERVER : CUSTOM_SCRIPT_SERVER, requestData, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

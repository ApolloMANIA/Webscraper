import axios from "axios";

interface Website {
    url: string;
    tags?: string;
    script?: string;
    type: "scraping" | "custom_script";
}

const CUSTOM_SCRIPT_SERVER = "http://localhost:3000/execute";

export async function scrape(website: Website) {
    const requestData = website.type === "scraping" 
        ? { url: website.url, tags: website.tags }
        : { url: website.url, script: website.script }; 

    return axios
        .post(CUSTOM_SCRIPT_SERVER, requestData, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}
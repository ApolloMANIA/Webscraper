import { FormEvent, useRef, useState } from "react";
import { scrape } from "../services/scrape";

function Home() {
    const urlRef = useRef<HTMLInputElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);
    const [scrapedData, setScrapedData] = useState<any>(null);  // Changed to `any` for complex data handling
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!urlRef.current || !urlRef.current.value.trim()) {
            setError("Please enter a valid website URL.");
            return;
        }

        const website = {
            url: urlRef.current.value.trim(),
            tags: tagsRef.current?.value.trim() || "",
            type: "scraping" as "scraping",  // Explicitly typed as "scraping"
        };

        setLoading(true);
        setError(null);

        try {
            const data = await scrape(website);
            console.log("Backend Response:", data); // Debugging

            // Check the type of the received data
            console.log("Type of data:", typeof data);  // Logs the type of the response

            // Check if the response is an object, array, or string
            if (Array.isArray(data)) {
                console.log("data is an array:", data);
                setScrapedData(data); // Directly store the array
            } else if (typeof data === "object") {
                console.log("data is an object:", data);
                setScrapedData(data); // Directly store the object
            } else if (typeof data === "string") {
                console.log("data is a string:", data);
                setScrapedData(data || "No data received");
            } else {
                console.log("data is of unknown type:", data);
                setError("Unexpected response format.");
            }
        } catch (error) {
            setError("Scraping failed.");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="website" className="form-label">Website URL:</label>
                    <input 
                        ref={urlRef} 
                        id="website" 
                        className="form-control" 
                        type="text" 
                        placeholder="https://example.com" 
                    />
                    
                    <label htmlFor="tags" className="form-label">Tags:</label>
                    <input 
                        ref={tagsRef} 
                        id="tags" 
                        className="form-control" 
                        type="text" 
                        placeholder="div;h1;h2" 
                    />
                    
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Scraping..." : "Submit"}
                    </button>
                </div>
            </form>

            {/* Error Handling */}
            {error && <p className="text-danger">{error}</p>}

            {/* Display scraped data */}
            {scrapedData && (
                <div className="overflow-auto mt-3">
                    <h3>Scraped Data:</h3>
                    <pre>{JSON.stringify(scrapedData, null, 2)}</pre> {/* JSON stringified with proper formatting */}
                </div>
            )}
        </>
    );
}

export default Home;

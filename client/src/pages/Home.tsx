import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { scrape } from "../services/scrape";

function Home() {
    const urlRef = useRef<HTMLInputElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!urlRef.current || !urlRef.current.value.trim()) {
            setError("Please enter a valid website URL.");
            return;
        }

        const website = {
            url: urlRef.current.value.trim(),
            tags: tagsRef.current?.value.trim() || "",
            type: "scraping" as "scraping",
        };

        setLoading(true);
        setError(null);

        try {
            const data = await scrape(website);
            console.log("Backend Response:", data);

            // Navigate to the new page with scraped data
            navigate("/scraped-data", { state: { data } });
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

            {error && <p className="text-danger">{error}</p>}
        </>
    );
}

export default Home;

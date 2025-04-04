import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { scrape } from "../services/scrape";

function Script() {
    const urlRef = useRef<HTMLInputElement>(null);
    const scriptRef = useRef<HTMLTextAreaElement>(null);
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
            script: scriptRef.current?.value.trim() || "",
            type: "custom_script" as "custom_script",
        };

        setLoading(true);
        setError(null);

        try {
            const data = await scrape(website);
            console.log("Backend Response:", data);

            // Navigate to the ScrapedData page with the result
            navigate("/scraped-data", { state: { data } });
        } catch (error) {
            setError("Execution failed.");
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
                    
                    <label htmlFor="script" className="form-label">Custom Script:</label>
                    <textarea
                        ref={scriptRef}
                        id="script"
                        className="form-control"
                        placeholder="Enter your Python script here"
                        rows={6}
                    ></textarea>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Executing..." : "Submit"}
                    </button>
                </div>
            </form>

            {error && <p className="text-danger">{error}</p>}
        </>
    );
}

export default Script;

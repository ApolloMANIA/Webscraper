import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrape } from "../services/scrape";
import { BASE_URL } from "../utils/config";

interface ScrapedData {
    result: string;
}
interface Script {
    _id: string,
    name: string,
    script: string
}

function Script() {
    const urlRef = useRef<HTMLInputElement>(null);
    const scriptRef = useRef<HTMLTextAreaElement>(null);
    const nameRef = useRef<HTMLInputElement>(null); // Changed to HTMLInputElement for text input
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [scriptsFetched, setScriptsFetched] = useState<Script[] | []>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScripts = async () => {
            try {
                const response = await fetch(`${BASE_URL}getAllScripts`);
                if (!response.ok) {
                    throw new Error("Error fetching data");
                }
                const body = await response.json();
                setScriptsFetched(body.data)
                console.log(body);
            } catch (error) {
                console.log("error fetching scripts", error); // Added context to the error log
            }
        };
        fetchScripts();
    }, []);

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
            const response = await scrape(website);
            setScrapedData(response);
            console.log("Backend Response:", response?.result);
            navigate("/scraped-data", { state: { scrapedData: response } });
        } catch (err) {
            setError("Execution failed.");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!nameRef.current || !nameRef.current.value.trim() || !scriptRef.current || !scriptRef.current.value.trim()) {
            setError("Please enter a name and a valid script.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const scriptFormData = {
                name: nameRef.current.value,
                script: scriptRef.current.value,
            };
            const response = await fetch(`${BASE_URL}save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scriptFormData),
            });
            if (response.ok) {
                alert("Script saved");
                if (nameRef.current) {
                    nameRef.current.value = "";
                }
                if (scriptRef.current) {
                    scriptRef.current.value = "";
                }
            } else {
                const errorData = await response.json();
                setError(errorData)
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="website" className="form-label">
                        Website URL:
                    </label>
                    <input
                        ref={urlRef}
                        id="website"
                        className="form-control"
                        type="text"
                        placeholder="https://example.com"
                    />
                    <label htmlFor="name" className="form-label">
                        Name for Script:
                    </label>
                    <input
                        ref={nameRef}
                        id="name"
                        className="form-control"
                        type="text"
                        placeholder="Script name"
                    />

                    <label htmlFor="script" className="form-label">
                        Custom Script:
                    </label>
                    <textarea
                        ref={scriptRef}
                        id="script"
                        className="form-control"
                        placeholder="Enter your Python script here"
                        rows={6}
                        required={true}
                    ></textarea>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn btn-success"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="btn btn-primary me-2"
                        disabled={loading}
                    >
                        {loading ? "Executing..." : "Submit"}
                    </button>

                </div>
            </form>

            {scriptsFetched.map((script) => (
                <div key={script._id}>
                    <div id={script._id} style={{ maxHeight: '300px', overflow: 'auto', border:'1px solid' }}>
                        <h4>{script.name}</h4>
                        <p>
                        {script.script}
                        </p>
                    </div>

                </div>
            ))}


            {error && <p className="text-danger">{error}</p>}
        </>
    );
}

export default Script;
import { FormEvent, useRef, useState } from "react";
import { BASE_URL } from "../utils/config";

interface ScrapedDataType {
  url: string;
  body: string;
  tag_content: string;
  class_content: string;
  id_content: string;
}



function Home() {
    const urlRef = useRef<HTMLInputElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);
    const classRef = useRef<HTMLInputElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedDataType | null>(null);
    const [displayData, setDisplayData] = useState<string | undefined>(scrapedData?.body);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!urlRef.current) {
            setError("Please enter a valid website URL.");
            return;
        }

        const websiteData = {
            url: urlRef.current.value,
            tags: tagsRef.current?.value || "",
            classes: classRef.current?.value || "",
            id: idRef.current?.value || "",
        };

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(websiteData),
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();
            console.log("Scraped data:", data);
            setScrapedData(data)
        } catch (error) {
            setError("Scraping failed.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="website" className="form-label">Website URl:</label>
                    <input ref={urlRef} id="website" className="form-control" type="text" placeholder="https://example.com" />
                    <label htmlFor="tag" className="form-label">tag/s:</label>
                    <input ref={tagsRef} id="tags" className="form-control" type="text" placeholder="div;h1;h2" />
                    <label htmlFor="class" className="form-label">classe/s:</label>
                    <input ref={classRef} id="class" className="form-control" type="text" placeholder="div;h1;h2" />
                    <label htmlFor="id" className="form-label">id/s:</label>
                    <input ref={idRef} id="id" className="form-control" type="text" placeholder="div;h1;h2" />
                    <button type="submit" className="btn btn-primary">
                        {loading ? "Scraping..." : "Submit"}
                    </button>
                </div>
            </form >
            {scrapedData &&
            <div>
            <button onClick={()=>{setDisplayData(scrapedData?.body)}} className="btn btn-primary">Body</button>
            <button onClick={()=>{setDisplayData(scrapedData?.tag_content)}} className="btn btn-secondary">Tag</button>
            <button onClick={()=>{setDisplayData(scrapedData?.class_content)}} className="btn btn-primary">Class</button>
            <button onClick={()=>{setDisplayData(scrapedData?.id_content)}} className="btn btn-secondary">Id</button>

            <div style={{maxHeight:'300px', overflow:'auto', border:'1px solid'}}>
            {scrapedData && (
                <pre>{displayData}</pre>
            )}
            </div>
            </div>
}

        </>
    )
}

export default Home
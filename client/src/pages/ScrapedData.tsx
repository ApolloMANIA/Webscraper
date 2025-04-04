import { useLocation } from "react-router-dom";

function ScrapedData() {
    const location = useLocation();
    const { data } = location.state || {}; // Retrieve data from state

    if (!data) {
        return <p>No data available.</p>;
    }

    return (
        <div className="overflow-auto mt-3">
            <h3>Scraped Data:</h3>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {data}
            </pre>
        </div>
    );
}

export default ScrapedData;


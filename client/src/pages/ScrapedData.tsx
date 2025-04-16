import { useLocation } from "react-router-dom";


interface LocationState {
  scrapedData?: {
    result?: string;
  };
}

function ScrapedData() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const scrapedDataResult = state?.scrapedData?.result;

  if (!scrapedDataResult) {
    return <p>No data available.</p>;
  }

  return (
<>
      <h3>Scraped Data:</h3>

    <div style={{maxHeight:'300px', overflow:'auto', border:'1px solid'}}>
            {scrapedDataResult && (
                <pre>{scrapedDataResult}</pre>
            )}
            </div>

</>


  );
}

export default ScrapedData;
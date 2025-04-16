import NavBar from "./components/NavBar"
import { Routes, Route } from "react-router-dom"
import Script from "./pages/Script"
import Home from "./pages/Home"
import ScrapedData from "./pages/ScrapedData"
function App (){
  return (
    <>
    <NavBar/>
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/script" element={<Script />}></Route>
          <Route path="/scraped-data" element={<ScrapedData />}></Route>
      </Routes>
    </main>

    </>
  )
}

export default App
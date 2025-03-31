import NavBar from "./components/NavBar"
import { Routes, Route } from "react-router-dom"
import Script from "./pages/Script"
import Home from "./pages/Home"
function App (){
  return (
    <>
    <NavBar/>
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/script" element={<Script />}></Route>
      </Routes>
    </main>

    </>
  )
}

export default App
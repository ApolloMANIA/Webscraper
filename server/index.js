const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));

/*
 * getPythonData gets URL and returns a callback with scraped data.
 */
function getPythonData(url, script, tags, callback) {
  const pythonProcess = spawn("python3", [script, url, tags]);  // Ensure URL and tags are passed correctly
  let dataFromPy = "";
  
  pythonProcess.stdout.on("data", (data) => {
    dataFromPy += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (exitCode) => {
    if (exitCode !== 0) {
      console.log("Python script failed :{");
    }
    callback(dataFromPy);
  });
}

// Execute a user-provided script with a URL
function executeUserScript(url, script, callback) {
  if (!url) {
    return callback({ error: "URL is required for script execution." });
  }

  const scriptFilePath = path.join(__dirname, "temp_script.py");

  // Write the user script to a temp file (⚠️ Security risk, ensure validation in production)
  fs.writeFileSync(scriptFilePath, script);

  const pythonProcess = spawn("python3", [scriptFilePath, url]); // Pass URL to the script

  let dataFromPy = "";

  pythonProcess.stdout.on("data", (data) => {
    dataFromPy += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (exitCode) => {
    if (exitCode !== 0) {
      callback({ error: "Script execution failed." });
    } else {
      callback({ result: dataFromPy });
    }

    // Cleanup: Delete the script after execution
    fs.unlinkSync(scriptFilePath);
  });
}

// POST endpoint for scraping
app.post("/sel", (req, res) => {
  const { url, tags } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  getPythonData(url, "src/seleniumScraper.py", tags, (data) => {
    res.send({ url, data });
  });
});

// POST endpoint for custom script execution
app.post("/execute", (req, res) => {
  const { url, script } = req.body;

  if (!script) {
    return res.status(400).json({ error: "No script provided." });
  }

  executeUserScript(url, script, (result) => {
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000...");
});

const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const corsOptions = {
  origin: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("connected to db.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

connectDB();

const scriptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  script: {
    type: String,
    required: true,
  },
});

const Script = mongoose.model("Scripts", scriptSchema);

function getPythonData(url, scriptPath, tags, classes, id, callback) {
  const args = [scriptPath, "--url", url];

  if (tags) {
    args.push("--tag", tags);
  }
  if (classes) {
    args.push("--classes", classes);
  }
  if (id) {
    args.push("--id", id);
  }

  const pythonProcess = spawn("python3", args);

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
    callback(null, dataFromPy);
  });
}

function executeUserScript(url, script, callback) {
  if (!url) {
    return callback({ error: "URL is required for script execution." });
  }
  const scriptFilePath = path.join(__dirname, "temp_script.py");
  fs.writeFileSync(scriptFilePath, script);
  const pythonProcess = spawn("python3", [scriptFilePath, url]);
  let dataFromPy = "";
  pythonProcess.stdout.on("data", (data) => {
    dataFromPy += data.toString();
  });
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });
  pythonProcess.on("close", (exitCode) => {
    fs.unlinkSync(scriptFilePath);

    if (exitCode !== 0) {
      callback({ error: "Script execution failed." });
    } else {
      callback({ result: dataFromPy });
    }
  });
}

app.post("/", (req, res) => {
  const { url, tags, classes, id } = req.body;

  getPythonData(url, "src/seleniumScraper.py", tags, classes, id, (error, data) => {
    if (error) {
      console.error("Error running Python script:", error);
      return res.status(500).send("Failed to run scraper script");
    }
    try {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      res.json(parsedData);
    } catch (e) {
      console.error("Error parsing Python output as JSON:", e);
      res.status(500).send("Failed to parse scraped data");
    }
  });
});

app.post("/execute", async (req, res) => {
  const { url, name, script } = req.body;

  if (!script) {
    return res.status(400).json({ error: "No script provided." });
  }

  try {
    executeUserScript(url, script, (result) => {
      res.json(result);
    });
  } catch (error) {
    console.error("Error saving script:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }


});

app.post("/save", async (req, res) => {
  const { name, script } = req.body;

  if (!script || !name) {
    return res.status(400).json({ error: "Please provide both name and script." });
  }

  try {
    const savedScript = await Script.create({ name, script });
    res.status(201).json({ success: true, message: "Script saved successfully.", data: savedScript });
  } catch (error) {
    console.error("Error saving script:", error);
    res.status(500).json({ error: "Failed to save script." });
  }
});

app.get("/getAllScripts", async (req, res) => {
  try {
    const scripts = await Script.find();
    res.status(200).json({ success: true, message: "Fetched all the scripts.", data: scripts });
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch scripts." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
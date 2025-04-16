## Web Page Scraper
COMP 3033 Final Project 

### Installation

```bash
git clone https://github.com/ApolloMANIA/Webscraper
cd WebPageScraper/server && npm install
cd src/ && pip install -U selenium beautifulsoup4 webdriver_manager lxml fake-useragent
cd ../client && npm install
```

## Setting Up server

We’ll use node.js to run our server. Our app needs ability to fetch html and parse it. Relying on python libraries like beautiful soup will help us achieve our goal.

- setup a simple node.js server
- import child_process package
    
    ```jsx
    const {spawn} = require("child_process")
    ```
    
    child_process (spawn) documentation can be found [here.](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options)
    
    TLDR:
    
    ```jsx
    // "spawn" spawns a new child process
    //syntax:
    const {spawn} = require("node:child_process");
    const process = spawn("command",["arg1","arg2"]);
    //by default runs on cwd
    //if path is given but does not exist, emits an ENOENT erros and exits
    ```
 
- **build docker image**

```bash
docker build -t userid/appname:1.0 .
```

- **docker ports** need to forwarded **to local machine port** to run

```bash
docker run -p 5000:8080 imageid
```
---


## Local installation without docker
### client
```
npm install
npm run dev 

```
### server
```
npm install
cd src/ && pip install selenium beautifulsoup4 webdriver_manager lxml argparse fake_useragent
cd.. && node index.js
```
## Running with docker
### server
```
docker build -t userid/demoapp:1.0 .
docker run -p 3000:3000 imageid
```

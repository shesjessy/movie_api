const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // Log request URL and timestamp
    const logMessage = `${new Date().toISOString()} - Request URL: ${
        req.url
    }\n`;
    fs.appendFile("log.txt", logMessage, (err) => {
        if (err) throw err;
    });

    if (path.includes("documentation")) {
        fs.readFile("documentation.html", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    } else {
        fs.readFile("index.html", (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("File Not Found");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    }
});

server.listen(8080, () => {
    console.log("Server is listening on port 8080");
});

const http = require("http");

const options = {
    hostname: "localhost",
    port: 8080,
    path: "/",
    method: "GET",
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.end();

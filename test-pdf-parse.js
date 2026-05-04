global.DOMMatrix = class DOMMatrix {};
global.Path2D = class Path2D {};
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const pdfPath = path.join(__dirname, "public", "uploads", "resumes", "6de280b4-6ca1-4524-80d8-8f80675981f8.pdf");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    console.log("----- RAW TEXT -----");
    console.log(data.text);
}).catch(e => console.error(e));

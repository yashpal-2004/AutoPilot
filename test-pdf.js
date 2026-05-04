const PDFParser = require("pdf2json");
const fs = require("fs");
const path = require("path");

const pdfParser = new PDFParser(null, 1);
const pdfPath = path.join(__dirname, "public", "uploads", "resumes", "6de280b4-6ca1-4524-80d8-8f80675981f8.pdf");

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
  let text = pdfParser.getRawTextContent();
  console.log("----- RAW TEXT -----");
  console.log(text);
  console.log("----- DECODED TEXT -----");
  try {
    text = decodeURIComponent(text);
    console.log(text);
  } catch(e) {
    console.error("Decode failed", e);
  }
});

pdfParser.loadPDF(pdfPath);

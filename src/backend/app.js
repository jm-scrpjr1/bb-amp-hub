
const express = require("express");
const app = express();


app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "bb-amp-hub-backend" });
});

// test test test test
app.get("/api/hello", (req, res) => {
  res.send("Hello from Bold Amp Hub backend!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

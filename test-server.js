const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  console.log("Test server: Root route accessed");
  res.send("Test server is working!");
});

app.get("/test", (req, res) => {
  console.log("Test server: Test route accessed");
  res.json({ message: "Test route is working!" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

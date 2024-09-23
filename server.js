const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Set up the default route
app.get("/", (req, res) => {
  res.send("Hyperledger Fabric backend server is running.");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

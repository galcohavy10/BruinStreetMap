const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Welcome to BruinStreetMap Node.js Server');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use port 3000 by default

app.get('/', (req, res) => {
    res.send('TrustIssues Backend is running!');
});

app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
});
const express = require('express');
const fs = require('fs');

const app = express();

app.use((req, res) => {
  fs.readFile('./a.html', 'utf-8', (err, data) => {
    if (err) return res.send('error');
    res.send(data);
  });
});

app.listen(3000, () => {});
const express = require('express');
const fs = require('fs');

const app = express();


app.get('/', (req, res) => {
  fs.readFile('./index.html', 'utf-8', (err, data) => {
    if (err) return res.send('error');
    return res.send(data);
  });
});

app.listen(3000, () => {
  console.log('server started at port 3000');
});
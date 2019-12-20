const express = require('express');

const app = express();

app.get('/api/test', (req, res) => {
  const { callback } = req.query;
  // console.log(req.query);
  console.log(req.headers.referer);
  res.setHeader('Content-Type', 'application/x-javascript');
  res.send(`${callback}('hello world')`);
});

app.listen(4000, () => {
  console.log('server started at port 4000');
});
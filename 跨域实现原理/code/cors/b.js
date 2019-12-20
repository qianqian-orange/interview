const express = require('express');
const app = express();

let whiteList = ['http://localhost:3000'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(req.headers);
  if (whiteList.includes(origin)) {
    // 设置那个源可以访问我
    res.setHeader('Access-Control-Allow-Origin', origin);
    // 设置允许携带那个头访问我
    res.setHeader('Access-Control-Allow-Headers', '*');
    // 设置允许那个方法访问我
    res.setHeader('Access-Control-Allow-Methods', '*');
    // 设置是否携带cookie
    res.setHeader('Access-Control-Allow-Credentials', true);
    // 设置预检的存活时间
    res.setHeader('Access-Control-Max-Age', 6);
    // 设置允许返回的头
    res.setHeader('Access-Control-Expose-Headers', '*');
    return next();
  }
  res.send('you are illegal');
});

app.get('/api/test', (req, res) => {
  res.send('hello world');
});

app.listen(4000, () => {
  console.log('server started at port 4000');
});
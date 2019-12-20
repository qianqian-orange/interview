#### 一.  jsonp

---

```javascript
// index.html
function jsonp(url, params, callback) {
	return new Promise((resolve, reject) => {
    const arr = [];
    Object.keys(params).forEach(key => {
      arr.push(`${key}=${params[key]}`);
    });
    const serial = `${arr.join('&')}&callback=${callback}`;
    const script = doucment.createElement('script');
    script.src = `${url}?${serial}`;
    document.body.appendChild(script);
    window[callback] = function (data) {
      resolve(data);
      delete window[callback];
			document.body.removeChild(script);
    }
  });
}
// index.js
app.get('/api', (req, res) => {
  const { callback } = res.query;
  res.setHeader('Content-Type', 'application/x-javascript');
  res.send(`${callback}('hello world')`);
});
```

#### 二. CORS

-----

请求分为两种情况

+ 简单请求

  条件1:使用下列方法之一

  + GET
  + HEAD
  + POST

  条件2:Content-Type的值仅限于下列三者之一

  + text/plain
  + multipart/form-data
  + application/x-www-form-urlencoded

+ 复杂请求

  不符合以上条件的请求就是复杂请求了，复杂请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为“预检”请求，该请求是option方法，通过该请求知道服务端是否允许跨域。

```javascript
// index.html
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:4000/api/test', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      console.log(xhr.response);
    }
  }
}
xhr.send();
// index.js
const whiteList = ['http://localhost:3000'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (whiteList.includes(orgin)) {
    // 设置谁可以访问我
    res.setHeader('Access-Control-Allow-Origin', orgin);
    // 设置允许携带哪些头访问我
    res.setHeader('Access-Control-Allow-Headers', '*');
    // 设置允许哪些方法访问我
    res.setHeader('Access-Control-Allow-Methods', '*');
    // 设置是否允许携带cookie
    res.setHeader('Access-Control-Allow-Credentials', true);
    // 设置预检的存活时间
    res.setHeader('Access-Control-Max-Age', 6);
    // 设置允许返回的头
    res.setHeader('Access-Control-Expose-Headers', '*');
    next();
  }
});

app.get('/api/test', (req, res) => {
  res.end('hello world');
});
```

#### 三. postMessage

---

可用场景：

+ 页面和其打开的新窗口的数据传递
+ 多窗口之间消息传递
+ 页面与嵌套的iframe消息传递

> window.postMessage(message, targetOrigin, [transfer])

+ message：将要发送到其他window的数据。
+ targetOrigin: 通过窗口的origin属性来指定哪些窗口能接收到消息时间，其值可以是字符串“*”（表示无限制）或者一个URL。在发送消息的时候，如果目标窗口的协议，主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送。
+ transfer: 是一串和message同时传递的Transferable对象，这些对象的所有权将被转移给消息的接收方，二发送一方将不再保有所有权。

```javascript
// a.html
<iframe src="http://localhost:4000" frameborder="0" id="frame" onload="load()">
<script>
	function load() {
  	let frame = document.getElementById('frame');
  	frame.contentWindow.postMessage('我爱你', 'http://localhost:4000');
  	window.onmessage = function (e) {
      console.log(e.data) // 我不爱你
    }
	}  
</script>

// b.html
window.onmessage = function (e) {
  console.log(e.data) // 我爱你
  e.source.postMessage('我不爱你', e.origin);
}
```

#### 四. WebSocket

​		WebSocket和HTTP都是应用层协议，都基于TCP协议。但是WebSocket是一种双向通信协议，在建立连接之后，WebSocket的server与client都能主动向对方发送或接收数据。同时，WebSocket在建立连接时需要借助HTTP协议，连接建立好了之后client与server之间的双向通信就与HTTP无关了。

```javascript
// a.html
<script>
	let socket = new WebSocket('ws://localhost:3000');
	socket.onopen = function () {
    socket.send('我爱你');
  }
	socket.onmessage = function (e) {
    console.log(e.data);
  }
</script>

// a.js
let express = require('express');
let app = express();
let WebSocket = require('ws');
let wss = new WebSocket.Server({ port: 3000 });
wss.on('connection', function (ws) {
  ws.on('message', function (data) {
    console.log(data);
    ws.send('我不爱你');
  })
});
```

#### 五. 服务器代理

步骤：

+ 客户端发送请求给代理服务器
+ 代理服务器将请求转发给目标服务器
+ 代理服务器将目标服务器返回的数据转发给客户端

```javascript
// index.html(http://127.0.0.1:5500)
<script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
<script>
  $.ajax({
    url: 'http://localhost:3000',
    type: 'post',
    data: { name: 'xiamen', password: '123456' },
    contentType: 'application/json;charset=utf-8',
    success: function(result) {
      console.log(result) // {"title":"fontend","password":"123456"}
    },
    error: function(msg) {
      console.log(msg)
    }
	})
</script>

// server1.js 代理服务器(http://localhost:3000)
const http = require('http')
// 第一步：接受客户端请求
const server = http.createServer((request, response) => {
  // 代理服务器，直接和浏览器直接交互，需要设置CORS 的首部字段
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  // 第二步：将请求转发给服务器
  const proxyRequest = http
    .request(
      {
        host: '127.0.0.1',
        port: 4000,
        url: '/',
        method: request.method,
        headers: request.headers
      },
      serverResponse => {
        // 第三步：收到服务器的响应
        var body = ''
        serverResponse.on('data', chunk => {
          body += chunk
        })
        serverResponse.on('end', () => {
          console.log('The data is ' + body)
          // 第四步：将响应结果转发给浏览器
          response.end(body)
        })
      }
    )
    .end()
})
server.listen(3000, () => {
  console.log('The proxyServer is running at http://localhost:3000')
})

// server2.js(http://localhost:4000)
const http = require('http')
const data = { title: 'fontend', password: '123456' }
const server = http.createServer((request, response) => {
  if (request.url === '/') {
    response.end(JSON.stringify(data))
  }
})
server.listen(4000, () => {
  console.log('The server is running at http://localhost:4000')
})
```

#### 六. nginx反向代理

​		使用nginx反向代理实现跨域，是最简单的跨域方式。只需要修改nginx的配置即可解决跨域问题，支持所有浏览器，支持session，不需要修改任何代码，并且不会影响服务器性能。

​		实现思路：通过nginx配置一个代理服务器（域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口，并且可以顺便修改cookie中domain信息，方便当前域cookie写入，实现跨域登录。

```javascript
// proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;
    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;

        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}

// index.html
var xhr = new XMLHttpRequest();
// 前端开关：浏览器是否读写cookie
xhr.withCredentials = true;
// 访问nginx中的代理服务器
xhr.open('get', 'http://www.domain1.com:81/?user=admin', true);
xhr.send();

// server.js
var http = require('http');
var server = http.createServer();
var qs = require('querystring');
server.on('request', function(req, res) {
    var params = qs.parse(req.url.substring(2));
    // 向前台写cookie
    res.writeHead(200, {
        'Set-Cookie': 'l=a123456;Path=/;Domain=www.domain2.com;HttpOnly'   // HttpOnly:脚本无法读取
    });
    res.write(JSON.stringify(params));
    res.end();
});
server.listen('8080');
console.log('Server is running at port 8080...');

```


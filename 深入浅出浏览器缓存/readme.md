#### 一. 缓存位置

----

从缓存位置上来说分为四种，并且各自有优先级，当依次查找缓存且都没有命中的时候，才会去请求网络。

+ **Service Worker**

  ​		Service Worker是运行在浏览器背后的独立线程，一般可以用来实现缓存功能。使用Service Worker的话，传输协议必须为HTTPS。因为Service Worker中涉及到请求拦截，所以必须使用HTTPS协议来保障安全。Service Worker的缓存与浏览器其他内建的缓存机制不同，它可以让我们自由控制缓存哪些文件，如何匹配缓存，如何读取缓存，并且缓存是持续的。

  ​		Service Worker实现缓存功能一般分为三个步骤：首先需要先注册Service Worker，然后监听到install事件以后就可以缓存需要的文件，那么在下次用户访问的时候就可以通过拦截请求的方式查询是否存在缓存，存在缓存的话就可以直接读取缓存文件，否则就去请求数据。

  ​		当Service Worker没有命中缓存的时候，我们需要去调用fetch函数获取数据。也就是说，如果我们没有在Service Worker命中缓存的话，会根据缓存查找优先级去查找数据。但是不管我们是从Memory Cache中还是从网络请求中获取的数据，浏览器都会显示我们是从Service Worker中获取的内容。

+ **Memory Cache**

  ​		Memory Cache也就是内存中的缓存，主要包含的是当前页面中已经抓取到的资源，例如页面上已经下载的样式，脚本，图片等。读取内存中的数据肯定比磁盘快，内存缓存虽然读取高效，可是缓存持续性很短，会随着进程的释放而释放。一旦我们关闭Tab页面，内存中的缓存也就被释放了。

  ​		内存缓存在缓存资源时并不关心返回资源的HTTP缓存头Cache-Control是什么值，同时资源的匹配也并非仅仅是对URL做匹配，还可能对Content-Type，CORS等其他特征校验。

+ **Disk Cache**

  ​		Disk Cache也就是存储在硬盘中的缓存，读取速度慢点，比Memory Cache胜在容量和存储时效上。

  ​		它会更具HTTP Header中的字段判断哪些资源需要缓存，哪些资源可以不请求直接使用，哪些资源已经过期需要重新请求。并且即使在跨站点的情况下，相同地址的资源一旦被硬盘缓存下来，就不会再次去请求数据。

+ **Push Cache**

  ​		Push Cache（推送缓存）是HTTP/2中的内容，当以上三种缓存都没命中时，它才会被使用。它只在会话中存在，一旦会话结束就被释放，并且缓存时间也很短暂。

#### 二. 缓存过程分析

​		![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576552626107.jpg)

由上图我们可以知道：

+ 浏览器每次发起请求，都会现在浏览器缓存中查找该请求的结果以及缓存标识。
+ 浏览器每次拿到返回的请求结果都会将该结果和缓存标识存入浏览器缓存中。

#### 三. 强缓存

----

+ Expires

  ​		缓存过期时间，用来制定资源到期的时间，是服务器端的具体的时间点。也就是说，Expires=Max-Age + 请求时间，需要和`Last-modified`结合使用。		

  ​		Expires是HTTP/1的产物，受限于本地时间，如果修改了本地时间，可能会造成缓存失效。

+ Cache-Control

  ​		可以在请求头或者相应头中设置，并且可以组合使用多种指令：

  ![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576553228554.jpg)

![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576553349901.jpg)

>Expires和Cache-Control两者对比
>
>区别在于Expires是HTTP/1.0的产物，Cache-Control是HTTP/1.1的产物，两者同时存在的话，Cache-Control优先级高于Expires。

#### 四. 协商缓存

---

​		协商缓存就是强制缓存失效后，浏览器携带缓存标识向服务器发起请求，有服务器根据缓存表示决定是否使用缓存的过程，主要有以下两种情况：

+ 协商缓存生效，返回304和Not Modified

  ![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576553727461.jpg)

+ 协商缓存失效，返回200和请求结果

  ![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576553762622.jpg)

协商缓存可以通过设置两种HTTP Header实现

+ **Last-Modified和if-Modified-Since**

  ​		浏览器在第一次访问资源，服务器返回资源时，在response header中添加Last-Modified的header，值得这个资源在服务器上的最后修改时间，浏览器接收后缓存文件和header。

  ```javascript
  Last-Modified: Fri, 22 Jul 2019 10:10:10 GMT
  ```

  ​		浏览器再一次请求这个资源，浏览器监测到有Last-Modified这个header，于是添加`if-Modified-Since`这个header，值就是`Last-Modified`中的值；服务器再次收到这个资源请求，会根据`if-Modified-Since`中的值与服务器中这个资源的最后修改时间对比，如果没有变化，返回304和空的响应体，直接从缓存读取，如果`if-Modified-Since`的时间小雨服务器中这个资源的最后修改时间，说明文件有更新，于是返回新的资源文件和200。

  ![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576554296581.jpg)

  **弊端**:

  + 如果本地打开缓存文件，即使没有对文件进行修改，还是会造成`Last-Modified`被修改，服务端不能命中缓存导致发送相同的资源
  + 因为`Last-Modified`只能以秒计时，如果在不可感知的时间内修改完成文件，那么服务端会认为资源还是命中了，不会返回正确的资源。

+ **Etag和If-None-Match**

  ​		Etag时服务端响应请求时，返回当前资源文件的一个唯一标识，只要资源有变化，Etag就会重新生成。浏览器在下一次加载资源向服务端发送请求时，会将上一次返回的Etag值放到request header的`If-None-Match`里，服务端只需要比较客户端传来的`If-None-Match`跟自己服务器上该资源的Etag是否一致，就能很好的判断资源相对客户端而言是否被修改过了。

  ![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576556853226.jpg)

>两者之间对比：
>
>+ 精确度上，Etag要优于Last-Modified。
>+ 性能上，Etag要逊于Last-Modified，毕竟Last-Modified只需要记录时间，而Etag需要服务器通过算法来计算出一hash值。
>+ 优先级上，服务器校验优先考虑Etag。

#### 五. 缓存机制

---

![](/Users/wujunjia/Documents/workspace/interview/深入浅出浏览器缓存/imgs/1576557122784.jpg)

#### 六. 实际场景应用缓存策略

----

+ 频繁变动的资源

  ```javascript
  Cache-Control: no-cache
  ```

  ​		对于频繁变动的资源，首先需要使用`Cache-Control: no-cache`使浏览器每次请求服务器，然后配合Etag或者Last-Modified来校验资源是否有效。这样的做法虽然不能节省请求数量，到那会死能显著减少响应数据大小。

+ 不常变化的资源

  ```javascript
  Cache-Control: max-age=31536000
  ```

  ​		通常处理这个资源时，给它们的Cache-Control配置一个很大的`max-age=31536000(一年)`，这样浏览器之后请求相同的URL会命中强缓存。而为了解决更新的问题，就需要在文件名或路径添加hash，版本号等动态字符，之后更改动态字符，从而达到更改引用URL的目的。
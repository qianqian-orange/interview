#### 浏览器工作流程

-----

构建DOM -> 构建CSSOM -> 构建渲染树 -> 布局 -> 绘制。

#### 回流和重绘

----

+ 重绘：当我们对DOM的修改导致了样式的变化，却并未影响其几何属性（比如修改了颜色或背景颜色）时，浏览器不需要重新计算元素的几何属性，直接为该元素绘制新的样式。

+ 回流：当我们对DOM的修改引发了DOM几何尺寸的变化（比如修改元素的宽，高或隐藏元素等）时，浏览器需要重新计算元素的几何属性（其他元素的几何属性和位置也会因此收到影响），然后再将计算的结果绘制出来。

**回流必定会发生重绘，重绘不一定会引发回流。**

常见引起**回流**属性和方法：

+ 添加或者删除可见的DOM元素
+ 元素尺寸改变
+ 内容变化，比如用户在input框中输入文字
+ 浏览器窗口尺寸改变
+ 计算offsetWidth和offsetHeight属性
+ 设置style属性的值

常见引起**重绘**属性和方法：

![](/Users/wujunjia/Documents/workspace/interview/浏览器页面渲染机制/imgs/1576313931987.jpg)

如何减少回流，重绘：

+ 使用transform替代top

+ 使用visibility替换display:none，前者只会引起重绘，后者会引发重流。

+ 不要把节点的属性值放在一个循环里当成循环里的变量。

  ```javascript
  for (let i = 0; i < 1000; i++) {
    // 获取offsetTop会导致回流，因为需要去获取正确的值
    console.log(document.querySelector('.test').style.offsetTop);
  }
  ```

+ 不要使用table布局
+ 动画实现的速度的选择，动画速度越快，回流次数越多，也可以选择使用requestAnimationFrame
+ CSS选择符从右到左匹配查找，避免节点层级过多
+ 将频繁重绘或者回流的节点设置为图层，图层能够阻止该节点的渲染行为影响别的节点。比如对于video标签来说，浏览器会自动将该节点变为图层。

#### script标签中async和defer的作用及区别

----

![](/Users/wujunjia/Documents/workspace/interview/浏览器页面渲染机制/imgs/1576316532362.jpg)

> 蓝色线代表Javascript加载；红色线代表Javascript执行；绿色线代表HTML解析。

1. `<script src="xxx"><script>`

   浏览器会立即加载并执行指定的脚本，也就是说不等待后续载入的文档元素，读到就加载并执行。

2. `<script src="xxx" async><script>`

   ​		async属性表示异步执行引入的JavaScript，与defer的区别在于，如果已经加载好，就会开始执行，无论此刻是HTML解析阶段还是DOMContentLoaded触发之后。需要注意的是，这种方式加载的JavaScript依然会阻塞load事件。换句话说，async script可能在DOMContentLoaded触发之前或之后执行，但一定在load触发之前执行。

3. `<script defer src="xxx"><script>`

   ​		defer属性表示延迟执行引入的JavaScript，即这段JavaScript加载时HTML并未停止解析，这两个过程是并行的。整个document解析完毕且defer script也加载完成之后（这两件事情的顺序无关），会执行所有由`defer script`加载的JavaScript代码，然后触发DOMContentLoaded事件。
   
   ​		在加载多个JS脚本的时候，async是无顺序的加载，而defer是有顺序的加载。

#### 性能优化策略

----

+ JS优化：`<script>`标签加上defer属性和async属性用于在不阻塞页面文档解析的前提下，控制脚本的下载和执行。
+ CSS优化：`<link>`标签的rel属性的属性值设置为preload能够让你的HTML页面中可以指明哪些资源是在页面加载完成后即刻需要的，最优的配置加载顺序，提高渲染性能。
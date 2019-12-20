#### 1.数据类型判断

+ typeof：返回一个表示数据类型的字符串，返回结果包括：

  `number`,`boolean`,`string`,`symbol`,`object`,`undefined`,`function`等7种数据类型，但不能判断`null`,`Array`,`Date`,`RegExp`等。

+ instanceof：判断A是否为B的实例，但不能检测null和undefined.

+ Object.prototype.toString.call()

  >  该方法是最准确最常用的方式。

#### 2.继承

+ 寄生拷贝继承

  ```javascript
  function Parent(name) {
    this.name = name;
  }
  Parent.prototype.eat = function () {
    console.log('eat');
  }
  function Child(name,age) {
    Parent.call(this, name);
    this.age = age;
  }
  Child.prototype = Object.create(Parent.prototype, {
    value: Child,
    enumerable: true,
    writable: true,
    configurable: true
  });
  Child.prototype.sleep = function () {
    console.log('sleeep');
  }
  ```

#### 3. 变量提升

+ 变量声明提升

  ```javascript
  console.log(a); // undefined
  var a = 10;
  ```

+ 函数声明提升

  ```javascript
  console.log(f1) // function f1() {}
  function f1() {} //函数声明
  console.log(f2) // undefined
  var f2 = function () {} //函数表达式
  ```

> 注意点：当遇到函数和变量同名时，函数声明优先级比较高，以此变量声明会被函数声明所覆盖，但是可以重新赋值。

```javascript
alert(a) // function a() {}
var a = 'variable'
function a() {}
alert(a) // 'variable'
```


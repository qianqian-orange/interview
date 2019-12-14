#### 如何侦测数据的变化

1. Object.defineProperty

   ```javascript
   function observe(obj) {
     if (!obj || typeof obj !== 'object') return;
     Object.keys(obj).forEach(key => {
       defineReactive(obj, key, obj[key]);
     });
   }
   
   function defineReactive(obj, key, value) {
     observe(value);
     Object.defineProperty(obj, key, {
       enumerable: true,
       configurable: true,
       get() {
         return value;
       },
       set(val) {
         observe(val);
         if (value !== val) {
           value = val;
         }
       }
     })
   }
   ```

   注意点：`Object.defineProperty`不能监听数组的变化。

2. Proxy

   ```javascript
   const handler = {
     get(target, key) {
       if (!target[key] && typeof target[key] === 'object') {
         return new Proxy(target[key], handler);
       }
       return Reflect.get(target, key);
     },
     set(target, key, value) {
       // 拦截处理代码
       return Reflect.set(target, key, value);
     }
   }
   ```

   
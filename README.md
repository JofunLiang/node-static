# node-static

node.js 搭建静态资源服务器。

## 创建服务器

搭建静态资源服务器，首先需要有一个服务器，使用 node 搭建服务器需要使用 http 模块，代码很简单。

创建 server.js 文件，添加以下代码：
```js
// server.js
const http = require('http')

const server = http.createServer((req, res) => {
  res.end('Hello world!')
})

// 服务器端口
const port = process.env.PORT || 3333

server.listen(port, () => {
  console.log('server is running at localhost:', port)
})
```
现在，运行 node server.js 命令启动服务器，通过浏览器访问 localhost:3333，检查浏览器是否成功启动。

## 发送静态文件

上一步创建服务器时，成功发送了字符串 “Hello world!"，接下来就要进入正题了——发送静态文件。

静态资源服务器当然少不了静态资源（文件），先要确定静态资源在服务器上存放的位置，这里统一将静态资源放置在 public 文件夹，目录结构大致是这样的：
```
├── public
│   └── index.html
└── server.js
```
在 public 目录下新建一个 index.html 文件：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <div>Hello World!</div>
</body>
</html>
```
接下来，需要实现在浏览器地址栏中输入 localhost:3000/index.html 获取到 index.html 文件的功能。

怎么知道客户端请求 index.html 这个文件呢？通过分析客户端的请求地址，才能清楚客户端的需求。因此，需要使用 node 的另一个核心模块—— path 模块，根据客户端的请求地址拼接出需要发送的文件路径。

获取文件路径代码如下：
```js
const filepath = path.join(__dirname, '/public', req.url)
```

获取到文件路径后，需要读取文件并发送到客户端，读取文件可以使用 node 的 fs 模块。

现在，server.js 代码如下：
```js
// server.js
const http = require('http')
const path = require('path')
const fs = require('fs')

const server = http.createServer((req, res) => {
  const filepath = path.join(__dirname, '/public', req.url)

  // 读取文件
  fs.readFile(filepath, (err, file) => {
    if (err) {
      res.writeHead(404)
      res.end('404 - Not Found!')
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(file)
    }
  })
})

// 服务器端口
const port = process.env.PORT || 3333

server.listen(port, () => {
  console.log('server is running at localhost:', port)
})
```
现在，重启服务器并在浏览器地址栏中输入 localhost:3333/index.html 查看是否成功打开 index.html 文件。

## 设置文件 MIME 类型

多用途 Internet 邮件扩展（MIME）类型是用一种标准化的方式来表示文档的“性质”和“格式”。 简单说，浏览器通过 MIME 类型来确定如何处理文档。因此在响应对象的头部设置正确 MIME 类型是非常重要的。

由于客户端请求的文件类型是不确定的，为文件设置了错误的 MIME 类型很有可能会导致文件无法正常显示。虽然浏览器可能会通过查看资源来进行猜测 MIME 类型， 叫做** MIME 嗅探**。不同的浏览器在不同的情况下可能会执行不同的操作。所以为了保证资源在每一个浏览器下的行为一致性，需要手动设置文件 MIME 类型。这一步可以很轻松的使用第三方模块 [mime](https://www.npmjs.com/package/mime) 来实现。

安装 mime 模块：
```
npm install --save mime
```

获取文件 MIME 类型：
```js
const mimeType = mime.getType(filepath)
```

引入 mime 模块，修改发送文件的代码如下：
```js
const mimeType = mime.getType(filepath)
res.writeHead(200, { 'Content-Type': mimeType })
res.end(file)
```
现在，静态资源服务器的功能就完成了，看看是不是可以获取到任意文件了，比如：图片、音频、视频等。

## 使用 stream 发送优化性能

上面的代码成功实现了静态资源服务器，但是存在一个问题，那就是一次性把整个响应文件发送到客户端，如果静态文件很大，比如发送音频、视频，上面的代码还能正常运行吗，如果文件的大小超过服务器内存，那么...，服务器就会挂掉。

为了防止这种情况，需要使用 node 里面另外一个非常重要的东西—— stream 流，在 node 中 stream 流可以将文件切分为部分，一点一点的进行读写操作。

将代码：
```js
fs.readFile(filepath, (err, file) => {
  if (err) {
    res.writeHead(404)
    res.end('404 - Not Found!')
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(file)
  }
})
```
修改为：
```js
if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
  const mimeType = mime.getType(filepath)
  res.writeHead(200, { 'Content-Type': mimeType })
  fs.createReadStream(filepath).pipe(res)
} else {
  res.writeHead(404)
  res.end('404 - Not Found!')
}
```

完整代码请查看 [server.js](https://github.com/JofunLiang/node-static/blob/master/server.js)。




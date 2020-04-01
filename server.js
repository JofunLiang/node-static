// server.js
const http = require('http')
const path = require('path')
const fs = require('fs')
const mime = require('mime')

const server = http.createServer((req, res) => {
  const filepath = path.join(__dirname, '/public', req.url)

  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    const mimeType = mime.getType(filepath)
    res.writeHead(200, { 'Content-Type': mimeType })
    fs.createReadStream(filepath).pipe(res)
  } else {
    res.writeHead(404)
    res.end('404 - Not Found!')
  }
})

// 服务器端口
const port = process.env.PORT || 3333

server.listen(port, () => {
  console.log('server is running at localhost:', port)
})
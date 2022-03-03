import * as fs from 'fs';
import * as http from 'http'
import * as p from 'path'
import * as url from 'url'
import { IncomingMessage, ServerResponse } from 'http'


const server = http.createServer()
const publicDir = p.resolve(__dirname, 'public')
let cacheAge = 3600 * 24 * 365

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const { method, url: path, headers } = request;
    const { pathname, search } = url.parse(path)

    if (method !== 'GET') {
        response.statusCode = 405
        response.end()
        return
    }

    let filename = pathname.substring(1)
    if (filename === '') {
        filename = 'index.html'
    }

    fs.readFile(p.resolve(publicDir, filename), (error, data) => {
        if (error) {
            if (error.errno === -4058) {
                response.statusCode = 404
                response.end('文件不存在')

            } else if (error.errno = -4068) {
                response.statusCode = 403
                response.end('无权查看目录内容')
            } else {
                response.statusCode = 500
                response.end('服务器繁忙')
            }
        } else {
            //添加缓存
            response.setHeader('Cache-Control', `public,max-age=${cacheAge}`)
            //f返回文件内容
            response.end(data)
        }
    })


})

//监听本机端口
server.listen(8888)
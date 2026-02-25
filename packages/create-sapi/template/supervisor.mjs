#!/usr/bin/env node
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverPath = path.join(__dirname, 'lib', 'server.js')

function run() {
  const child = spawn('bun', [serverPath], {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code) => {
    if (code === 0) {
      // exit(0) = 主动重载请求，重新启动服务
      console.log('[sapi] 重启中...')
      run()
    } else {
      // 非 0 退出码 = 真实崩溃，停止重启
      process.exit(code ?? 1)
    }
  })
}

run()

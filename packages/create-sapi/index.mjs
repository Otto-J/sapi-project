#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const target = process.argv[2] || '.'
const targetDir = path.resolve(process.cwd(), target)
const templateDir = path.join(__dirname, 'template')

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyDir(templateDir, targetDir)

// 复制 .env.example 为 .env（如果 .env 不存在）
const envExample = path.join(targetDir, '.env.example')
const envFile = path.join(targetDir, '.env')
if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
  fs.copyFileSync(envExample, envFile)
}

console.log(`✓ SAPI 项目已初始化到 ${targetDir}`)
console.log('')
console.log('下一步：')
console.log('  1. 编辑 .env，设置 DASHBOARD_TOKEN')
console.log('  2. docker-compose up -d')
console.log(`  3. 打开 http://localhost:3007/dashboard`)

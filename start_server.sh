#!/bin/bash

echo "=== 启动服务器诊断 ==="

# 清理端口
echo "1. 清理端口 8000 和 8080..."
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# 检查目录
echo "2. 检查目录..."
if [ ! -d "/Users/lit/Desktop/tarot/demo" ]; then
    echo "❌ demo 目录不存在！"
    exit 1
fi

if [ ! -f "/Users/lit/Desktop/tarot/demo/index.html" ]; then
    echo "❌ index.html 文件不存在！"
    exit 1
fi

echo "✅ 目录检查通过"

# 检查 Python
echo "3. 检查 Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装！"
    exit 1
fi
echo "✅ Python3 可用: $(python3 --version)"

# 启动服务器
echo "4. 启动服务器在 8080 端口..."
cd /Users/lit/Desktop/tarot/demo
python3 -m http.server 8080 > /tmp/server_8080.log 2>&1 &
SERVER_PID=$!
sleep 3

# 检查是否启动成功
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ 服务器进程已启动 (PID: $SERVER_PID)"
else
    echo "❌ 服务器启动失败！"
    echo "错误日志："
    cat /tmp/server_8080.log 2>/dev/null
    exit 1
fi

# 检查端口
if lsof -i:8080 > /dev/null 2>&1; then
    echo "✅ 端口 8080 正在监听"
else
    echo "❌ 端口 8080 未监听"
    exit 1
fi

# 获取 IP
echo "5. 获取局域网 IP..."
IP=$(ifconfig en0 2>/dev/null | grep "inet " | awk '{print $2}')
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

echo ""
echo "========================================"
echo "✅ 服务器启动成功！"
echo "📍 本地访问: http://localhost:8080"
if [ -n "$IP" ]; then
    echo "🌐 局域网访问: http://$IP:8080"
else
    echo "⚠️  无法获取局域网IP，请查看系统网络设置"
fi
echo "========================================"
echo ""
echo "停止服务器: kill $SERVER_PID"
echo "查看日志: cat /tmp/server_8080.log"

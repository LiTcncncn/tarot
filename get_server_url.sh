#!/bin/bash

# 清理端口
echo "清理端口..."
lsof -ti:8000 -ti:8080 | xargs kill -9 2>/dev/null
sleep 1

# 启动服务器
echo "启动服务器..."
cd "$(dirname "$0")/demo"
python3 -m http.server 8080 > /dev/null 2>&1 &
sleep 2

# 获取 IP 地址
IP=$(ifconfig en0 2>/dev/null | grep "inet " | awk '{print $2}')
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

# 检查服务器是否运行
if lsof -i:8080 > /dev/null 2>&1; then
    echo ""
    echo "✅ 服务器已启动"
    echo "📍 本地访问: http://localhost:8080"
    if [ -n "$IP" ]; then
        echo "🌐 局域网访问: http://$IP:8080"
    else
        echo "⚠️  无法获取局域网IP，请在系统设置中查看"
    fi
else
    echo "❌ 服务器启动失败"
fi

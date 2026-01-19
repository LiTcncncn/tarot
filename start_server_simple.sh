#!/bin/bash

# 清理端口
echo "清理端口 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# 检查目录
if [ ! -d "/Users/lit/Desktop/tarot/build" ]; then
    echo "错误: build 目录不存在"
    exit 1
fi

# 启动服务器
echo "启动服务器..."
cd /Users/lit/Desktop/tarot/build
python3 -m http.server 8000 &
SERVER_PID=$!

# 等待启动
sleep 2

# 检查是否启动成功
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务器已启动 (PID: $SERVER_PID)"
    echo "📍 访问地址: http://localhost:8000"
    
    # 尝试获取局域网 IP
    IP=$(python3 -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)
    if [ -n "$IP" ]; then
        echo "🌐 局域网地址: http://$IP:8000"
    fi
else
    echo "❌ 服务器启动失败"
    exit 1
fi

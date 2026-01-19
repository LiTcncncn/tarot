#!/bin/bash
cd "$(dirname "$0")/build"

# 清理旧进程
lsof -ti:8000 | xargs kill -9 2>/dev/null

echo "正在启动服务器..."
echo ""

# 启动服务器
python3 -m http.server 8000 &
SERVER_PID=$!

sleep 2

# 检查是否启动成功
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ 服务器已启动！"
    echo ""
    echo "📍 本地访问: http://localhost:8000"
    
    # 获取局域网 IP
    IP=$(python3 -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)
    if [ -n "$IP" ]; then
        echo "🌐 局域网访问: http://$IP:8000"
    else
        echo "⚠️  无法自动获取 IP，请查看系统设置 > 网络"
    fi
    
    echo ""
    echo "按 Ctrl+C 停止服务器"
    wait $SERVER_PID
else
    echo "❌ 服务器启动失败"
    exit 1
fi

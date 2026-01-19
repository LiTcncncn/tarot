#!/bin/bash

echo "🔧 清理端口 8000..."
# 查找并杀死占用 8000 端口的进程
PIDS=$(lsof -ti:8000 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "发现占用端口的进程: $PIDS"
    kill -9 $PIDS 2>/dev/null
    sleep 2
    echo "✅ 已清理"
else
    echo "✅ 端口未被占用"
fi

# 再次确认
REMAINING=$(lsof -ti:8000 2>/dev/null)
if [ -n "$REMAINING" ]; then
    echo "⚠️  仍有进程占用，强制清理..."
    kill -9 $REMAINING 2>/dev/null
    sleep 1
fi

echo ""
echo "🚀 启动服务器..."
cd /Users/lit/Desktop/tarot/build

# 启动服务器
python3 -m http.server 8000 > /tmp/http_server_8000.log 2>&1 &
SERVER_PID=$!

sleep 3

# 检查是否启动成功
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ 服务器启动成功！"
    echo ""
    echo "📍 本地访问: http://localhost:8000"
    
    # 获取局域网 IP
    IP=$(python3 -c "
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    ip = s.getsockname()[0]
    s.close()
    print(ip)
except:
    pass
" 2>/dev/null)
    
    if [ -n "$IP" ]; then
        echo "🌐 局域网访问: http://$IP:8000"
    else
        echo "⚠️  无法自动获取 IP，请运行以下命令获取："
        echo "   python3 -c \"import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()\""
    fi
    
    echo ""
    echo "📋 服务器信息:"
    echo "   - 进程 PID: $SERVER_PID"
    echo "   - 服务目录: $(pwd)"
    echo "   - 日志文件: /tmp/http_server_8000.log"
    echo ""
    echo "💡 停止服务器: kill $SERVER_PID"
else
    echo "❌ 服务器启动失败"
    echo "查看日志: cat /tmp/http_server_8000.log"
    cat /tmp/http_server_8000.log 2>/dev/null
fi

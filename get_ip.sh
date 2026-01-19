#!/bin/bash
# 获取局域网 IP 地址

# 方法1: 使用 ipconfig (macOS)
IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

# 方法2: 使用 ifconfig
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep -E "inet (192\.168|10\.|172\.)" | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

# 方法3: 使用 Python
if [ -z "$IP" ]; then
    IP=$(python3 -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)
fi

# 输出结果
if [ -n "$IP" ]; then
    echo "$IP"
else
    echo "127.0.0.1"
fi

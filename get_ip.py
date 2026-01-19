#!/usr/bin/env python3
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "未知"

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"✅ 服务器已启动")
    print(f"📍 本地访问: http://localhost:8080")
    print(f"🌐 局域网访问: http://{ip}:8080")

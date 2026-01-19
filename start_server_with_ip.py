#!/usr/bin/env python3
import socket
import subprocess
import sys
import os
import time

# 清理旧进程
try:
    result = subprocess.run(['lsof', '-ti:8000'], capture_output=True, text=True)
    if result.stdout.strip():
        pids = result.stdout.strip().split('\n')
        for pid in pids:
            try:
                subprocess.run(['kill', '-9', pid], check=False)
            except:
                pass
except:
    pass

# 启动服务器
os.chdir('/Users/lit/Desktop/tarot/build')
server_process = subprocess.Popen(
    ['python3', '-m', 'http.server', '8000'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

# 等待服务器启动
time.sleep(2)

# 获取 IP 地址
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        pass
    
    try:
        result = subprocess.run(['ifconfig'], capture_output=True, text=True, timeout=2)
        import re
        for line in result.stdout.split('\n'):
            if 'inet ' in line and '127.0.0.1' not in line:
                match = re.search(r'inet (?:addr:)?(\d+\.\d+\.\d+\.\d+)', line)
                if match:
                    ip = match.group(1)
                    if any(ip.startswith(prefix) for prefix in ['192.168.', '10.', '172.']):
                        return ip
    except:
        pass
    
    return None

ip = get_local_ip()

print("✅ 服务器已启动")
print(f"📍 局域网访问地址: http://{ip}:8000" if ip else "📍 无法获取IP，请查看系统设置 > 网络")
print("🔗 本地访问地址: http://localhost:8000")
print(f"📂 服务目录: {os.getcwd()}")
print(f"🆔 服务器进程 PID: {server_process.pid}")

# 保持脚本运行（可选）
# server_process.wait()

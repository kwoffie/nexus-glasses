#!/usr/bin/env python3
"""
NEXUS Spectacle Launcher Wrapper

Simple launcher that starts both frontend and backend servers.
This wrapper detects available ports and starts the project.
"""
import subprocess
import sys
import time
import socket
import select
import os
import webbrowser
from pathlib import Path

# Get project directory - bot.py lives in a subdirectory, so use parent
# Also allow override via NEXUS_DIR environment variable
PROJECT_DIR = Path(os.environ.get('NEXUS_DIR', str(Path(__file__).parent.parent)))
FRONTEND_DIR = PROJECT_DIR
BACKEND_DIR = PROJECT_DIR / "server"


# Default ports

FRONTEND_PORT = int(os.environ.get('FRONTEND_PORT', '5173'))
BACKEND_PORT = int(os.environ.get('BACKEND_PORT', '5000'))

# Find available ports
def find_available_port(start_port, max_attempts=10):
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except socket.error:
            continue
    return start_port

# Check prerequisites
def check_prerequisites():
    if not Path(FRONTEND_DIR / 'package.json').exists():
        print("❌ Frontend package.json not found")
        return False
    if not Path(BACKEND_DIR / 'package.json').exists():
        print("❌ Backend package.json not found")
        return False
    return True

# Start a process and wait for it to be ready
def start_server(cmd, working_dir, port_name, port):
    print(f"🚀 Starting {port_name} server on port {port}")
    env = os.environ.copy()
    if port_name == "backend":
        env['PORT'] = str(port)
    
    proc = subprocess.Popen(
        cmd,
        cwd=str(working_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env
    )
    
    # Wait for server to be ready
    timeout = 30
    start_time = time.time()
    while time.time() - start_time < timeout:
        line = proc.stdout.readline()
        if line:
            print(f"[{port_name.upper()}] {line.strip()}")
            if 'listening' in line.lower() or 'ready' in line.lower() or 'started' in line.lower():
                return proc
        time.sleep(0.5)
    
    # Check if process is still running
    if proc.poll() is not None:
        print(f"❌ {port_name} server failed to start")
        return None
    
    return proc

# Main launcher
def main():
    print("✨ Launching NEXUS Spectacle...\n")
    
    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)
    
    # Find available ports
    frontend_port = find_available_port(FRONTEND_PORT)
    backend_port = find_available_port(BACKEND_PORT)
    
    if frontend_port != FRONTEND_PORT:
        print(f"⚠️  Port {FRONTEND_PORT} in use, using {frontend_port}")
    if backend_port != BACKEND_PORT:
        print(f"⚠️  Port {BACKEND_PORT} in use, using {backend_port}")
    
    # Start servers
    frontend_proc = None
    backend_proc = None
    
    try:
        # Start frontend (Vite)
        frontend_proc = start_server(
            ['npm', 'run', 'dev', '--', '--host', '--port', str(frontend_port)],
            FRONTEND_DIR,
            "frontend",
            frontend_port
        )
        if not frontend_proc:
            print("❌ Failed to start frontend")
            sys.exit(1)
        
        # Start backend
        backend_proc = start_server(
            ['npm', 'start'],
            BACKEND_DIR,
            "backend",
            backend_port
        )
        if not backend_proc:
            print("❌ Failed to start backend")
            if frontend_proc:
                frontend_proc.terminate()
            sys.exit(1)
        
        # Open browser
        print(f"🌐 Opening browser at http://localhost:{frontend_port}")
        webbrowser.open(f'http://localhost:{frontend_port}')
        
        print(f"\n✅ NEXUS Spectacle is running!")
        print(f"   Frontend: http://localhost:{frontend_port}")
        print(f"   Backend:  http://localhost:{backend_port}")
        print("\nPress Ctrl+C to stop servers")
        
        # Keep running until interrupted
        while True:
            if frontend_proc.poll() is not None or backend_proc.poll() is not None:
                print("\n❌ One of the servers stopped unexpectedly")
                sys.exit(1)
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        if frontend_proc:
            frontend_proc.terminate()
        if backend_proc:
            backend_proc.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()
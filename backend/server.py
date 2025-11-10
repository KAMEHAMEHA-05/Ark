import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import subprocess
import os
from dotenv import load_dotenv
import getpass
import psutil
import GPUtil
import time
import base64

load_dotenv()

def load_encrypted_env(password):
    result = subprocess.run(
        ["openssl", "aes-256-cbc", "-d", "-pbkdf2", "-in", ".env.enc", "-k", password],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception("Failed to decrypt .env.enc: " + result.stderr)

    env_vars = {}
    for line in result.stdout.splitlines():
        if line.strip() and not line.startswith("#"):
            key, val = line.split("=", 1)
            val = val.strip()

            # Remove surrounding quotes if present
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]

            env_vars[key.strip()] = val

    return env_vars


# Secure password prompt at runtime (no env vars needed)
password = getpass.getpass("Enter decryption key: ")
env = load_encrypted_env(password)

VALID_USERNAME = env.get('ARK_USERNAME')
VALID_PASSWORD = env.get('ARK_PASSWORD')
print(f"VALID_USERNAME: {VALID_USERNAME}")
print(f"VALID_PASSWORD: {VALID_PASSWORD}")


app = Flask(__name__)
CORS(app, origins=["https://ark-theta-brown.vercel.app", "http://localhost:5173"])
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


"""

---------System Stats-----------

"""

def get_system_stats():
    try:
        gpus = GPUtil.getGPUs()
    except Exception:
        gpus = []
    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "network": psutil.net_io_counters(pernic=False)._asdict(),
        "gpus": [{
            "name": gpu.name,
            "load": gpu.load * 100,
            "memoryUsed": gpu.memoryUsed,
            "memoryTotal": gpu.memoryTotal
        } for gpu in gpus],
        "processes": [{
            "pid": p.info['pid'],
            "name": p.info['name'],
            "cpu": p.info['cpu_percent'],
            "mem": p.info['memory_percent']
        } for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent'])]
    }

# Background thread to push data
def monitor():
    psutil.cpu_percent(interval=None)  # Prime CPU usage monitor

    while True:
        stats = get_system_stats()
        socketio.emit('system_update', stats, namespace='/')
        eventlet.sleep(1)  # Non-blocking sleep


@socketio.on('terminate_process')
def terminate(data):
    pid = data.get('pid')
    try:
        p = psutil.Process(pid)
        p.terminate()
        socketio.emit('process_killed', {"pid": pid})
    except Exception as e:
        socketio.emit('error', {"error": str(e)})

@socketio.on('restart_process')
def restart(data):
    pid = data.get('pid')
    try:
        p = psutil.Process(pid)
        cmdline = p.cmdline()
        p.terminate()
        p.wait()
        psutil.Popen(cmdline)
        socketio.emit('process_restarted', {"pid": pid})
    except Exception as e:
        socketio.emit('error', {"error": str(e)})

NOTES_DIR = "F:/Ark/notes_data"
os.makedirs(NOTES_DIR, exist_ok=True)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == VALID_USERNAME and password == VALID_PASSWORD:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

# -------------------
# Files API
# -------------------

@app.route('/api/files')
def open_files():
    try:
        subprocess.Popen(
            'filebrowser.exe -a 0.0.0.0 -p 8080 --database "F:\\Ark\\filebrowser\\filebrowser.db" --baseurl /files',
            shell=True,
            cwd="F:\\Ark\\filebrowser"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"redirect": "http://zenmaster:8080"})

# -------------------
# Dummy API
# -------------------

@app.route('/api/dummy')
def dummy():
    return jsonify({"status": "No endpoint assigned."})

# -------------------
# Notes API
# -------------------

@app.route('/api/notes', methods=['POST'])
def save_note():
    data = request.get_json()
    content = data.get("content")
    name = data.get("name")
    overwrite = data.get("overwrite")

    filename = overwrite if overwrite else name + ".html"

    with open(os.path.join(NOTES_DIR, filename), 'w', encoding='utf-8') as f:
        f.write(content)

    return jsonify({"status": "Note saved"})

@app.route('/api/notes', methods=['GET'])
def get_notes():
    notes = []
    for filename in os.listdir(NOTES_DIR):
        with open(os.path.join(NOTES_DIR, filename), 'r', encoding='utf-8') as f:
            content = f.read()
        notes.append({
            "name": filename,
            "content": content
        })
    return jsonify({"notes": notes})

@app.route('/api/notes/<note_name>', methods=['DELETE'])
def delete_note(note_name):
    safe_name = os.path.basename(note_name)
    path = os.path.join(NOTES_DIR, safe_name)

    if os.path.exists(path):
        os.remove(path)
        return jsonify({"status": "deleted"})
    else:
        return jsonify({"error": "Note not found"}), 404

# -------------------
# Terminal WebSocket
# -------------------

@socketio.on('run_command')
def handle_run_command(data):
    command = data.get('command')
    sid = request.sid  # Get the socket ID of the sender

    if not command:
        emit('output', {'output': 'No command provided.\n'}, to=sid)
        return

    socketio.start_background_task(execute_command, command, sid)

def execute_command(command, sid):
    try:
        process = subprocess.Popen(
            f'cmd.exe /C {command}',
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )

        output, _ = process.communicate()

        for line in output.splitlines():
            socketio.emit('output', {'output': line + '\n'}, to=sid)

        socketio.emit('output_end', {'output': f'\nProcess exited with code {process.returncode}\n'}, to=sid)

    except Exception as e:
        socketio.emit('output', {'output': f'Error: {str(e)}\n'}, to=sid)
        socketio.emit('output_end', {}, to=sid)

# -------------------
# Beacon - chat and calls
# -------------------

connected_devices = {}  # device_id: socket_id

data_store = {
    "device_registry": {
        "zenmaster": "100.121.221.59",
        "ishaan-phone": "100.103.4.120",
        "ark-t2": "100.74.36.89"
    }
}

# Register a device
@socketio.on('register')
def handle_register(data):
    device_id = data.get('device_id')
    if device_id:
        connected_devices[device_id] = request.sid
        join_room(device_id)
        print(f"Device registered: {device_id}")

# Handle message (E2E encrypted)
@socketio.on('send_message')
def handle_message(data):
    recipient = data.get('to')
    payload = data.get('payload')
    if recipient and payload:
        emit('receive_message', payload, room=recipient)

# Handle file transfer (base64, chunked for large files)
@socketio.on('send_file')
def handle_file(data):
    recipient = data.get('to')
    filedata = data.get('file')  # expected: {filename, mime, content (base64)}
    if recipient and filedata:
        emit('receive_file', filedata, room=recipient)

# Handle ping request
@socketio.on('send_ping')
def handle_ping(data):
    recipient = data.get('to')
    sender = data.get('from')
    if recipient:
        emit('receive_ping', {"from": sender}, room=recipient)

# Handle WebRTC signaling
@socketio.on('signal')
def handle_signal(data):
    sender = data.get('from')
    recipient = data.get('to')
    signal_data = data.get('signal')
    if recipient and signal_data:
        emit('signal', {
            "from": sender,
            "signal": signal_data
        }, room=recipient)

# API to get device registry
@app.route('/devices', methods=['GET'])
def get_devices():
    return jsonify(data_store["device_registry"])

# Update device IPs manually or through heartbeat
@app.route('/register_device_ip', methods=['POST'])
def register_device_ip():
    body = request.json
    name = body.get("device")
    ip = body.get("ip")
    if name and ip:
        data_store["device_registry"][name] = ip
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Missing fields"}), 400


# -------------------

if __name__ == '__main__':
    socketio.start_background_task(monitor)
    socketio.run(app, host='0.0.0.0', port=5000)

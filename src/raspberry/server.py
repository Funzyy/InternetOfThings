from flask import Flask, request, jsonify

app = Flask(__name__)

positions = {}  # letzte Position je device_id

@app.route("/track", methods=["POST"])
def track():
    data = request.get_json(force=True, silent=True) or {}
    device_id = data.get("device_id", "unknown")
    positions[device_id] = data
    print(f"[{device_id}] {data}")
    return jsonify({"status": "ok"}), 200

@app.route("/last")
def last():
    return jsonify(positions)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

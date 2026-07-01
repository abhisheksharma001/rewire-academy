import http.server
import socketserver
import json
import os

PORT = 9999
DATA_FILE = "webhook_payload.json"

class WebhookHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            # Try to parse and format JSON nicely
            json_data = json.loads(post_data.decode('utf-8'))
            with open(DATA_FILE, "w") as f:
                json.dump(json_data, f, indent=2)
            print(f"Received JSON data and saved to {DATA_FILE}")
        except:
            # Fallback for raw data
            with open(DATA_FILE, "w") as f:
                f.write(post_data.decode('utf-8'))
            print(f"Received raw data and saved to {DATA_FILE}")

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'{"status": "success"}')

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'{"status": "listening"}')

with socketserver.TCPServer(("", PORT), WebhookHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

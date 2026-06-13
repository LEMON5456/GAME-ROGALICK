import http.server
import threading
import urllib.request
import sys

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = http.server.HTTPServer(('127.0.0.1', 8080), QuietHandler)
thread = threading.Thread(target=httpd.serve_forever, daemon=True)
thread.start()

try:
    resp = urllib.request.urlopen('http://127.0.0.1:8080/')
    print(resp.read().decode('utf-8'))
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
finally:
    httpd.shutdown()

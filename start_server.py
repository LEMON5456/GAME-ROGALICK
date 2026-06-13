import http.server
import sys
import os
import socket

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def send_head(self):
        path = self.translate_path(self.path)
        try:
            with open(path, 'rb') as f:
                data = f.read()
            ct = self.guess_type(path)
            self.send_response(200)
            self.send_header("Content-Type", ct + "; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            return data
        except FileNotFoundError:
            self.send_error(404)
            return None

    def copyfile(self, source, outputfile):
        outputfile.write(source)

port = 8080
# Try up to 5 ports if 8080 is taken
for attempt in range(5):
    try:
        with http.server.HTTPServer(('127.0.0.1', port), Handler) as httpd:
            print(f"Server started on http://127.0.0.1:{port}")
            sys.stdout.flush()
            import webbrowser
            webbrowser.open(f'http://127.0.0.1:{port}')
            httpd.serve_forever()
        break
    except OSError:
        port += 1
        if attempt >= 4:
            print(f"Could not bind to any port")
            sys.exit(1)

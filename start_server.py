import http.server
import sys
import os

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

with http.server.HTTPServer(('127.0.0.1', 8080), Handler) as httpd:
    print(f"Server started on http://127.0.0.1:8080")
    sys.stdout.flush()
    httpd.serve_forever()

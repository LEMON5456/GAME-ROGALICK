import http.server
import os
os.chdir(os.path.dirname(__file__) or '.')
httpd = http.server.HTTPServer(('127.0.0.1', 8080), http.server.SimpleHTTPRequestHandler)
httpd.serve_forever()

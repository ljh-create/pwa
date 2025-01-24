import http.server
import socketserver
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extensions_map.update({
            '.js': 'application/javascript',
            '.webmanifest': 'application/manifest+json',
            '.html': 'text/html',
            '.png': 'image/png'
        })

    def do_GET(self):
        # URL 디코딩
        path = self.path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        
        # 디렉토리 요청 처리
        if path.endswith('/'):
            base_path = self.translate_path(path.rstrip('/'))
            if os.path.isdir(base_path):
                index_path = os.path.join(base_path, 'index.html')
                if os.path.exists(index_path):
                    with open(index_path, 'rb') as f:
                        self.send_response(200)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        self.wfile.write(f.read())
                    return
        
        return super().do_GET()

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print(f'Serving at port {PORT}')
    httpd.serve_forever()

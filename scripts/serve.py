#!/usr/bin/env python3
"""Serve the built Krillion game on loopback using only Python's standard library."""

import argparse
import functools
import json
from pathlib import Path
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import ProxyHandler, Request, build_opener
import webbrowser

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "dist-local"
APP_ID = "krillion-local"
HEALTH_PATH = "/__krillion_health"


def existing_server(url):
    """Only reuse a server for this application and this checkout."""
    opener = build_opener(ProxyHandler({}))
    try:
        request = Request(url + HEALTH_PATH, headers={"Accept": "application/json"})
        with opener.open(request, timeout=1) as response:
            health = json.loads(response.read(4096))
            return health.get("app") == APP_ID and health.get("root") == str(ROOT)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, AttributeError):
        return False


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Rebuilding in the same folder must not leave stale HTML or game data.
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def health(self, include_body=True):
        payload = json.dumps({"app": APP_ID, "root": str(ROOT), "version": 1}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if include_body:
            self.wfile.write(payload)

    def do_GET(self):
        if urlsplit(self.path).path == HEALTH_PATH:
            self.health()
        else:
            super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path == HEALTH_PATH:
            self.health(include_body=False)
        else:
            super().do_HEAD()

    def log_message(self, format, *args):
        # Successful static requests are routine; keep Terminal readable.
        if args and str(args[1] if len(args) > 1 else "").startswith(("4", "5")):
            super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--no-open", action="store_true", help="Do not open a browser tab.")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("port must be between 1 and 65535")
    if not (BUILD / "index.html").is_file():
        print("Krillion needs a local build first. From the project folder, run:\n\n  npm install\n  npm run build:local\n\nThen open Start Krillion.command again.", file=sys.stderr)
        return 1
    url = f"http://127.0.0.1:{args.port}"
    if existing_server(url):
        print(f"Krillion is already running at {url}", flush=True)
        if not args.no_open:
            webbrowser.open(url)
        return 0
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), functools.partial(Handler, directory=str(BUILD)))
    except OSError as error:
        print(f"Could not start Krillion at {url}: {error}\nAnother program may be using this port. Close it and try again.", file=sys.stderr)
        return 1
    print(f"Krillion is running at {url}\nKeep this window open while playing. Press Control-C to stop.", flush=True)
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        print("\nKrillion stopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

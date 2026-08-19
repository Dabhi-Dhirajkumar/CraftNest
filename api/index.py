# d:\CRAFTNEST\api\index.py
import os
import sys
from django.core.wsgi import get_wsgi_application

# Ensure the project’s root is on PYTHONPATH so Django can be imported
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Point to your Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "craftnest.settings")

# Create the WSGI application that Vercel will invoke
application = get_wsgi_application()


def handler(request, context):
    """
    Vercel entry point.
    The `request` object mimics the AWS Lambda event format.
    We simply forward the request to Django’s WSGI app and return the result.
    """
    from wsgiref.util import setup_testing_defaults
    from io import BytesIO

    # Build a minimal WSGI environ from the Vercel request
    environ = {
        "REQUEST_METHOD": request.get("method", "GET"),
        "PATH_INFO": request.get("path", "/"),
        "QUERY_STRING": request.get("queryString", ""),
        "SERVER_NAME": request.get("host", "localhost"),
        "SERVER_PORT": str(request.get("port", 80)),
        "wsgi.input": BytesIO(request.get("body", b"")),
        "wsgi.version": (1, 0),
        "wsgi.errors": sys.stderr,
        "wsgi.multithread": False,
        "wsgi.multiprocess": False,
        "wsgi.run_once": False,
    }
    setup_testing_defaults(environ)

    # Capture the response from the WSGI app
    status = []
    headers = []

    def start_response(s, h, exc_info=None):
        status.append(s)
        headers.extend(h)

    result = application(environ, start_response)

    # Convert the iterable result into a proper byte body
    body = b"".join(result)

    # Build the response in the shape Vercel expects
    return {
        "statusCode": int(status[0].split()[0]),
        "headers": {k: v for k, v in headers},
        "body": body.decode("utf-8"),
        "isBase64Encoded": False,
    }

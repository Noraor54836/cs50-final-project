from flask import Flask, request, jsonify, make_response, session
from functools import wraps


def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        print("Session data:", dict(session))
        print("check login session:", session)

        if session.get("user_id") is None:
            return jsonify({"error": "Unauthorized", "authenticated": False}), 401
        return func(*args, **kwargs)

    return decorated_function

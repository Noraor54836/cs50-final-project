from flask import Flask, request, jsonify, make_response, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool


from authen import login_required

# for hashing passwords
import hashlib
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = False  # Disable Secure for localhost
app.config["SESSION_PERMANENT"] = "false"
app.config["SESSION_TYPE"] = "filesystem"

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

Session(app)

# db connection
host = "localhost"
user = "root"
password = ""
db = "cs50"


dbconfig = {"host": host, "user": user, "password": password, "database": db}
connection_pool = MySQLConnectionPool(pool_name="mypool", pool_size=5, **dbconfig)


def get_db_connection():
    return connection_pool.get_connection()


@app.route("/checklogin", methods=["GET"])
@login_required
def checklogin():
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (session["user_id"],))
        user = cursor.fetchone()
        return jsonify({"authenticated": True, "user_id": session["user_id"]}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    salt = os.urandom(32)
    hash_object = hashlib.sha256()
    hash_object.update(salt + password.encode())
    hashed_password = hash_object.digest()

    connection = get_db_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user:
            return jsonify({"error": "Username already exists"}), 401

        cursor.execute(
            "INSERT INTO users (username, password_hash, salt) VALUES (%s, %s, %s)",
            (username, hashed_password, salt),
        )
        connection.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        salt = user["salt"]
        hash_object = hashlib.sha256()
        hash_object.update(salt + password.encode())
        hashed_password = hash_object.digest()

        if hashed_password != user["password_hash"]:
            return jsonify({"error": "Invalid username or password"}), 401

        session["user_id"] = user["id"]
        return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)

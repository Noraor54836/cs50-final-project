from flask import Flask, request, jsonify, make_response, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool

import requests

from datetime import timedelta, datetime

from authen import login_required

# for hashing passwords
import hashlib
import os

app = Flask(__name__)
app.secret_key = "your-super-secret-key"

app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  # Set to True in production
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_TYPE="filesystem",
    SESSION_FILE_DIR="flask_session",
)

Session(app)

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])


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

        session.clear()
        session.permanent = True
        session["user_id"] = user["id"]
        print("login", session["user_id"], session, username)
        return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    try:
        session.clear()
        return jsonify({"message": "Logout successful"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 400


@app.route("/getuserdata", methods=["POST"])
def get_user_main():
    data = request.get_json()
    user_id = data.get("userid")
    user_id = int(user_id) if user_id else None

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    if user_id != session["user_id"]:
        return jsonify({"error": "Unauthorized"}), 401

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM account WHERE user_id = %s", (user_id,))
        user_data = cursor.fetchone()

        if not user_data:
            return jsonify({"error": "User not found"}), 404

        print(user_data, "userdata")
        return jsonify({"data": user_data}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/setgoal", methods=["POST"])
def update_goaldata():
    data = request.get_json()
    user_id = data.get("userid")
    data_main = data.get("data")
    goal = data_main.get("goal")
    start_date = data_main.get("start_date")
    end_date = data_main.get("end_date")

    user_id = int(user_id) if user_id else None

    if user_id != session["user_id"]:
        return jsonify({"error": "Unauthorized"}), 401

    if not all([user_id, goal, start_date, end_date]):
        return jsonify({"error": "required missing fields"}), 401

    connection = get_db_connection()

    start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
    end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO account (goal, start_date, end_date, user_id) VALUES (%s, %s, %s, %s)"
            "ON DUPLICATE KEY UPDATE goal = VALUES(goal), start_date = VALUES(start_date), end_date = VALUES(end_date)",
            (goal, start_dt, end_dt, user_id),
        )
        connection.commit()

        return jsonify({"message": "Goal set successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/setname", methods=["POST"])
def update_namedata():
    data = request.get_json()
    user_id = data.get("userid")
    name = data.get("name")
    skill = data.get("skill")

    user_id = int(user_id) if user_id else None

    if user_id != session["user_id"]:
        return jsonify({"error": "Unauthorized"}), 401

    if not all([user_id, name, skill]):
        return jsonify({"error": "required missing fields"}), 401

    connection = get_db_connection()

    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO account (name, skill, user_id) VALUES (%s, %s, %s)"
            "ON DUPLICATE KEY UPDATE name = VALUES(name), skill = VALUES(skill)",
            (name, skill, user_id),
        )
        connection.commit()

        return jsonify({"message": "Name set successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/randomquote", methods=["GET"])
def random_quote():
    try:
        res = requests.get("https://zenquotes.io/api/random")
        res.raise_for_status()
        print(res.json())
        return jsonify(res.json()), 200

    except requests.RequestException as e:
        print(e)
        return jsonify({"error": "Failed to fetch quote"}), 500


@app.route("/gethistory", methods=["POST"])
def get_history():
    data = request.get_json()
    user_id = data.get("userid")

    user_id = int(user_id) if user_id else None

    if user_id != session["user_id"]:
        return jsonify({"error": "Unauthorized"}), 401

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT checkin, checkout, timespend FROM history WHERE user_id = %s",
            (user_id,),
        )
        history = cursor.fetchall()

        return jsonify({"data": history}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route("/recordtime", methods=["POST"])
def record_time():
    data = request.get_json()
    user_id = data.get("userid")
    checkin = data.get("checkin")
    checkout = data.get("checkout")
    status = data.get("status")

    user_id = int(user_id) if user_id else None

    if user_id != session["user_id"]:
        return jsonify({"error": "Unauthorized"}), 401

    if not all([user_id, status, checkin]):
        return jsonify({"error": "required missing fields"}), 401

    connection = get_db_connection()

    if status == True and checkout == None:
        checkin = datetime.fromisoformat(checkin.replace("Z", "+00:00"))

        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO history (checkin, chekout, user_id) VALUES (%s, %s, %s)",
                (checkin, None, user_id),
            )
            history_id = cursor.lastrowid
            connection.commit()
            session["history_id"] = history_id
            return jsonify({"message": "Time recorded successfully"}), 201
        except mysql.connector.Error as err:
            return jsonify({"error": str(err)}), 400
        finally:
            cursor.close()
            connection.close()
    elif status == False and checkout != None:
        checkin = datetime.fromisoformat(checkin.replace("Z", "+00:00"))
        checkout = datetime.fromisoformat(checkout.replace("Z", "+00:00"))

        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE history SET checkout = %s WHERE history_id = %s",
                (checkout, session["history_id"]),
            )
            connection.commit()

            session.pop("history_id", None)
            return jsonify({"message": "Time recorded successfully"}), 201
        except mysql.connector.Error as err:
            return jsonify({"error": str(err)}), 400
        finally:
            cursor.close()
            connection.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5001)

from flask import Flask, request, jsonify, make_response, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector

from authen import login_required

# for hashing passwords
import hashlib
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # Disable Secure for localhost
app.config['SESSION_PERMANENT'] = 'false'
app.config['SESSION_TYPE'] = 'filesystem' 

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

Session(app)

#db connection
host = 'localhost'
user = 'root'
password = ''
db = 'cs50'

def get_db_connection():
    connection = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=db
    )
    return connection

@app.route('/checklogin', methods=['GET'])
@login_required
def checklogin():
    return jsonify({'authenticated': True, 'user_id': session['user_id']})


@app.route('/login', methods=['POST'])
def login():

    session.clear()

   




if __name__ == '__main__':
    app.run(debug=True, port=5000)








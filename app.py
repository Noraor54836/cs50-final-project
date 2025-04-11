import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

from datetime import datetime
from zoneinfo import ZoneInfo
import json

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

db.execute("CREATE TABLE IF NOT EXISTS history ("
"id INTEGER PRIMARY KEY AUTOINCREMENT,"
"user_id INTEGER NOT NULL,"
"symbol TEXT NOT NULL,"
"types TEXT NOT NULL,"
"shares INTEGER NOT NULL,"
"price REAL NOT NULL,"
"total REAL NOT NULL,"
"transacted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
"FOREIGN KEY (user_id) REFERENCES users(id)"
")")

db.execute("CREATE TABLE IF NOT EXISTS currentstock ("
"id INTEGER PRIMARY KEY AUTOINCREMENT,"
"user_id INTEGER NOT NULL,"
"symbol TEXT NOT NULL,"
"amount INTEGER NOT NULL,"
"FOREIGN KEY (user_id) REFERENCES users(id)"
")")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
@login_required
def index():
    #Show portfolio of stock
    user_id = session.get("user_id")

    if not user_id:
        return redirect("/register")

    user_port = db.execute("SELECT users.username, users.cash, currentstock.symbol, currentstock.amount "
     "FROM users "
     "INNER JOIN currentstock ON currentstock.user_id = users.id "
     "WHERE users.id = ?", user_id)

    # if user doesnt have currentstock.user_id
    if not user_port:
        user = db.execute("SELECT * FROM users WHERE users.id = ?", user_id)
        username = user[0]["username"]
        cash = user[0]["cash"]
    # if user have currentstock.user_id
    else:
        username = user_port[0]["username"]
        cash = user_port[0]["cash"]

    stock_array = []
    balance = 0

    for stock in user_port:
        price_now = lookup(stock['symbol'])
        price_now = price_now['price']
        stock_price = {
            'symbol': stock['symbol'],
            'amount': stock['amount'],
            'price': price_now,
            'total': round(stock['amount'] * price_now, 2)
        }
        balance += stock_price['total']
        balance = round(balance, 2)
        stock_array.append(stock_price)

    return render_template("index.html",
                           stock = stock_array, username = username, total = usd(round(balance + cash, 2)), cash = usd(cash))


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    #Buy shares of stock
    user_id = session.get("user_id")
    user = db.execute("SELECT * FROM users WHERE id = ?", user_id)[0]

 #if request method = get
    if request.method == "GET":
     # Handle JS redirect request
        if request.args.get("js_request") == "true":
            # Get data from query parameters
            amount = request.args.get("amount")
            stock = {
                "symbol": request.args.get("stock_symbol"),
                "price": request.args.get("stock_price"),
                "name": request.args.get("stock_name")
            }

            try:
                amount = int(amount)
                price = float(stock["price"])
            except (ValueError, TypeError):
                return apology("Invalid amount or stock data", 403)

            if not amount or amount < 1:
                return apology("cant buy negative or none", 403)

            total = amount * price
            total = round(total, 2)
            new_balance = user['cash'] - total
            new_balance = round(new_balance, 2)

            if new_balance < 0:
                return apology("not enough money", 403)

            #check if have stock in user port
            stock_total = db.execute("SELECT * FROM currentstock WHERE user_id = ? AND symbol = ?", user["id"], stock["symbol"])

            if len(stock_total) == 0:
                db.execute("INSERT INTO currentstock (user_id, symbol, amount) VALUES (?, ?, ?)",
                            user["id"], stock["symbol"], amount)
            elif len(stock_total) == 1:
                stock_total = stock_total[0]
                new_stock_total = stock_total["amount"] + amount
                db.execute("UPDATE currentstock SET amount = ? WHERE user_id = ? AND symbol = ?",
                            new_stock_total, user["id"], stock["symbol"])
            #save history
            db.execute("INSERT INTO history (user_id, symbol, types, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)",
                        user["id"], stock["symbol"], "buy", amount, stock['price'], total)
            #set new cash
            db.execute(
                "UPDATE users SET cash = ? WHERE id = ?", new_balance, user["id"])

            #flash message
            flash(f"Buy {stock["symbol"]} amount {amount} total {usd(total)}")

            return redirect("/")
        else:
            return render_template("buy.html")
    # if req = post
    elif request.method == "POST":
        #handle form req
        symbol = request.form.get("symbol")
        if symbol:
            data = lookup(symbol)

            if data:
                return render_template("buy.html", data = data, money = usd(user['cash']))
            else:
                return apology("symbol not match", 403)

        return apology("must provide symbol", 403)


# get user location timezone
@app.route("/set_timezone", methods=["POST"])
@login_required
def settimezone():
    data = request.get_json()
    timezone = data.get("timezone")

    print("data from javascript", timezone)

    if timezone:
        session["timezone"] = timezone

        return "", 204

    return apology("Missing time zone", 403)

#convert format to utc format and chane it to user local time
def utc_convert(date):
    local_session = session.get("timezone")

    print("date1", date)
    date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")
    print("date2", date)
    utc = date.replace(tzinfo=ZoneInfo("UTC"))
    local = utc.astimezone(ZoneInfo(local_session))
    print("utc", utc, "local", local)

    return local.strftime("%Y-%m-%d %H:%M:%S")


@app.route("/history", methods=["GET", "POST"])
@login_required
def history():
    """Show history of transactions"""
    user_id = session.get("user_id")

    # select buy or sell types
    if request.method == "POST":
        type = request.form.get("types")

        if type != "buy" and type != "sell" and type != "all":
            return apology("cant defind types")

        if type == "all":
            return redirect("/history")

        data = db.execute("SELECT * FROM history WHERE user_id = ? AND types = ?", user_id, type)

        data_array = []

        for row in data:
            utc_date = utc_convert(row["transacted"])
            print("utc_date to local", utc_date)

            data_array.append ({
                    "symbol": row["symbol"],
                    "types": row["types"],
                    "shares": row["shares"],
                    "price": row["price"],
                    "total": row["total"],
                    "transacted": utc_date
            })

        return render_template("history.html", data = data_array, type = type)

    else:
        data = db.execute("SELECT * FROM history WHERE user_id = ?", user_id)
        data_array = []

        for row in data:
            utc_date = utc_convert(row["transacted"])
            print("utc_date to local", utc_date)

            data_array.append ({
                    "symbol": row["symbol"],
                    "types": row["types"],
                    "shares": row["shares"],
                    "price": row["price"],
                    "total": row["total"],
                    "transacted": utc_date
            })

        return render_template("history.html", data = data_array)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote."""
    if request.method == "POST":
        if not request.form.get("symbol"):
            return apology("must provide symbol", 403)
        data = lookup(request.form.get("symbol"))
        print(data)

        if data:
            return render_template("quote.html", data = data)
        else:
            return apology("symbol not match", 403)
    else:
        return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        if not request.form.get("username"):
            return apology("must provide username", 403)
        elif not request.form.get("password"):
            return apology("must provide password", 403)
        elif not request.form.get("confirm-password"):
            return apology("must provide confirm password", 403)

        if request.form.get("password") != request.form.get("confirm-password"):
            return apology("password and confirm password not match", 403)

        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        if len(rows) == 0:
            hash = generate_password_hash(request.form.get("password"))
            db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", request.form.get("username"), hash)

            return redirect("/login")
        else:
            return apology("This username already taken", 403)
    else :
        return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    user_id = session.get("user_id")
    user_data = db.execute("SELECT * FROM users WHERE id = ?", user_id)
    cash = user_data[0]["cash"]
    user_stock = db.execute("SELECT symbol, amount FROM currentstock WHERE user_id = ?", user_id)

    stock_array = []
    for stock in user_stock:
        price_now = lookup(stock["symbol"])
        price_now = price_now['price']

        stock_now = {
            "symbol": stock["symbol"],
            "amount": stock["amount"],
            "price": price_now
        }
        stock_array.append(stock_now)

    if request.method == "POST":
        # check what form send select symbol or sell
        if request.form.get("symbol"):
            selected = request.form.get("symbol")

            if selected == "select":
                return render_template("sell.html", stock = stock_array, cash = usd(cash))
            else :
                for data in stock_array:
                    if selected == data["symbol"]:
                        array = []
                        array.append(data)
                        return render_template("sell.html", stock = array, cash = usd(cash), select = True)

        if not request.form.get("sell_data"):
            return apology("please insert input")

        sell_data = json.loads(request.form.get("sell_data"))

        # see what stock user want to sell
        for data in sell_data:
            print(data, sell_data, data['symbol'])
            user_amout = db.execute("SELECT amount FROM currentstock WHERE user_id = ? AND symbol = ?", user_id, data['symbol'])
            user_amout = user_amout[0]["amount"]
            print(data, sell_data, user_amout)

            if (data["input"] <= 0 or not data["input"]):
                return apology("Input cant be negative or none")

            if (data["input"] > int(user_amout)):
                return apology(f'not enough shares {data["symbol"]}')

            if (data["input"] <= int(user_amout)):
                total = round(data["price"] * data["input"], 2)
                cash = db.execute("SELECT cash FROM users WHERE id = ?", user_id)
                cash = cash[0]["cash"]
                print(f"{cash}, {total}, {data['symbol']}, ---------- ")
                db.execute("UPDATE users SET cash = ? WHERE id = ?", round(cash + total, 2), user_id)

                if (int(user_amout) == data["input"]):
                    db.execute("DELETE from currentstock WHERE user_id = ? AND symbol = ?", user_id, data["symbol"])
                else:
                    new_amount = int(user_amout) - data["input"]
                    db.execute("UPDATE currentstock SET amount = ? WHERE user_id = ? AND symbol = ?",new_amount, user_id, data["symbol"])

                db.execute("INSERT INTO history (user_id, symbol, types, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)",
                           user_id, data["symbol"], "sell", data["input"], data["price"], total)
                #flash message
                flash(f"Sell {data["symbol"]} amount {data["input"]} total {usd(total)}")

        return redirect("/")

    else:
        return render_template("sell.html", stock = stock_array, cash = usd(cash))


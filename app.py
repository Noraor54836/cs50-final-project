import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")



@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""
    user_id = session["user_id"]
    stocks = db.execute("SELECT symbol, SUM(shares) as totshares, name FROM portfolio WHERE user_id = ? GROUP BY symbol", user_id)
    cash = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]

    total = cash
    print(cash)
    for stock in stocks:
        items = lookup(stock["symbol"])
        stock["price"] = items["price"]
        total += stock["totshares"] * stock["price"]
        print(total)
    return render_template("index.html", stocks=stocks, cash=cash, total=total, usd=usd)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        symbol = request.form.get("symbol").upper()

        # Ensure stock symbol was submitted and valid
        if not symbol:
            return apology("must provide symbol")
        stock = lookup(symbol)
        if not stock:
            return apology("Please enter a valid stock symbol")

        try:
            shares = int(request.form.get("shares"))
        except:
            return apology("enter a valid number of shares")
        if shares <= 0:
            return apology("enter a valid number of shares")
        print(shares)

        user_id = session["user_id"]
        cash = db.execute("SELECT cash FROM users WHERE id=?", user_id)[0]["cash"]

        stock_name = stock["name"]
        stock_price = stock["price"]
        total_price = stock_price * shares

        if cash < total_price:
            return apology("More fund required")
        else:
            db.execute("UPDATE users SET cash = ? WHERE id = ?", cash - total_price, user_id)
            db.execute("INSERT INTO portfolio (user_id, symbol, shares, price, name, type) VALUES (?, ?, ?, ?, ?, ?)",
                       user_id, symbol, shares, stock_price, stock_name, 'buy')

        return redirect("/")

    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    user_id = session["user_id"]
    transactions = db.execute("SELECT symbol, shares, price, name, type, time FROM portfolio WHERE user_id = ?", user_id)
    return render_template("history.html", transactions=transactions, usd=usd)


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
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
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
    if request.method == 'POST':
        symbol = request.form.get('symbol')

        if not symbol:
            return apology("must provide symbol")

        stock = lookup(symbol)

        if not stock:
            return apology('invalid stock symbol')

        print(stock)

        dollar = usd(stock["price"])

        return render_template('quoted.html', stock=stock, dollar=dollar)

    else:
        return render_template('quote.html')


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == 'POST':
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        # Ensure username was submitted
        if not username:
            return apology("must provide username")

        rows = db.execute("SELECT * FROM users WHERE username = ?", username)

        # Ensure username doesn't exists
        if len(rows) == 1:
            return apology("username already exists")

        # Ensure password was submitted
        elif not password:
            return apology("must provide password")

        # Ensure conformation was submitted
        elif not confirmation:
            return apology("must cofirm password")

        # Ensure conformation matches password
        if confirmation != password:
            return apology("confirmation must match passowrd")

        # Otherwise register
        else:
            hash = generate_password_hash(password)
            # Query database for username
            db.execute("INSERT INTO users (username, hash) VALUES (?,?)", username, hash)

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    user_id = session["user_id"]
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        try:
            shares = int(shares)
        except:
            return apology("Please enter number of shares to sell")

        if shares <= 0:
            return apology

        try:
            stock_price = lookup(symbol)["price"]
            stock_name = lookup(symbol)["name"]
            sales_income = stock_price * shares
        except:
            return apology("Please select symbol")

        share_owned = db.execute(
            "SELECT SUM(shares) as sum_shares FROM portfolio WHERE user_id = ? AND symbol = ? GROUP BY symbol", user_id, symbol)[0]['sum_shares']

        if share_owned < shares:
            return apology("Not enough shares to sell")

        cash_balance = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]
        db.execute("UPDATE users SET cash = ? WHERE id = ?", cash_balance + sales_income, user_id)
        db.execute("INSERT INTO portfolio  (user_id, symbol, shares, price, name, type) VALUES (?, ?, ?, ?, ?, ?)",
                   user_id, symbol, -shares, stock_price, stock_name, 'sell')

        return redirect("/")

    else:
        symbols = db.execute("SELECT symbol FROM portfolio WHERE user_id = ? GROUP BY symbol", user_id)
        print(symbols)
        return render_template("sell.html", symbols=symbols)


def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

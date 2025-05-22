# Productivity Web App with React, Flask, and MySQL

#### Video Demo:

    [Watch Video](https://youtu.be/SHaJFgqqUHU)

#### Description:

This is a full-stack productivity web application developed as part of my CS50 final project. The project integrates **React** for the frontend, **Flask** for the backend, and **MySQL** for persistent data storage. The platform is designed to help users enhance their productivity through structured goal tracking, time management, and personal reflection.

Users can register securely, set and monitor their goals, record the time they spend working, and visualize their productivity over time. A motivational quote feature adds inspiration to the platform, while session-based login ensures security and continuity.

---

## 🔐 1. User Authentication

User authentication is a core feature of the platform. It ensures that users’ data is private and personalized.

- Users can **register and log in** using a secure form.
- Passwords are hashed using Python's `hashlib` with a **random salt** to prevent brute-force or rainbow table attacks.
- Flask’s session management is used to store the user's ID once authenticated, so that subsequent API requests can be scoped to that user.
- Session persists across pages, maintaining the login state.

---

## 🎯 2. Goal Setting

This feature allows users to define clear, time-bound objectives:

- Users can add a **goal name**, a **start date**, and an **end date**.
- Goals are stored in MySQL and loaded every time the user logs in.
- The **Home page** provides a quick glance at the current goal.
- The **Account page** shows goal progress in a **pie chart** visual, helping users stay motivated.
- If the user doesn’t set a goal, a default message is displayed.

---

## 👤 3. User Profile

Users can personalize their account by adding their name and listing the skills they are working on.

- This information is displayed on the **Account page**.
- Users can update this data at any time.
- Changes are saved to the database and reflected immediately upon the next login.

This personalization gives the app a human touch and helps users reflect on their skill development.

---

## 💬 4. Motivational Quotes

To keep users inspired, the app includes a **random quote generator** powered by the ZenQuotes API.

- A random quote is fetched and displayed on the **Home page**.
- Users can get a new quote simply by hovering out and back in on the quote section.
- This small but effective feature adds daily inspiration and variety.

---

## ⏱️ 5. Progress Timer

One of the standout features of this app is the **work session timer**.

- Users can start and stop a timer manually from the Home page.
- The timer state is stored in the session so it **persists through page refreshes**.
- When the timer is stopped, the duration is stored in the MySQL database as a **work session log**.
- This feature helps users build a habit of focused work and track how much time they’ve committed to their goals.

---

## 📈 6. Time Tracking Visualization

To help users analyze their progress:

- The Account page includes a **line chart** that visualizes time spent per day.
- The chart data is grouped by month and pulled directly from the database.
- Users can **select a month** from a dropdown to filter the data.
- This feature makes it easy for users to reflect on their work patterns and improve over time.

---

## 📂 File Structure & Components

The project is separated cleanly into frontend and backend folders.

### Frontend (React)

- `App.js`, `index.js`: Entry point and main routes.
- `components/`: Includes modular components like `Navbar`, `GoalForm`, `Timer`, and charts.
- `pages/`: Contains `Home.js`, `Account.js`, `Login.js`, and `Register.js`.
- `context/`: Auth and Goal contexts for global state management.
- `services/`: API helper functions.

### Backend (Flask)

- `app.py`: Main Flask app with routing and session config.
- `routes/`: API endpoints for authentication, goals, timer, and profile.
- `db.py`: Connection pool to MySQL.
- `utils.py`: Password hashing and utility functions.

---

## 💡 Design Considerations

Throughout development, I made design decisions that prioritized:

- **User Experience:** The UI is clean, responsive, and mobile-friendly.
- **Security:** Passwords are hashed with salt; sessions prevent unauthorized access.
- **Data Persistence:** MySQL stores all user-specific data.
- **Code Modularity:** Components are split logically and follow best practices.

---

```markdown
## Tech Stack

- **Frontend:** React, CSS, Chart.js
- **Backend:** Flask, Flask-CORS, Flask-Session
- **Database:** MySQL
- **Authentication:** Session-based, secure with password hashing
- **API:** Zenquotes.io
```

## Author

**Sasit Sinprasong**  
Undergraduate Student in Bangkok, Thailand  
GITHUB: [Noraor54836] Sasit Sinprasong
EDX: [aornor] Sasit Sinprasong
📧 sasitsinprasong@gmail.com

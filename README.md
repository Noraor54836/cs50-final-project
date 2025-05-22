# Productivity Web App with React, Flask, and MySQL

## VIDEO URL:

    [Watch Video](https://youtu.be/SHaJFgqqUHU)

## Description

This is a full-stack productivity web application built with React (frontend), Flask (backend), and MySQL (database).  
The platform allows users to track their goals, time spent, and personal skills to improve focus and time management.

## Features

1. **User Authentication**

   - Secure user registration and login system.
   - Passwords are hashed using Python's `hashlib` with salt.
   - Session-based authentication using Flask.

2. **Goal Setting**

   - Users can create goals with a start and end date.
   - Goals are displayed on both Home and Account pages.
   - Progress is visualized with a dynamic pie chart.

3. **User Profile**

   - Users can set their name and list their skills.
   - Profile data is stored in MySQL and synced on login.

4. **Motivational Quotes**

   - Get a random quote from the Zenquotes API.
   - Quotes refresh on mouse hover-out and hover-in.

5. **Progress Timer**

   - Start/stop a work session timer directly on the Home page.
   - Timer state is preserved across page refreshes using session data.
   - Timer logs are stored in MySQL.

6. **Time Tracking Visualization**
   - Line chart displays time spent working, grouped by month.
   - Dropdown allows users to filter by specific month.
   - Time data is retrieved from the database and updated in real-time.

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

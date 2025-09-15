# Ratify App 
# live Demo: https://store-ratingapp-zrt5.vercel.app/

A modern web application for managing and collecting store ratings with separate interfaces for users, store owners, and administrators.

---
# Default User Credentials(Testing-for login) : 
| Role        | Email                                     | Password  |
| ----------- | ----------------------------------------- | --------- |
| Admin       | [admin@gmail.com](mailto:admin@gmail.com) | Pass\@123 |
| User        | [user@gmail.com](mailto:user@gmail.com)   | Pass\@123 |
| Store Owner | [test@gmail.com](mailto:test@gmail.com)   | Pass\@123 |

## 🌟 Features

### For Users
- Create an account and log in securely
- Browse stores and view their ratings
- Submit ratings and feedback for stores
- View your rating history as 'Your submitted Rating '
- Update Password and Log out
- Search by name and store name 

### For Store Owners
- Manage store profiles
- View ratings and feedback for their stores
- Responsive dashboard with rating
- Search by name and store name 
-  Update Password and Log out

### For Administrators
- Comprehensive admin dashboard
- Manage users, stores, and ratings
- AUthority to add User, Stores, Store Owner,Even Admin
- Monitor system activity

 
---
# Dashboard UI 
<img width="600" height="800" alt="image" src="https://github.com/user-attachments/assets/310ed95e-50ad-4fbd-a98a-253e641a25ea" />
<img width="600" height="800" alt="image" src="https://github.com/user-attachments/assets/ed7d78f8-5c12-4185-b270-d68a36978471" />
<img width="600" height="800" alt="image" src="https://github.com/user-attachments/assets/60b42509-2bc3-41b1-967f-35cd9652835c" />
<img width="600" height="800" alt="image" src="https://github.com/user-attachments/assets/8479f967-299c-4a00-86ad-40a71baa6f13" />
<img width="600" height="800" alt="image" src="https://github.com/user-attachments/assets/8469e1c6-11cc-48e5-81d5-9cc7eb58e9e8" />


## 🚀 Technologies Used

### Frontend
- **React.js with Vite**: Fast development environment for modern single-page apps.
- **CSS**: For clean, responsive, and aesthetically pleasing design.
- **Dynamic UI components**: Interactive and reusable components.
- **Interactive dashboards**: Real-time data visualization.

### Backend
- **Node.js**: Scalable server-side JavaScript runtime.
- **Express.js**: Minimalist web framework for Node.js.
- **SQL Database (MySQL/PostgreSQL)**: Relational database for structured data.
- **JWT (JSON Web Tokens)**: Secure authentication and authorization.

## 💻 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- SQL database server (MySQL)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Ashana2004/ratingapp.git
cd ratingapp
````

2. **Install backend dependencies**

```bash
cd backend
npm install
npm install express
npm install cors
npm install bcryptjs
npm install jsonwebtoken
npm install mysql
npm install dotenv
npm install react-icons
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
npm install vite
npm install react-router-dom
npm install react-icons

```

4. **Set up environment variables**

* Create `.env` files in both `backend` and `frontend` directories.

---

## 🔧 Configuration

### Backend `example.env`

```bash
PORT=5000
DB_URI=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
()
```

### Frontend `example.env`

```bash
VITE_API_URL=http://localhost:5000
```

---

## ⚙️ Database Setup

1. Ensure a SQL database server is running.
2. Execute the commands in `schema.sql` to create tables and relationships:

```bash
mysql -u [your_username] -p [your_database_name] < path/to/schema.sql
```

*Replace `[your_username]`, `[your_database_name]`, and `path/to/schema.sql` with your details.*

---

## 🚀 Running the Application

### Local Development

1. Start backend server:

```bash
cd backend
npm run dev
```

2. Start frontend server:

```bash
cd frontend
npm run dev
```

3. Open `http://localhost:5173` in your browser.
```
# 📱 Usage

- Open your browser and navigate to http://localhost:5173

- Register a new account or log in

- Navigate through the interface based on your role:

- Users can browse and rate stores

- Store owners can manage their stores and view ratings

- Admins can access the admin dashboard

# 🎨 Features and UI Components

- Modern, responsive design

- Role-based access control

- Interactive dashboards

- Real-time updates

- Animated transitions

- Mobile-friendly interface

# 🔐 Security Features

- JWT-based authentication

- Protected API routes

- Input validation

- Secure password handling

- Role-based authorization






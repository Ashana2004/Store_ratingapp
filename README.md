# Rating App

A modern web application for managing and collecting store ratings with separate interfaces for users, store owners, and administrators.

---

## 🌟 Features

### For Users
- Create an account and log in securely
- Browse stores and view their ratings
- Submit ratings and feedback for stores
- View your rating history

### For Store Owners
- Manage store profiles
- View ratings and feedback for their stores
- Track store performance metrics
- Responsive dashboard with rating 

### For Administrators
- Comprehensive admin dashboard
- Manage users, stores, and ratings
- Monitor system activity
- Generate reports and analytics

---

## 🚀 Technologies Used

### Frontend
- React.js with Vite
- Modern CSS with responsive design
- Dynamic UI components
- Interactive dashboards

### Backend
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication

---

## 💻 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/Ashana2004/ratingapp.git
cd ratingapp
```
2.Install backend dependencies:
```bash
cd backend
npm install
```
3.Install frontend dependencies:
```bash
cd ../frontend
npm install
```
4.Set up environment variables:

Create .env files in both backend and frontend directories with necessary configurations.

Start the development servers:
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```
🔧 Configuration
Backend Configuration

Create a .env file in the backend directory with the following variables:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Frontend Configuration
```bash
Create a .env file in the frontend directory:

VITE_API_URL=http://localhost:5000
```
# 📱 Usage

- Open your browser and navigate to http://localhost:5173

- Register a new account or log in

- Select your role (User, Store Owner, or Admin)

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



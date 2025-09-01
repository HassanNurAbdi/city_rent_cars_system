# City Rental Car Management System

A comprehensive car rental management system built with Node.js, Express.js, MongoDB, and React.js.

## 🛠 Technologies

- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **Frontend**: React.js + Tailwind CSS
- **Authentication**: JWT (Admin & Guest roles)
- **File Uploads**: Multer for images & documents

## 📁 Project Structure

```
city-rental-car-system/
├── backend/                # Node.js Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
└── frontend/              # React Frontend
    ├── public/
    ├── src/
    │   ├── components/    # React components
    │   ├── context/       # React context (Auth)
    │   ├── utils/         # Utility functions
    │   └── App.js
    ├── package.json       # Frontend dependencies
    └── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd city-rental-car-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   # MONGODB_URI=mongodb://localhost:27017/city-rental-car
   # JWT_SECRET=your_jwt_secret_key_here
   # NODE_ENV=development
   # PORT=5000
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👤 User Types

### Admin
- Manage cars (register, update, delete)
- Manage users (create, update, status)
- Manage bookings
- Generate reports (daily, weekly, monthly, yearly)
- Car repair management

### Guest/User
- Search available cars
- Make booking
- View booking history
- Upload required documents (PDF/DOC)

## 🎨 Features & Pages

### 1. Splash Screen
- Display company name and logo
- Auto-redirect to Login Page

### 2. Login Page
- Username/Email and Password authentication
- JWT token-based authentication
- Role-based access control

### 3. Dashboard (Admin Only)
- Total Cars statistics
- Booking statistics (Pending/Approved/Canceled)
- Active Users count
- Car Repairs in progress

### 4. Car Management (Admin Only)
- Register new cars
- View all cars with filters
- Update car information
- Delete cars
- Car status management (Available/Rented/In Repair)

### 5. User Management (Admin Only)
- Create new users
- View all users
- Update user information
- Activate/Deactivate users
- Role management

### 6. Car Booking
- Select available cars
- Fill rental information
- Guarantor details
- Payment processing
- Document upload support

### 7. Booking History
- View all bookings
- Filter by status, date, customer
- Admin can approve/cancel bookings
- Status tracking

### 8. Car Repair Management (Admin Only)
- Add repair requests
- Track repair status
- Cost management
- Repair history

### 9. Reports (Admin Only)
- Daily reports
- Weekly reports
- Monthly reports
- Yearly reports
- Individual car reports

## 🏢 Company Information

**DURDUR CAR RENTAL**
- Address: Dhabarka dambe ee Maqaayada Fatxi, KM4, Muqdisho
- Phone: 061110093

## 🔐 Default Admin Account

To create the first admin account, use the registration endpoint:

```javascript
POST /api/auth/register
{
  "username": "admin",
  "userNumber": "ADMIN001",
  "email": "admin@durdurcarrental.com",
  "password": "admin123",
  "role": "admin",
  "status": "active"
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Create new car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Repairs
- `GET /api/repairs` - Get all repairs
- `POST /api/repairs` - Create new repair (Admin)
- `PATCH /api/repairs/:id/status` - Update repair status (Admin)

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics (Admin)
- `GET /api/reports/daily` - Daily report (Admin)
- `GET /api/reports/weekly` - Weekly report (Admin)
- `GET /api/reports/monthly` - Monthly report (Admin)
- `GET /api/reports/yearly` - Yearly report (Admin)
- `GET /api/reports/car/:plateNumber` - Car-specific report (Admin)

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/file/:type/:filename` - Serve uploaded files

## 🚀 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start    # Starts React dev server
```

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 📞 Support

For support and inquiries, contact:
- Phone: 061110093
- Email: info@durdurcarrental.com

---

Built with ❤️ for DURDUR CAR RENTAL
# city_rent_cars_system
# city_rent_cars_system

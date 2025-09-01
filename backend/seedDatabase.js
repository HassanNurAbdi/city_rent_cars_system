const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Repair = require('./models/Repair');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/city-rental-car');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    userNumber: 'ADMIN001',
    email: 'admin@durdurcarrental.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    fullName: 'System Administrator',
    phone: '061110093',
    address: 'Dhabarka dambe ee Maqaayada Fatxi, KM4, Muqdisho'
  },
  {
    username: 'john_doe',
    userNumber: 'USER001',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    status: 'active',
    fullName: 'John Doe',
    phone: '061234567',
    address: 'Hodan District, Mogadishu'
  },
  {
    username: 'jane_smith',
    userNumber: 'USER002',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user',
    status: 'active',
    fullName: 'Jane Smith',
    phone: '061345678',
    address: 'Wadajir District, Mogadishu'
  }
];

const sampleCars = [
  {
    carName: 'Toyota Corolla 2022',
    plateNumber: 'MG-001-AA',
    carType: 'Sedan',
    model: 'Corolla',
    status: 'available',
    dailyRate: 50,
    weeklyRate: 300,
    monthlyRate: 1200,
    images: [],
    specifications: {
      year: 2022,
      color: 'White',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5
    }
  },
  {
    carName: 'Honda CR-V 2023',
    plateNumber: 'MG-002-BB',
    carType: 'SUV',
    model: 'CR-V',
    status: 'available',
    dailyRate: 75,
    weeklyRate: 450,
    monthlyRate: 1800,
    images: [],
    specifications: {
      year: 2023,
      color: 'Black',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 7
    }
  },
  {
    carName: 'Nissan Altima 2021',
    plateNumber: 'MG-003-CC',
    carType: 'Sedan',
    model: 'Altima',
    status: 'rented',
    dailyRate: 45,
    weeklyRate: 270,
    monthlyRate: 1080,
    images: [],
    specifications: {
      year: 2021,
      color: 'Silver',
      fuelType: 'Petrol',
      transmission: 'CVT',
      seats: 5
    }
  },
  {
    carName: 'Ford Explorer 2022',
    plateNumber: 'MG-004-DD',
    carType: 'SUV',
    model: 'Explorer',
    status: 'in_repair',
    dailyRate: 80,
    weeklyRate: 480,
    monthlyRate: 1920,
    images: [],
    specifications: {
      year: 2022,
      color: 'Blue',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 8
    }
  },
  {
    carName: 'Hyundai Elantra 2023',
    plateNumber: 'MG-005-EE',
    carType: 'Sedan',
    model: 'Elantra',
    status: 'available',
    dailyRate: 40,
    weeklyRate: 240,
    monthlyRate: 960,
    images: [],
    specifications: {
      year: 2023,
      color: 'Red',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5
    }
  }
];

// Sample bookings will be created after cars are inserted
const createSampleBookings = (carIds) => [
  {
    fullName: 'Ahmed Hassan',
    phone: '061456789',
    residentialAddress: 'Hodan District, Mogadishu',
    idPassportNumber: 'ID123456789',
    car: carIds[2], // MG-003-CC
    carType: 'Sedan',
    plateNumber: 'MG-003-CC',
    rentType: 'daily',
    rentalPeriod: 5,
    rentalDate: new Date('2024-01-15'),
    returnTime: new Date('2024-01-20'),
    totalPrice: 225,
    paymentAmount: 225,
    status: 'approved',
    guarantor: {
      name: 'Mohamed Ali',
      idPassportNumber: 'ID987654321',
      phone: '061567890'
    },
    documents: []
  },
  {
    fullName: 'Fatima Omar',
    phone: '061678901',
    residentialAddress: 'Wadajir District, Mogadishu',
    idPassportNumber: 'ID111222333',
    car: carIds[0], // MG-001-AA
    carType: 'Sedan',
    plateNumber: 'MG-001-AA',
    rentType: 'daily',
    rentalPeriod: 2,
    rentalDate: new Date('2024-01-10'),
    returnTime: new Date('2024-01-12'),
    totalPrice: 100,
    paymentAmount: 100,
    status: 'completed',
    guarantor: {
      name: 'Khadija Said',
      idPassportNumber: 'ID444555666',
      phone: '061789012'
    },
    documents: []
  }
];

// Sample repairs will be created after cars are inserted
const createSampleRepairs = (carIds) => [
  {
    car: carIds[3], // MG-004-DD
    carName: 'Ford Explorer 2022',
    plateNumber: 'MG-004-DD',
    priceAmount: 150,
    comment: 'Engine oil change and brake pad replacement - Regular maintenance service',
    status: 'in_progress',
    startDate: new Date('2024-01-18')
  },
  {
    car: carIds[1], // MG-002-BB
    carName: 'Honda CR-V 2023',
    plateNumber: 'MG-002-BB',
    priceAmount: 200,
    comment: 'Air conditioning system repair - AC compressor replaced',
    status: 'completed',
    startDate: new Date('2024-01-05'),
    completedDate: new Date('2024-01-08')
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    await Repair.deleteMany({});
    console.log('✅ Cleared existing data');

    // Hash passwords for users
    for (let user of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Insert sample data
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    const cars = await Car.insertMany(sampleCars);
    console.log(`✅ Created ${cars.length} cars`);

    const sampleBookings = createSampleBookings(cars.map(car => car._id));
    const bookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Created ${bookings.length} bookings`);

    const sampleRepairs = createSampleRepairs(cars.map(car => car._id));
    const repairs = await Repair.insertMany(sampleRepairs);
    console.log(`✅ Created ${repairs.length} repairs`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('👤 Admin: username: admin, password: admin123');
    console.log('👤 User: username: john_doe, password: user123');
    console.log('👤 User: username: jane_smith, password: user123');
    
    console.log('\n🚗 Sample Cars Created:');
    sampleCars.forEach(car => {
      console.log(`   ${car.plateNumber} - ${car.make} ${car.model} (${car.status})`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase, connectDB };

const express = require('express');
const moment = require('moment');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Repair = require('../models/Repair');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const canceledBookings = await Booking.countDocuments({ status: 'canceled' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const repairsInProgress = await Repair.countDocuments({ status: { $in: ['pending', 'in_progress'] } });

    res.json({
      totalCars,
      totalBookings,
      pendingBookings,
      approvedBookings,
      canceledBookings,
      activeUsers,
      repairsInProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Daily report
router.get('/daily', adminAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? moment(date) : moment();
    const startOfDay = targetDate.clone().startOf('day').toDate();
    const endOfDay = targetDate.clone().endOf('day').toDate();

    const bookings = await Booking.find({
      rentalDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate('car', 'carName plateNumber');

    const repairs = await Repair.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('car', 'carName plateNumber');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalExpenses = repairs.reduce((sum, repair) => sum + repair.priceAmount, 0);

    res.json({
      date: targetDate.format('YYYY-MM-DD'),
      bookings,
      repairs,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      carsRented: bookings.length,
      repairsCount: repairs.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Weekly report
router.get('/weekly', adminAuth, async (req, res) => {
  try {
    const { week, year } = req.query;
    const targetWeek = week ? parseInt(week) : moment().week();
    const targetYear = year ? parseInt(year) : moment().year();
    
    const startOfWeek = moment().year(targetYear).week(targetWeek).startOf('week').toDate();
    const endOfWeek = moment().year(targetYear).week(targetWeek).endOf('week').toDate();

    const bookings = await Booking.find({
      rentalDate: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate('car', 'carName plateNumber');

    const repairs = await Repair.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate('car', 'carName plateNumber');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalExpenses = repairs.reduce((sum, repair) => sum + repair.priceAmount, 0);

    // Group by day
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, 'days');
      const dayKey = day.format('YYYY-MM-DD');
      dailyData[dayKey] = {
        date: dayKey,
        bookings: 0,
        income: 0,
        repairs: 0,
        expenses: 0
      };
    }

    bookings.forEach(booking => {
      const dayKey = moment(booking.rentalDate).format('YYYY-MM-DD');
      if (dailyData[dayKey]) {
        dailyData[dayKey].bookings++;
        dailyData[dayKey].income += booking.paymentAmount;
      }
    });

    repairs.forEach(repair => {
      const dayKey = moment(repair.createdAt).format('YYYY-MM-DD');
      if (dailyData[dayKey]) {
        dailyData[dayKey].repairs++;
        dailyData[dayKey].expenses += repair.priceAmount;
      }
    });

    res.json({
      week: targetWeek,
      year: targetYear,
      startDate: moment(startOfWeek).format('YYYY-MM-DD'),
      endDate: moment(endOfWeek).format('YYYY-MM-DD'),
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalBookings: bookings.length,
      totalRepairs: repairs.length,
      dailyData: Object.values(dailyData)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Monthly report
router.get('/monthly', adminAuth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();
    
    const startOfMonth = moment().year(targetYear).month(targetMonth - 1).startOf('month').toDate();
    const endOfMonth = moment().year(targetYear).month(targetMonth - 1).endOf('month').toDate();

    const bookings = await Booking.find({
      rentalDate: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('car', 'carName plateNumber carType');

    const repairs = await Repair.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('car', 'carName plateNumber');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalExpenses = repairs.reduce((sum, repair) => sum + repair.priceAmount, 0);

    // Car type performance
    const carTypeStats = {};
    bookings.forEach(booking => {
      if (!carTypeStats[booking.carType]) {
        carTypeStats[booking.carType] = { count: 0, income: 0 };
      }
      carTypeStats[booking.carType].count++;
      carTypeStats[booking.carType].income += booking.paymentAmount;
    });

    res.json({
      month: targetMonth,
      year: targetYear,
      monthName: moment().month(targetMonth - 1).format('MMMM'),
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalBookings: bookings.length,
      totalRepairs: repairs.length,
      carTypeStats,
      averageDailyIncome: totalIncome / moment().year(targetYear).month(targetMonth - 1).daysInMonth()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Yearly report
router.get('/yearly', adminAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : moment().year();
    
    const startOfYear = moment().year(targetYear).startOf('year').toDate();
    const endOfYear = moment().year(targetYear).endOf('year').toDate();

    const bookings = await Booking.find({
      rentalDate: { $gte: startOfYear, $lte: endOfYear }
    }).populate('car', 'carName plateNumber carType');

    const repairs = await Repair.find({
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    }).populate('car', 'carName plateNumber');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalExpenses = repairs.reduce((sum, repair) => sum + repair.priceAmount, 0);

    // Monthly breakdown
    const monthlyData = {};
    for (let i = 0; i < 12; i++) {
      const month = moment().year(targetYear).month(i);
      const monthKey = month.format('YYYY-MM');
      monthlyData[monthKey] = {
        month: i + 1,
        monthName: month.format('MMMM'),
        bookings: 0,
        income: 0,
        repairs: 0,
        expenses: 0
      };
    }

    bookings.forEach(booking => {
      const monthKey = moment(booking.rentalDate).format('YYYY-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].bookings++;
        monthlyData[monthKey].income += booking.paymentAmount;
      }
    });

    repairs.forEach(repair => {
      const monthKey = moment(repair.createdAt).format('YYYY-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].repairs++;
        monthlyData[monthKey].expenses += repair.priceAmount;
      }
    });

    res.json({
      year: targetYear,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalBookings: bookings.length,
      totalRepairs: repairs.length,
      monthlyData: Object.values(monthlyData),
      averageMonthlyIncome: totalIncome / 12
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Car report by plate number
router.get('/car/:plateNumber', adminAuth, async (req, res) => {
  try {
    const { plateNumber } = req.params;
    
    const car = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const bookings = await Booking.find({ car: car._id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    const repairs = await Repair.find({ car: car._id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalExpenses = repairs.reduce((sum, repair) => sum + repair.priceAmount, 0);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;

    res.json({
      car,
      bookings,
      repairs,
      stats: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalBookings,
        completedBookings,
        totalRepairs: repairs.length,
        utilizationRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

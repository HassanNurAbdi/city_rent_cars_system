const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all bookings
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { plateNumber: new RegExp(search, 'i') },
        { carType: new RegExp(search, 'i') }
      ];
    }
    if (startDate && endDate) {
      query.rentalDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new booking
router.post('/', [
  // auth, // Temporarily disabled for testing
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('residentialAddress').trim().notEmpty().withMessage('Residential address is required'),
  body('idPassportNumber').trim().notEmpty().withMessage('ID/Passport number is required'),
  body('car').notEmpty().withMessage('Car selection is required'),
  body('rentType').isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid rent type'),
  body('rentalPeriod').isNumeric().withMessage('Rental period must be a number'),
  body('rentalDate').isISO8601().withMessage('Valid rental date is required'),
  body('returnTime').isISO8601().withMessage('Valid return time is required'),
  body('totalPrice').isNumeric().withMessage('Total price must be a number'),
  body('paymentAmount').isNumeric().withMessage('Payment amount must be a number'),
  body('guarantor.name').trim().notEmpty().withMessage('Guarantor name is required'),
  body('guarantor.idPassportNumber').trim().notEmpty().withMessage('Guarantor ID/Passport is required'),
  body('guarantor.phone').trim().notEmpty().withMessage('Guarantor phone is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName, phone, residentialAddress, idPassportNumber, car, rentType,
      rentalPeriod, rentalDate, returnTime, totalPrice, paymentAmount,
      createType, guarantor, documents
    } = req.body;

    // Check if car exists and is available
    const selectedCar = await Car.findById(car);
    if (!selectedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
    if (selectedCar.status !== 'available') {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    const booking = new Booking({
      fullName,
      phone,
      residentialAddress,
      idPassportNumber,
      car,
      carType: selectedCar.carType,
      plateNumber: selectedCar.plateNumber,
      rentType,
      rentalPeriod,
      rentalDate,
      returnTime,
      totalPrice,
      paymentAmount,
      createType: createType || 'new',
      guarantor,
      documents: documents || [],
      createdBy: null // Temporarily set to null since auth is disabled
    });

    await booking.save();

    // Update car status to rented
    selectedCar.status = 'rented';
    await selectedCar.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'canceled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Update car status based on booking status
    if (status === 'completed' || status === 'canceled') {
      booking.car.status = 'available';
      await booking.car.save();
    } else if (status === 'approved' && oldStatus === 'pending') {
      booking.car.status = 'rented';
      await booking.car.save();
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
router.put('/:id', [
  auth,
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('paymentAmount').optional().isNumeric().withMessage('Payment amount must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow updates if booking is pending or if user is admin
    if (booking.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot update approved/completed bookings' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('car', 'carName plateNumber carType')
     .populate('createdBy', 'username');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make car available again if it was rented for this booking
    if (booking.car && booking.car.status === 'rented') {
      booking.car.status = 'available';
      await booking.car.save();
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

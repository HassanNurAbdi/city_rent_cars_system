const express = require('express');
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all cars
router.get('/', auth, async (req, res) => {
  try {
    const { status, carType, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (carType) query.carType = new RegExp(carType, 'i');
    if (search) {
      query.$or = [
        { carName: new RegExp(search, 'i') },
        { plateNumber: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') }
      ];
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get car by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new car (Admin only)
router.post('/', [
  adminAuth,
  body('carName').trim().notEmpty().withMessage('Car name is required'),
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('carType').trim().notEmpty().withMessage('Car type is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
 
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carName, plateNumber, carType, model,  specifications, images } = req.body;

    // Check if plate number already exists
    const existingCar = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingCar) {
      return res.status(400).json({ message: 'Car with this plate number already exists' });
    }

    const car = new Car({
      carName,
      plateNumber: plateNumber.toUpperCase(),
      carType,
      model,
     
      specifications,
      images: images || []
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car (Admin only)
router.put('/:id', [
  adminAuth,
  body('carName').optional().trim().notEmpty().withMessage('Car name cannot be empty'),
  body('plateNumber').optional().trim().notEmpty().withMessage('Plate number cannot be empty'),
  body('carType').optional().trim().notEmpty().withMessage('Car type cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty'),
  
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if new plate number already exists (if being updated)
    if (req.body.plateNumber && req.body.plateNumber.toUpperCase() !== car.plateNumber) {
      const existingCar = await Car.findOne({ plateNumber: req.body.plateNumber.toUpperCase() });
      if (existingCar) {
        return res.status(400).json({ message: 'Car with this plate number already exists' });
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        plateNumber: req.body.plateNumber ? req.body.plateNumber.toUpperCase() : car.plateNumber,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available cars for booking
router.get('/available/list', auth, async (req, res) => {
  try {
    const cars = await Car.find({ status: 'available' }).sort({ carName: 1 });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

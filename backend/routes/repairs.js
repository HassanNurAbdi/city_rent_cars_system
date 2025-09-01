const express = require('express');
const { body, validationResult } = require('express-validator');
const Repair = require('../models/Repair');
const Car = require('../models/Car');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all repairs
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { carName: new RegExp(search, 'i') },
        { plateNumber: new RegExp(search, 'i') },
        { comment: new RegExp(search, 'i') }
      ];
    }

    const repairs = await Repair.find(query)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json(repairs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get repair by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');
    
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }
    res.json(repair);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new repair (Admin only)
router.post('/', [
  adminAuth,
  body('car').notEmpty().withMessage('Car selection is required'),
  body('priceAmount').isNumeric().withMessage('Price amount must be a number'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { car, priceAmount, comment } = req.body;

    // Check if car exists
    const selectedCar = await Car.findById(car);
    if (!selectedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const repair = new Repair({
      car,
      carName: selectedCar.carName,
      plateNumber: selectedCar.plateNumber,
      priceAmount,
      comment,
      createdBy: req.user._id
    });

    await repair.save();

    // Update car status to in_repair
    selectedCar.status = 'in_repair';
    await selectedCar.save();

    const populatedRepair = await Repair.findById(repair._id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');

    res.status(201).json(populatedRepair);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update repair status (Admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const repair = await Repair.findById(req.params.id).populate('car');
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    repair.status = status;
    if (status === 'completed') {
      repair.completedDate = Date.now();
      // Make car available again
      repair.car.status = 'available';
      await repair.car.save();
    }
    
    await repair.save();

    const updatedRepair = await Repair.findById(repair._id)
      .populate('car', 'carName plateNumber carType')
      .populate('createdBy', 'username');

    res.json(updatedRepair);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update repair
router.put('/:id', [
  adminAuth,
  body('priceAmount').optional().isNumeric().withMessage('Price amount must be a number'),
  body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const updatedRepair = await Repair.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('car', 'carName plateNumber carType')
     .populate('createdBy', 'username');

    res.json(updatedRepair);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete repair (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id).populate('car');
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    // Make car available again if it was in repair
    if (repair.car && repair.car.status === 'in_repair') {
      repair.car.status = 'available';
      await repair.car.save();
    }

    await Repair.findByIdAndDelete(req.params.id);
    res.json({ message: 'Repair deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

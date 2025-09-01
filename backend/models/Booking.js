const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  residentialAddress: {
    type: String,
    required: true
  },
  idPassportNumber: {
    type: String,
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  carType: {
    type: String,
    required: true
  },
  plateNumber: {
    type: String,
    required: true
  },
  rentType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  rentalPeriod: {
    type: Number,
    required: true
  },
  rentalDate: {
    type: Date,
    required: true
  },
  returnTime: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  createType: {
    type: String,
    enum: ['new', 'renewal'],
    default: 'new'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'canceled', 'completed'],
    default: 'pending'
  },
  guarantor: {
    name: {
      type: String,
      required: true
    },
    idPassportNumber: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.remainingBalance = this.totalPrice - this.paymentAmount;
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

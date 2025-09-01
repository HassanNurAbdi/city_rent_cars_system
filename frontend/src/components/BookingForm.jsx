import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BookingForm = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    residentialAddress: '',
    idPassportNumber: '',
    car: '',
    rentType: 'daily',
    rentalPeriod: 1,
    rentalDate: '',
    returnTime: '',
    totalPrice: 0,
    paymentAmount: 0,
    remainingBalance: 0,
    createType: 'new',
    guarantor: {
      name: '',
      idPassportNumber: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  const fetchAvailableCars = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cars/available/list');
      setCars(response.data);
    } catch (error) {
      toast.error('Error fetching available cars');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total price from payment amount and remaining balance
      const totalPrice = (parseFloat(formData.paymentAmount) || 0) + (parseFloat(formData.remainingBalance) || 0);
      
      const bookingData = {
        ...formData,
        totalPrice,
        rentalDate: new Date(formData.rentalDate).toISOString(),
        returnTime: new Date(formData.returnTime).toISOString()
      };

      await axios.post('http://localhost:5000/api/bookings', bookingData);
      toast.success('Booking created successfully!');
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        residentialAddress: '',
        idPassportNumber: '',
        car: '',
        rentType: 'daily',
        rentalPeriod: 1,
        rentalDate: '',
        returnTime: '',
        totalPrice: 0,
        paymentAmount: 0,
        remainingBalance: 0,
        createType: 'new',
        guarantor: {
          name: '',
          idPassportNumber: '',
          phone: ''
        }
      });
      
      fetchAvailableCars(); // Refresh available cars
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('guarantor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        guarantor: { ...prev.guarantor, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectedCar = cars.find(car => car._id === formData.car);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Book a Car</h1>
          <p className="mt-2 text-sm text-gray-600">Fill out the form below to make a new booking</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                    <textarea
                      name="residentialAddress"
                      required
                      rows={3}
                      value={formData.residentialAddress}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                    <input
                      type="text"
                      name="idPassportNumber"
                      required
                      value={formData.idPassportNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Car Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Car Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Car</label>
                    <select
                      name="car"
                      required
                      value={formData.car}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a car</option>
                      {cars.map(car => (
                        <option key={car._id} value={car._id}>
                          {car.carName} - {car.plateNumber} (${car.dailyRate}/day)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent Type</label>
                    <select
                      name="rentType"
                      value={formData.rentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period</label>
                    <input
                      type="number"
                      name="rentalPeriod"
                      min="1"
                      required
                      value={formData.rentalPeriod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Create Type</label>
                    <select
                      name="createType"
                      value={formData.createType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="renewal">Renewal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Date</label>
                    <input
                      type="date"
                      name="rentalDate"
                      required
                      value={formData.rentalDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
                    <input
                      type="datetime-local"
                      name="returnTime"
                      required
                      value={formData.returnTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                    <input
                      type="number"
                      name="paymentAmount"
                      required
                      min="0"
                      value={formData.paymentAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Balance</label>
                    <input
                      type="number"
                      name="remainingBalance"
                      required
                      min="0"
                      value={formData.remainingBalance || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guarantor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guarantor Name</label>
                    <input
                      type="text"
                      name="guarantor.name"
                      required
                      value={formData.guarantor.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport Number</label>
                    <input
                      type="text"
                      name="guarantor.idPassportNumber"
                      required
                      value={formData.guarantor.idPassportNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="guarantor.phone"
                      required
                      value={formData.guarantor.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Car Info */}
              {selectedCar && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Car Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Car:</span>
                      <p className="font-medium">{selectedCar.carName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Plate:</span>
                      <p className="font-medium">{selectedCar.plateNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{selectedCar.carType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <p className="font-medium">{selectedCar.model}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 border border-transparent rounded-md text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;

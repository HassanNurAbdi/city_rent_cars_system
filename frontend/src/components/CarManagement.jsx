import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    carName: '',
    plateNumber: '',
    carType: '',
    model: ''
  });

  const fetchCars = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/cars?${params}`);
      setCars(response.data);
    } catch (error) {
      toast.error('Error fetching cars');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const isCarOverdue = (car) => {
    if (!car.currentBooking || car.status !== 'rented') {
      return false;
    }
    const returnDate = new Date(car.currentBooking.returnTime);
    const currentDate = new Date();
    return currentDate > returnDate;
  };

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        carName: formData.carName,
        plateNumber: formData.plateNumber,
        carType: formData.carType,
        model: formData.model
      };
      if (editingCar) {
        await axios.put(`/api/cars/${editingCar._id}`, submitData);
        toast.success('Car updated successfully');
      } else {
        await axios.post('/api/cars', submitData);
        toast.success('Car registered successfully');
      }
      resetForm();
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving car');
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      carName: car.carName,
      plateNumber: car.plateNumber,
      carType: car.carType,
      model: car.model
    });
    setShowForm(true);
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`/api/cars/${carId}`);
        toast.success('Car deleted successfully');
        fetchCars();
      } catch (error) {
        toast.error('Error deleting car');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      carName: '',
      plateNumber: '',
      carType: '',
      model: ''
    });
    setEditingCar(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      available: 'bg-green-100 text-green-800',
      rented: 'bg-yellow-100 text-yellow-800',
      in_repair: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Register New Car
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg mb-6 p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="in_repair">In Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, plate, or model..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Car List */}
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {cars.map((car) => (
              <li key={car._id} className={`px-6 py-4 ${isCarOverdue(car) ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className={`text-sm font-medium ${isCarOverdue(car) ? 'text-red-900' : 'text-gray-900'}`}>
                          {car.carName}
                          {isCarOverdue(car) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              OVERDUE
                            </span>
                          )}
                        </p>
                        <p className={`text-sm ${isCarOverdue(car) ? 'text-red-700' : 'text-gray-500'}`}>
                          {car.carType} - {car.model}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isCarOverdue(car) ? 'text-red-900' : 'text-gray-900'}`}>
                          Plate: {car.plateNumber}
                        </p>
                        {isCarOverdue(car) && car.currentBooking && (
                          <p className="text-xs text-red-600 font-medium">
                            Due: {new Date(car.currentBooking.returnTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(car.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(car)}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {cars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No cars found</p>
            </div>
          )}
        </div>
      </div>

      {/* Car Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCar ? 'Edit Car' : 'Register New Car'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Name</label>
                    <input
                      type="text"
                      required
                      value={formData.carName}
                      onChange={(e) => setFormData({ ...formData, carName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                    <input
                      type="text"
                      required
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                    <input
                      type="text"
                      required
                      value={formData.carType}
                      onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {editingCar ? 'Update Car' : 'Register Car'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarManagement;

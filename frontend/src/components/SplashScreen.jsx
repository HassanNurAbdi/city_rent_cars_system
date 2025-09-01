import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // Auto-redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl">
            <img 
              src="/city-rental-car-logo.svg" 
              alt="City Rental Car Logo" 
              className="w-32 h-32 rounded-full"
            />
          </div>
        </div>

        {/* Company Name */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          CITY RENTAL CAR
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-primary-100 mb-8">
          Your Trusted Car Rental Partner
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>

        {/* Address */}
        <div className="mt-8 text-primary-100">
         <p className="text-sm"> Dhabarka dambe ee Maqaayada Fatxi, KM4, Muqdisho</p>
         
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

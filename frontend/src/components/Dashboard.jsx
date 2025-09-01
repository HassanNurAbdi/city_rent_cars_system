"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrendingUp, Car, Users, Calendar, DollarSign, Wrench } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, ResponsiveContainer } from "recharts";
import { 
  BarChartIcon, 
  BoxIcon, 
  CalendarIcon
} from '@radix-ui/react-icons';
import PageHeader from './PageHeader';

// Chart data for revenue trends
const revenueData = [
  { month: "January", revenue: 18600, bookings: 80 },
  { month: "February", revenue: 30500, bookings: 120 },
  { month: "March", revenue: 23700, bookings: 95 },
  { month: "April", revenue: 17300, bookings: 70 },
  { month: "May", revenue: 20900, bookings: 85 },
  { month: "June", revenue: 21400, bookings: 90 },
];

// Chart data for car utilization
const utilizationData = [
  { day: "Mon", utilized: 75, available: 25 },
  { day: "Tue", utilized: 82, available: 18 },
  { day: "Wed", utilized: 68, available: 32 },
  { day: "Thu", utilized: 91, available: 9 },
  { day: "Fri", utilized: 88, available: 12 },
  { day: "Sat", utilized: 95, available: 5 },
  { day: "Sun", utilized: 72, available: 28 },
];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalCars: 45,
    totalBookings: 128,
    pendingBookings: 12,
    approvedBookings: 98,
    canceledBookings: 18,
    activeUsers: 234,
    repairsInProgress: 7,
    overdueRentals: 3,
    monthlyRevenue: 125400,
    utilizationRate: 82
  });
  const [loading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setStats(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };


  // Card component for consistent styling
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {children}
    </div>
  );

  const CardHeader = ({ children }) => (
    <div className="p-6 pb-4">
      {children}
    </div>
  );

  const CardContent = ({ children }) => (
    <div className="px-6 pb-6">
      {children}
    </div>
  );

  const CardTitle = ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900">
      {children}
    </h3>
  );

  const CardDescription = ({ children }) => (
    <p className="text-sm text-gray-600 mt-1">
      {children}
    </p>
  );

  const CardFooter = ({ children }) => (
    <div className="px-6 pb-6 pt-0">
      {children}
    </div>
  );

  // Chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3b82f6",
    },
    bookings: {
      label: "Bookings",
      color: "#10b981",
    },
    utilized: {
      label: "Utilized",
      color: "#8b5cf6",
    },
    available: {
      label: "Available",
      color: "#f59e0b",
    },
  };

  const adminHeaderStats = [
    {
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue?.toLocaleString()}`,
      icon: BoxIcon
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: CalendarIcon
    },
    {
      label: 'Utilization Rate',
      value: `${stats.utilizationRate}%`,
      icon: BarChartIcon
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dashboard"
        subtitle={isAdmin ? `Welcome back, ${user?.username}! Here's what's happening with your car rental business.` : `Welcome back, ${user?.username}! Ready to book your next car?`}
        icon={BarChartIcon}
        gradient="from-purple-600 to-blue-600"
        stats={isAdmin ? adminHeaderStats : null}
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isAdmin ? (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCars}</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyRevenue?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Repairs in Progress</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.repairsInProgress}</div>
                  <p className="text-xs text-muted-foreground">-2 from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue and bookings for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartConfig.bookings.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={chartConfig.bookings.color} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="bookings"
                        type="natural"
                        fill="url(#fillBookings)"
                        fillOpacity={0.4}
                        stroke={chartConfig.bookings.color}
                        stackId="a"
                      />
                      <Area
                        dataKey="revenue"
                        type="natural"
                        fill="url(#fillRevenue)"
                        fillOpacity={0.4}
                        stroke={chartConfig.revenue.color}
                        stackId="a"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 font-medium leading-none">
                        Trending up by 8.2% this month <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 leading-none text-muted-foreground">
                        January - June 2024
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Utilization Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Car Utilization</CardTitle>
                  <CardDescription>Daily car utilization rates for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={utilizationData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <Bar
                        dataKey="utilized"
                        fill={chartConfig.utilized.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 font-medium leading-none">
                        Average utilization: {stats.utilizationRate}%
                      </div>
                      <div className="flex items-center gap-2 leading-none text-muted-foreground">
                        This week's performance
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Quick Actions */}
            
          </>
        ) : (
          <>
            {/* User Welcome Section */}
           

            {/* User Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Available Cars</CardTitle>
                    <CardDescription>25+ vehicles ready</CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Easy Booking</CardTitle>
                    <CardDescription>24/7 online service</CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Best Rates</CardTitle>
                    <CardDescription>Guaranteed pricing</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

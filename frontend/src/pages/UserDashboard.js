import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import RouteForm from '../components/RouteForm';
import RouteList from '../components/RouteList';
import NotificationPanel from '../components/NotificationPanel';

const UserDashboard = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRouteForm, setShowRouteForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/user/dashboard');
      setRoutes(response.data.data.routes || []);
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteAdded = () => {
    setShowRouteForm(false);
    fetchDashboardData();
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      await axios.delete(`/user/route/${routeId}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Manage your routes and view traffic alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Routes Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Routes</h2>
              <button
                onClick={() => setShowRouteForm(!showRouteForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showRouteForm ? 'Cancel' : 'Add Route'}
              </button>
            </div>

            {showRouteForm && (
              <div className="mb-6">
                <RouteForm onRouteAdded={handleRouteAdded} />
              </div>
            )}

            <RouteList
              routes={routes}
              onDelete={handleDeleteRoute}
              userRole={user?.role}
            />
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="lg:col-span-1">
          <NotificationPanel notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PoliceDashboard from './pages/PoliceDashboard';
import UserDashboard from './pages/UserDashboard';
import RouteFinder from './pages/RouteFinder';
import Layout from './components/Layout';

function App() {
  return (
    <GoogleMapsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="police/dashboard" element={<PoliceDashboard />} />
              <Route path="route-finder" element={<RouteFinder />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleMapsProvider>
  );
}

export default App;


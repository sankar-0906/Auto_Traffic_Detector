import React from 'react';

const AlertPanel = ({ alerts, onResolve }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'MODERATE':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Alerts</h2>
        <p className="text-gray-500 text-center py-4">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Alerts</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getSeverityColor(alert.trafficLevel)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{alert.region?.name || 'Traffic Alert'}</h3>
                <p className="text-sm mt-1">{alert.message || `Traffic congestion detected`}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-white rounded">
                {alert.trafficLevel}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs">
                <p>Length: {alert.lengthKm.toFixed(2)} km</p>
                <p className="text-gray-600">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              {alert.status === 'PENDING' && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;


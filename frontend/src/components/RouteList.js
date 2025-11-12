import React from 'react';

const RouteList = ({ routes, onDelete, userRole }) => {
  if (routes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No routes saved yet. Add your first route above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div key={route.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {route.name || 'Unnamed Route'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {route.sourceAddress || `${route.sourceLat}, ${route.sourceLng}`}
              </p>
              <p className="text-sm text-gray-600">
                → {route.destAddress || `${route.destinationLat}, ${route.destinationLng}`}
              </p>
              {route.isDaily && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Daily Route
                  {route.alertTimeStart && route.alertTimeEnd && (
                    <span className="ml-2">
                      ({route.alertTimeStart} - {route.alertTimeEnd})
                    </span>
                  )}
                </span>
              )}
            </div>
            <button
              onClick={() => onDelete(route.id)}
              className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteList;


import React, { useState, useCallback, useMemo } from 'react';
import { Plane, Calendar, MapPin, Plus, X } from 'lucide-react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import { FlightPriceTracker } from './components/FlightPriceTracker';
import { FlightTrendBox } from './components/FlightTrendBox';
import { format } from 'date-fns';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  imageUrl: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const cityCoordinates: Record<string, Coordinates> = {
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Vancouver, Canada': { lat: 49.2827, lng: -123.1207 },
  'Los Angeles, CA (hometown)': { lat: 34.0522, lng: -118.2437 },
  'Wroclaw, Poland': { lat: 51.1079, lng: 17.0385 },
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050 }
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  position: 'relative' as const
};

function App() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Chicago, IL',
      startDate: '2024-06-06',
      endDate: '2024-06-08',
      description: 'Beyond Chicago 2025',
      imageUrl: 'https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/sites/113/2025/03/04095433/bwc_2025_mk_te_fest_site_dh_3200x1520_r01-scaled.jpg',
    },
    {
      id: '2',
      destination: 'Miami, FL',
      startDate: '2024-06-17',
      endDate: '2024-06-19',
      description: 'Glass Animals Favourite band atm, wednesday degeneracy',
      imageUrl: 'https://www.dailynews.com/wp-content/uploads/2017/09/0430_fea_ocr-l-glassanimals-01-1.jpg?w=719',
    },
    {
      id: '3',
      destination: 'Vancouver, Canada',
      startDate: '2024-07-04',
      endDate: '2024-07-07',
      description: 'League of Legends MSI Tournament!',
      imageUrl: 'https://admin.esports.gg/wp-content/uploads/2024/04/League-of-Legends-MSI-2024-All-Qualified-Teams-968x544.jpg',
    },
    {
      id: '4',
      destination: 'Los Angeles, CA (hometown)',
      startDate: '2024-05-17',
      endDate: '2024-05-24',
      description: 'Sister Graduation',
      imageUrl: 'https://www.athens.edu/wp-content/uploads/2023/04/IMG_4251-scaled-e1681739733424.jpg',
    },
    {
      id: '5',
      destination: 'Wroclaw, Poland',
      startDate: '2024-08-23',
      endDate: '2024-09-01',
      description: 'I took the woooooooock',
      imageUrl: 'https://images.theconversation.com/files/634206/original/file-20241022-15-81z9dy.jpg?ixlib=rb-4.1.0&rect=0%2C0%2C6048%2C4019&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip',
    },
    {
      id: '6',
      destination: 'Berlin, Germany',
      startDate: '2024-08-25',
      endDate: '2024-08-28',
      description: 'lets fucking get it',
      imageUrl: 'https://i0.wp.com/www.mymeenalife.com/wp-content/uploads/2016/07/IMG_4451-2.jpg?fit=750%2C500&ssl=1'
    }
  ]);

  const initialTripState = {
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1000',
  };

  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [newTrip, setNewTrip] = useState(initialTripState);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trips]);

  const pathCoordinates = useMemo(() => {
    return sortedTrips
      .map(trip => cityCoordinates[trip.destination])
      .filter(coord => coord !== undefined);
  }, [sortedTrips]);

  const mapCenter = useMemo(() => {
    if (pathCoordinates.length === 0) return { lat: 0, lng: 0 };
    const lats = pathCoordinates.map(coord => coord.lat);
    const lngs = pathCoordinates.map(coord => coord.lng);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  }, [pathCoordinates]);

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    pathCoordinates.forEach((coord) => {
      bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
    });
    map.fitBounds(bounds);
    setMap(map);
    setIsMapLoaded(true);
  }, [pathCoordinates]);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsMapLoaded(false);
  }, []);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: false,
    scrollwheel: true,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#000000" }]
      }
    ]
  }), []);

  const handleAddTrip = () => {
    if (newTrip.destination && newTrip.startDate && newTrip.endDate) {
      setTrips([...trips, { ...newTrip, id: Date.now().toString() }]);
      setIsAddingTrip(false);
      setNewTrip(initialTripState);
    }
  };

  const handleDeleteTrip = (id: string) => {
    setTrips(trips.filter(trip => trip.id !== id));
    if (selectedTrip?.id === id) {
      setSelectedTrip(null);
    }
  };

  const handleCloseModal = () => {
    setIsAddingTrip(false);
    setNewTrip(initialTripState);
  };

  const availableDestinations = Object.keys(cityCoordinates);

  // Mock function to generate random trend data
  const getTrendData = (destination: string) => {
    const random = Math.random();
    return {
      trend: random > 0.5 ? 'up' as const : 'down' as const,
      percentage: Math.floor(random * 20) + 5,
      currentPrice: Math.floor(Math.random() * 300) + 200,
    };
  };

  const nextTripDate = sortedTrips.length > 0 
    ? format(new Date(sortedTrips[0].startDate), 'MMM d, yyyy')
    : 'No upcoming trips';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <Plane className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Adventure Awaits</h1>
                <p className="text-sm text-gray-500">Next trip: {nextTripDate}</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingTrip(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Trip
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={2}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={mapOptions}
            >
              {isMapLoaded && (
                <>
                  {pathCoordinates.map((position, index) => (
                    <Marker
                      key={sortedTrips[index].id}
                      position={position}
                      label={{
                        text: (index + 1).toString(),
                        color: '#FFFFFF',
                        className: "font-bold"
                      }}
                      onClick={() => setSelectedTrip(sortedTrips[index])}
                    />
                  ))}
                  <Polyline
                    path={pathCoordinates}
                    options={{
                      strokeColor: '#2563EB',
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                      geodesic: true,
                    }}
                  />
                </>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {selectedTrip && (
          <div className="mb-8">
            <FlightPriceTracker
              from="Los Angeles, CA (hometown)"
              to={selectedTrip.destination}
              date={selectedTrip.startDate}
            />
          </div>
        )}

        {isAddingTrip && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Trip</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <select
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a destination</option>
                    {availableDestinations.map((destination) => (
                      <option key={destination} value={destination}>
                        {destination}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newTrip.description}
                    onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleAddTrip}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Trip
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const trendData = getTrendData(trip.destination);
            return (
              <div 
                key={trip.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                  selectedTrip?.id === trip.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTrip(trip)}
              >
                <img src={trip.imageUrl} alt={trip.destination} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{trip.destination}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{trip.destination}</span>
                    </div>
                  </div>
                  {trip.description && (
                    <p className="mt-4 text-gray-600">{trip.description}</p>
                  )}
                  <FlightTrendBox
                    destination={trip.destination}
                    trend={trendData.trend}
                    percentage={trendData.percentage}
                    currentPrice={trendData.currentPrice}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
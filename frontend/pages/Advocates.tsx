import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, Map as MapIcon, List, Phone, Navigation, Star, Filter, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { MockService } from '../services/mockService';
import { Advocate } from '../types';
import L from 'leaflet';

// Fix for default Leaflet icon issues
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon], map.getZoom());
    }, [lat, lon, map]);
    return null;
};

export const Advocates: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'denied' | 'success'>('idle');
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isCallbackModalOpen, setCallbackModalOpen] = useState(false);

  useEffect(() => {
    const defaultLat = 18.5204;
    const defaultLon = 73.8567;

    const fetchAdvocates = async (lat: number, lon: number) => {
      const data = await MockService.getAdvocates(lat, lon, 10);
      setAdvocates(data);
    };

    if (navigator.geolocation) {
      setLocationStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setLocationStatus('success');
          fetchAdvocates(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation denied:", error);
          setLocationStatus('denied');
          setUserLocation({ lat: defaultLat, lon: defaultLon });
          fetchAdvocates(defaultLat, defaultLon);
        }
      );
    } else {
      setUserLocation({ lat: defaultLat, lon: defaultLon });
      fetchAdvocates(defaultLat, defaultLon);
    }
  }, []);

  const handleRequestCallback = () => {
      setCallbackModalOpen(false);
      alert(`Callback requested from ${selectedAdvocate?.name}! (Mock Action)`);
      setSelectedAdvocate(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Filters / Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Search area, advocate, or practice..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* Controls */}
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none justify-center">
                <Filter className="w-4 h-4 mr-2" /> Filters
             </Button>
             <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'}`}
               >
                 <div className="flex items-center"><List className="w-4 h-4 mr-2" /> List</div>
               </button>
               <button 
                 onClick={() => setViewMode('map')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'}`}
               >
                 <div className="flex items-center"><MapIcon className="w-4 h-4 mr-2" /> Map</div>
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex overflow-hidden relative">
        
        {/* List View */}
        <div className={`w-full ${viewMode === 'map' ? 'hidden md:block md:w-96 lg:w-[28rem]' : 'block'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto z-20 flex flex-col transition-colors duration-300`}>
           <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {advocates.length} Nearby Advocates Found
           </div>
           {advocates.map(adv => (
             <div 
                key={adv.id} 
                className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${selectedAdvocate?.id === adv.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500' : ''}`}
                onClick={() => {
                    setSelectedAdvocate(adv);
                    if (viewMode === 'list') {
                        setCallbackModalOpen(true);
                    }
                }}
             >
               <div className="flex gap-4">
                 <img src={adv.imageUrl} alt={adv.name} className="w-16 h-16 rounded-lg object-cover bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
                 <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 dark:text-white">{adv.name}</h3>
                      <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                         {adv.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{adv.firm}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {adv.distance_km} km away • {adv.address}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {adv.practice_areas.map(area => (
                        <span key={area} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                          {area}
                        </span>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
           ))}
        </div>

        {/* Map View */}
        <div className={`flex-grow relative ${viewMode === 'list' ? 'hidden' : 'block'}`}>
          {userLocation ? (
            <MapContainer center={[userLocation.lat, userLocation.lon]} zoom={13} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap lat={userLocation.lat} lon={userLocation.lon} />
              
              {/* User Marker */}
              <Marker position={[userLocation.lat, userLocation.lon]} icon={customIcon}>
                 <Popup>You are here</Popup>
              </Marker>

              {/* Advocate Markers */}
              {advocates.map(adv => (
                <Marker 
                    key={adv.id} 
                    position={[adv.lat, adv.lon]} 
                    icon={customIcon}
                    eventHandlers={{
                        click: () => setSelectedAdvocate(adv),
                    }}
                >
                  <Popup>
                    <div className="font-sans p-1">
                        <h3 className="font-bold">{adv.name}</h3>
                        <p className="text-xs text-slate-600">{adv.firm}</p>
                        <button 
                          onClick={() => setCallbackModalOpen(true)}
                          className="mt-2 w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                        >
                          View Details
                        </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-col">
               <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 dark:text-slate-400">Locating you...</p>
            </div>
          )}
          
          {/* Selected Advocate Card Overlay */}
          {selectedAdvocate && !isCallbackModalOpen && viewMode === 'map' && (
             <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-[1000] animate-slideUp">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex gap-3">
                      <img src={selectedAdvocate.imageUrl} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                         <h3 className="font-bold text-slate-900 dark:text-white">{selectedAdvocate.name}</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAdvocate.firm}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedAdvocate(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">×</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                   <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${selectedAdvocate.lat},${selectedAdvocate.lon}`)}>
                      <Navigation className="w-3 h-3 mr-2" /> Directions
                   </Button>
                   <Button size="sm" onClick={() => setCallbackModalOpen(true)}>
                      <Phone className="w-3 h-3 mr-2" /> Call Now
                   </Button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Callback Modal */}
      {isCallbackModalOpen && selectedAdvocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Callback</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Share your details with <strong>{selectedAdvocate.name}</strong>. They will contact you shortly.
              </p>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRequestCallback(); }}>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                    <input type="text" required className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                    <input type="tel" required pattern="[0-9]{10}" placeholder="10-digit number" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div className="flex gap-3 mt-6">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setCallbackModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1">Request</Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
// import { useState, useEffect } from "react";

// export default function GPSTestComponent() {
//     const [testResults, setTestResults] = useState([]);
//     const [isTesting, setIsTesting] = useState(false);
//     const [currentPosition, setCurrentPosition] = useState(null);

//     const addResult = (test, status, message, data = null) => {
//         setTestResults(prev => [...prev, {
//             test,
//             status,
//             message,
//             data,
//             timestamp: new Date().toLocaleTimeString()
//         }]);
//     };

//     const testGeolocationSupport = () => {
//         const supported = 'geolocation' in navigator;
//         addResult('Geolocation Support', supported ? 'PASS' : 'FAIL', 
//             supported ? 'Geolocation API is supported' : 'Geolocation API not supported');
//         return supported;
//     };

//     const testHighAccuracy = async () => {
//         try {
//             const position = await new Promise((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(resolve, reject, {
//                     enableHighAccuracy: true,
//                     timeout: 10000,
//                     maximumAge: 0
//                 });
//             });
            
//             const { latitude, longitude, accuracy } = position.coords;
//             addResult('High Accuracy GPS', 'PASS', 
//                 `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}, Accuracy: ±${accuracy.toFixed(1)}m`,
//                 { latitude, longitude, accuracy });
//             setCurrentPosition(position);
//             return position;
//         } catch (error) {
//             addResult('High Accuracy GPS', 'FAIL', 
//                 `Error ${error.code}: ${error.message}`, { code: error.code, message: error.message });
//             return null;
//         }
//     };

//     const testLowAccuracy = async () => {
//         try {
//             const position = await new Promise((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(resolve, reject, {
//                     enableHighAccuracy: false,
//                     timeout: 5000,
//                     maximumAge: 60000
//                 });
//             });
            
//             const { latitude, longitude, accuracy } = position.coords;
//             addResult('Low Accuracy GPS', 'PASS', 
//                 `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}, Accuracy: ±${accuracy.toFixed(1)}m`,
//                 { latitude, longitude, accuracy });
//             return position;
//         } catch (error) {
//             addResult('Low Accuracy GPS', 'FAIL', 
//                 `Error ${error.code}: ${error.message}`, { code: error.code, message: error.message });
//             return null;
//         }
//     };

//     const testWatchPosition = async () => {
//         return new Promise((resolve) => {
//             const watchId = navigator.geolocation.watchPosition(
//                 (position) => {
//                     const { latitude, longitude, accuracy } = position.coords;
//                     addResult('Watch Position', 'PASS', 
//                         `Continuous position: Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}, Accuracy: ±${accuracy.toFixed(1)}m`);
//                     navigator.geolocation.clearWatch(watchId);
//                     resolve(position);
//                 },
//                 (error) => {
//                     addResult('Watch Position', 'FAIL', 
//                         `Error ${error.code}: ${error.message}`, { code: error.code, message: error.message });
//                     navigator.geolocation.clearWatch(watchId);
//                     resolve(null);
//                 },
//                 {
//                     enableHighAccuracy: true,
//                     timeout: 10000,
//                     maximumAge: 0
//                 }
//             );

//             // Cancel after 15 seconds if no result
//             setTimeout(() => {
//                 navigator.geolocation.clearWatch(watchId);
//                 if (!testResults.find(r => r.test === 'Watch Position')) {
//                     addResult('Watch Position', 'FAIL', 'Timeout after 15 seconds');
//                     resolve(null);
//                 }
//             }, 15000);
//         });
//     };

//     const runAllTests = async () => {
//         setIsTesting(true);
//         setTestResults([]);
        
//         // Test 1: Basic support
//         const supported = testGeolocationSupport();
//         if (!supported) {
//             setIsTesting(false);
//             return;
//         }

//         // Test 2: High accuracy
//         await new Promise(r => setTimeout(r, 1000));
//         await testHighAccuracy();

//         // Test 3: Low accuracy (fallback)
//         await new Promise(r => setTimeout(r, 1000));
//         await testLowAccuracy();

//         // Test 4: Watch position
//         await new Promise(r => setTimeout(r, 1000));
//         await testWatchPosition();

//         setIsTesting(false);
//     };

//     const clearResults = () => {
//         setTestResults([]);
//         setCurrentPosition(null);
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'PASS': return 'text-green-600 bg-green-50 border-green-200';
//             case 'FAIL': return 'text-red-600 bg-red-50 border-red-200';
//             case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//             default: return 'text-gray-600 bg-gray-50 border-gray-200';
//         }
//     };

//     const getErrorExplanation = (code) => {
//         switch (code) {
//             case 1: return 'User denied permission';
//             case 2: return 'Position unavailable (network issues)';
//             case 3: return 'Timeout expired';
//             default: return 'Unknown error';
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//             <h2 className="text-2xl font-bold mb-4">GPS Diagnostic Tool</h2>
            
//             <div className="flex gap-4 mb-6">
//                 <button
//                     onClick={runAllTests}
//                     disabled={isTesting}
//                     className={`px-4 py-2 rounded font-semibold transition-colors ${
//                         isTesting 
//                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                             : 'bg-blue-500 text-white hover:bg-blue-600'
//                     }`}
//                 >
//                     {isTesting ? 'Testing...' : 'Run GPS Tests'}
//                 </button>
//                 <button
//                     onClick={clearResults}
//                     className="px-4 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600 transition-colors"
//                 >
//                     Clear Results
//                 </button>
//             </div>

//             {testResults.length > 0 && (
//                 <div className="space-y-3">
//                     <h3 className="font-semibold text-lg mb-2">Test Results:</h3>
//                     {testResults.map((result, index) => (
//                         <div key={index} className={`p-3 rounded border ${getStatusColor(result.status)}`}>
//                             <div className="flex justify-between items-start mb-1">
//                                 <span className="font-semibold">{result.test}</span>
//                                 <span className="text-xs opacity-75">{result.timestamp}</span>
//                             </div>
//                             <div className="text-sm">{result.message}</div>
//                             {result.data && result.data.code && (
//                                 <div className="text-xs mt-1">
//                                     <strong>Explanation:</strong> {getErrorExplanation(result.data.code)}
//                                 </div>
//                             )}
//                             {result.data && result.data.latitude && (
//                                 <div className="text-xs mt-1 font-mono">
//                                     Lat: {result.data.latitude.toFixed(6)}, Lng: {result.data.longitude.toFixed(6)}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {currentPosition && (
//                 <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
//                     <h3 className="font-semibold mb-2">Current Position Data:</h3>
//                     <div className="text-sm space-y-1">
//                         <div><strong>Latitude:</strong> {currentPosition.coords.latitude.toFixed(6)}</div>
//                         <div><strong>Longitude:</strong> {currentPosition.coords.longitude.toFixed(6)}</div>
//                         <div><strong>Accuracy:</strong> ±{currentPosition.coords.accuracy.toFixed(1)}m</div>
//                         <div><strong>Altitude:</strong> {currentPosition.coords.altitude ? `${currentPosition.coords.altitude.toFixed(1)}m` : 'N/A'}</div>
//                         <div><strong>Speed:</strong> {currentPosition.coords.speed ? `${(currentPosition.coords.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
//                         <div><strong>Heading:</strong> {currentPosition.coords.heading ? `${currentPosition.coords.heading.toFixed(1)}°` : 'N/A'}</div>
//                         <div><strong>Timestamp:</strong> {new Date(currentPosition.timestamp).toLocaleString()}</div>
//                     </div>
//                 </div>
//             )}

//             <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
//                 <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
//                 <ul className="list-disc list-inside space-y-1">
//                     <li>If you see "User denied permission", check browser location permissions</li>
//                     <li>If tests fail with timeout, try moving near a window or outdoors</li>
//                     <li>High accuracy works best outdoors with clear sky view</li>
//                     <li>Low accuracy may work indoors but with reduced precision</li>
//                     <li>Some corporate networks may block GPS requests</li>
//                 </ul>
//             </div>
//         </div>
//     );
// }

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Map from './pages/Map';
import RoomDetails from './pages/RoomDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Notfound from './pages/Notfound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminRoomForm from './pages/admin/AdminRoomForm';
import AdminMap from './pages/admin/AdminMap';
import AdminHolidays from './pages/admin/AdminHolidays';
import AdminBookings from './pages/admin/AdminBookings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="rooms/:id" element={<RoomDetails />} />
            <Route path="map" element={<Map />} />
            <Route path="login" element={<Login />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/rooms" element={<AdminRooms />} />
            <Route path="admin/rooms/new" element={<AdminRoomForm />} />
            <Route path="admin/rooms/:id/edit" element={<AdminRoomForm />} />
            <Route path="admin/map" element={<AdminMap />} />
            <Route path="admin/holidays" element={<AdminHolidays />} />
            <Route path="admin/bookings" element={<AdminBookings />} />
            <Route path="register" element={<Register />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="*" element={<Notfound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

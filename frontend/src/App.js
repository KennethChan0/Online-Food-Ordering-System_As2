import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';

// Your Review Management
import Review from './pages/Review';

// Teammates' Order Management
import OrderPage from './pages/order';
import Orders from './pages/OrderHistory';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />

          {/* Review Management */}
          <Route path="/reviews" element={<Review />} />

          {/* Order Management */}
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>

      </Router>
    </CartProvider>
  );
}

export default App;

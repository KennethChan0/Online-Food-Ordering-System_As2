import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        Online Food Order System
      </Link>

      <div>
        {user ? (
          <>
            <Link to="/tasks" className="mr-4">Menu</Link>
            {user.role === 'customer' && (
              <Link to="/order" className="mr-4">Order Cart</Link>
            )}
            <Link to="/profile" className="mr-4">Profile</Link>
            <Link to="/reviews" className="mr-4">Reviews</Link>
            <Link to="/orders" className="mr-4">Orders History</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
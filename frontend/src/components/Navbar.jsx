import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
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
            <Link to="/tasks" className="mr-4">
              Menu
            </Link>

            {user.role === 'customer' && (
              <Link to="/reservations/new" className="mr-4">
                Create Reservation
              </Link>
            )}

            {user.role === 'restaurant' && (
              <Link to="/staff/reservations" className="mr-4">
                Customer Reservations
              </Link>
            )}

            <Link to="/profile" className="mr-4">
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">
              Login
            </Link>

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

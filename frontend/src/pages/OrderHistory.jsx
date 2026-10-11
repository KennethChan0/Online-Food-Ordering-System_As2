import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const money = (amount) => `$${Number(amount).toFixed(2)}`;

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axiosInstance.get('/api/orders', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setOrders(response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load orders.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return <p className="p-6">Please log in to view orders.</p>;
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === 'customer' ? 'My Orders' : 'Customer Orders'}
      </h1>

      {loading && <p>Loading orders...</p>}

      {!loading && error && (
        <p role="alert" className="text-red-600">{error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {!loading && !error && orders.map((order) => (
        <article
          key={order._id}
          className="bg-gray-100 p-4 mb-4 rounded shadow"
        >
          <p className="font-bold">Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>

          {user.role === 'restaurant' && (
            <p>
              Customer: {order.customer?.name || 'Unknown'}
              {order.customer?.email && ` (${order.customer.email})`}
            </p>
          )}

          <h2 className="font-semibold mt-3">Items</h2>
          <ul className="list-disc ml-6">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — {money(item.unitPrice)} × {item.quantity}
                {' = '}{money(item.subtotal)}
              </li>
            ))}
          </ul>

          <p className="font-bold mt-3">
            Total: {money(order.totalAmount)}
          </p>
        </article>
      ))}
    </main>
  );
};

export default OrderHistory;
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const money = (amount) => `$${Number(amount).toFixed(2)}`;

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const [updatingId, setUpdatingId] = useState(null);
    const [updateError, setUpdateError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');

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

    const handleUpdateStatus = async (order) => {
        const status = selectedStatuses[order._id] || order.status;
        setUpdatingId(order._id);
        setUpdateError('');

        try {
            const response = await axiosInstance.patch(
                `/api/orders/${order._id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            setOrders((currentOrders) =>
                currentOrders.map((currentOrder) =>
                    currentOrder._id === order._id
                        ? response.data.order
                        : currentOrder
                )
            );
        } catch (requestError) {
            setUpdateError(
                requestError.response?.data?.message ||
                'Unable to update order status.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteOrder = async (order) => {
        const confirmed = window.confirm(
            `Delete order ${order._id}? This cannot be undone.`
        );

        if (!confirmed) return; // 按 Cancel：不發送任何請求

        setDeletingId(order._id);
        setUpdateError('');
        setDeleteMessage('');

        try {
            await axiosInstance.delete(`/api/orders/${order._id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setOrders((currentOrders) =>
                currentOrders.filter((currentOrder) => currentOrder._id !== order._id)
            );
            setDeleteMessage('Order deleted successfully.');
        } catch (requestError) {
            setUpdateError(
                requestError.response?.data?.message ||
                'Unable to delete the order.'
            );
        } finally {
            setDeletingId(null);
        }
    };

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

            {updateError && (
                <p role="alert" className="text-red-600 mb-4">
                    {updateError}
                </p>
            )}

            {deleteMessage && (
                <p role="status" className="text-green-600 mb-4">
                    {deleteMessage}
                </p>
            )}

            {!loading && !error && orders.map((order) => (
                <article
                    key={order._id}
                    className="bg-gray-100 p-4 mb-4 rounded shadow"
                >
                    <p className="font-bold">Order ID: {order._id}</p>
                    
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
                    <p>Status: {order.status}</p>
                    {user.role === 'restaurant' && (
                        <div className="my-3 flex items-center gap-2">
                            <select
                                aria-label={`Status for order ${order._id}`}
                                value={selectedStatuses[order._id] || order.status}
                                onChange={(event) =>
                                    setSelectedStatuses((current) => ({
                                        ...current,
                                        [order._id]: event.target.value,
                                    }))
                                }
                                className="border rounded p-2"
                            >
                                {['Pending', 'Preparing', 'Ready', 'Completed'].map(
                                    (status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                type="button"
                                onClick={() => handleUpdateStatus(order)}
                                disabled={
                                    updatingId === order._id ||
                                    (selectedStatuses[order._id] || order.status) === order.status
                                }
                                className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50"
                            >
                                {updatingId === order._id ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    )}
                    {user.role === 'restaurant' && (
                        <button
                            type="button"
                            aria-label={`Delete order ${order._id}`}
                            onClick={() => handleDeleteOrder(order)}
                            disabled={deletingId === order._id}
                            className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                            {deletingId === order._id ? 'Deleting...' : '× Delete Order'}
                        </button>
                    )}
                </article>
            ))}
        </main>
    );
};

export default OrderHistory;
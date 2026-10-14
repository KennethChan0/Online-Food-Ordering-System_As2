import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const money = (amount) => `$${Number(amount).toFixed(2)}`;

const OrderForm = () => {
    const { user } = useAuth();
    const { cartItems, updateQuantity, removeItem, clearCart } = useCart();

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const totalCents = cartItems.reduce(
        (sum, item) =>
            sum + Math.round(item.unitPrice * 100) * item.quantity,
        0
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!user || user.role !== 'customer') {
            setError('Please log in as a customer.');
            return;
        }

        if (cartItems.length === 0) {
            setError('Select at least one menu item.');
            return;
        }

        try {
            setSubmitting(true);

            const response = await axiosInstance.post(
                '/api/orders',
                {
                    items: cartItems.map((item) => ({
                        menuItem: item.menuItem,
                        quantity: item.quantity,
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            clearCart();
            setMessage(
                `Order created successfully. Total: ${money(
                    response.data.order.totalAmount
                )}`
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to create the order.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Your Order</h2>

            {cartItems.length === 0 ? (
                <p>No items selected. Go to Menu to add food.</p>
            ) : (
                <>
                    {cartItems.map((item) => (
                        <div
                            key={item.menuItem}
                            className="bg-gray-100 p-4 mb-4 rounded"
                        >
                            <p className="font-bold">{item.name}</p>

                            {item.photo && (
                                <img
                                    src={item.photo}
                                    alt={item.name}
                                    className="w-48 h-32 object-cover rounded my-2"
                                />
                            )}

                            <div className="flex items-center gap-3 my-2">
                                <button
                                    type="button"
                                    disabled={submitting || item.quantity === 1}
                                    onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                                    className="border px-3 py-1 rounded disabled:opacity-50"
                                >
                                    −
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                                    className="border px-3 py-1 rounded disabled:opacity-50"
                                >
                                    +
                                </button>
                            </div>

                            <p>
                                {money(item.unitPrice)} × {item.quantity} ={' '}
                                {money(
                                    (Math.round(item.unitPrice * 100) * item.quantity) / 100
                                )}
                            </p>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => removeItem(item.menuItem)}
                                className="text-red-600 underline"
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <p className="text-xl font-bold">
                        Total: {money(totalCents / 100)}
                    </p>
                </>
            )}

            {error && <p role="alert" className="text-red-600 mt-4">{error}</p>}
            {message && (
                <p role="status" className="text-green-600 mt-4">{message}</p>
            )}

            <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="bg-blue-600 text-white p-2 rounded mt-4 disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Place Order'}
            </button>
        </form>
    );
};

export default OrderForm;
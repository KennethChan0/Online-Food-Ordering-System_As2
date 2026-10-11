import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Tasks = () => {
  const { user } = useAuth();
  const { addItem } = useCart();

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (requestError) {
        setError('Failed to fetch menu items.');
      }
    };

    fetchTasks();
  }, [user]);

  const handleAddToOrder = (task) => {
    const quantity = Number(quantities[task._id]);

    setMessage('');
    setError('');

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Please enter a positive whole number.');
      return;
    }

    addItem(task, quantity);
    setQuantities((previous) => ({
      ...previous,
      [task._id]: '',
    }));
    setMessage(`${quantity} × ${task.title} added to your order.`);
  };

  if (!user) {
    return <p className="p-6">Please log in to view the menu.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Menu</h1>

      {user.role === 'restaurant' ? (
        <>
          <TaskForm
            tasks={tasks}
            setTasks={setTasks}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
          />
          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            setEditingTask={setEditingTask}
          />
        </>
      ) : (
        <>
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-gray-100 p-4 my-4 rounded shadow"
            >
              <h2 className="font-bold">{task.title}</h2>

              {task.photo && (
                <img
                  src={task.photo}
                  alt={task.title}
                  className="w-48 h-32 object-cover rounded my-2"
                />
              )}

              <p>{task.description}</p>
              <p>Price: ${Number(task.price).toFixed(2)}</p>

              <label
                htmlFor={`quantity-${task._id}`}
                className="block mt-2"
              >
                Quantity
              </label>
              <input
                id={`quantity-${task._id}`}
                type="number"
                min="1"
                step="1"
                value={quantities[task._id] ?? ''}
                onChange={(event) =>
                  setQuantities((previous) => ({
                    ...previous,
                    [task._id]: event.target.value,
                  }))
                }
                className="p-2 border rounded"
              />

              <button
                type="button"
                onClick={() => handleAddToOrder(task)}
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          ))}

          {error && <p role="alert" className="text-red-600">{error}</p>}
          {message && (
            <p role="status" className="text-green-600">{message}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Tasks;
import { useToast } from '../context/ToastContext';

export default function TestToast() {
  const { showSuccess, showError } = useToast();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Test Toast Notifications</h1>
        <div className="space-y-4">
          <button
            onClick={() => showSuccess('This is a success toast!')}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Show Success Toast
          </button>
          <button
            onClick={() => showError('This is an error toast!')}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Show Error Toast
          </button>
          <button
            onClick={() => {
              showSuccess('Toast 1');
              setTimeout(() => showSuccess('Toast 2'), 500);
              setTimeout(() => showError('Toast 3'), 1000);
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Show Multiple Toasts
          </button>
        </div>
      </div>
    </div>
  );
}

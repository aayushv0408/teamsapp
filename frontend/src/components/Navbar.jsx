import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
            TaskManager
          </Link>

          <div className="hidden md:flex gap-6">
            <Link to="/dashboard" className="hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link to="/projects" className="hover:text-blue-400 transition">
              Projects
            </Link>
            {user?.role === 'admin' && (
              <Link to="/members" className="hover:text-blue-400 transition">
                Members
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-semibold">{user?.name}</p>
              <p className={`text-xs ${user?.role === 'admin' ? 'text-red-400' : 'text-green-400'}`}>
                {user?.role?.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

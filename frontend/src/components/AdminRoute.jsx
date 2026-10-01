import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children, user }) {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
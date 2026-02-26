import { useRoutes } from 'react-router-dom';
import './index.css';
import Home from './App';
import { RedirectPage } from './RedirectPage';
const routes = [
  { path: '/', element: <Home /> },
  { path: '/:shortCode', element: <RedirectPage /> },
  // { path: '/*', element: <Home /> },
];
function AppRoutes() {
  return useRoutes(routes);
}
export default AppRoutes;

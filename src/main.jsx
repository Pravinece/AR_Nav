import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: import.meta.env.VITE_APP_URL,
    element: <App />,
  },
  {
    path: `${import.meta.env.VITE_APP_URL}/*`,
    element: <App />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

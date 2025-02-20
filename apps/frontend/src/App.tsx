import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "../src/pages/Login";
import Dashboard from "../src/pages/Dashboard";
import PrivateRoute from "../src/routes/PrivateRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

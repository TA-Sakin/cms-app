import { Route, Routes } from "react-router-dom";
import Register from "./Pages/Register";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import PublicRoute from "./components/Auth/PublicRoute";
import Dashboard from "./Pages/Dashboard";
import PrivateRoute from "./components/Auth/PrivateRoute";

function App() {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<Home />}></Route> */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        ></Route>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        ></Route>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        ></Route>
      </Routes>
      <ToastContainer
        autoClose={2500}
        hideProgressBar={true}
        closeOnClick={true}
        transition={Zoom}
      />
    </div>
  );
}

export default App;


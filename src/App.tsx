import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, BrowserRouter } from "react-router-dom";
import BibleApp from "./assets/BibleApp";
import Login from "./assets/login";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (!token) navigate("/login");
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <BibleApp /> : <Login />} />
    </Routes>
  );
}

export default function WrappedApp() {
  return (
    <BrowserRouter basename="/WithElim">
      <App />
    </BrowserRouter>
  );
}

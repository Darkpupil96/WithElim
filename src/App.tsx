
import { Routes, Route, BrowserRouter } from "react-router-dom";
import BibleApp from "./assets/BibleApp";
import Login from "./assets/login";
import "./App.css";

function App() {




  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={ <BibleApp /> } />
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

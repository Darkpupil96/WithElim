
import { Routes, Route, BrowserRouter } from "react-router-dom";
import BibleApp from "./assets/BibleApp";
import Login from "./assets/login";
import AccountSettings from "./assets/AccountSettings";
import PrayerPage from "./assets/PrayerPage";
import MyPrayerPage from "./assets/MyPrayerPage";
import "./App.css";

function App() {




  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={ <BibleApp /> } />
      <Route path="/account-settings" element={<AccountSettings />}/>
      <Route path="/my-prayers" element={<MyPrayerPage />} />
      <Route path="/prayers" element={<PrayerPage />} />
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

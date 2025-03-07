// App.tsx
import{ useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BibleApp from "./assets/BibleApp";
import Login from "./assets/login";
import AccountSettings from "./assets/AccountSettings";
import PrayerPage from "./assets/PrayerPage";
import MyPrayerPage from "./assets/MyPrayerPage";
import VerseSearch from "./assets/VerseSearch";
import "./App.css";

// 定义 Verse 类型（如果还没有导出的话）
export interface Verse {
  version: string;
  b: number;
  c: number;
  v: number;
  t: string;
}

function App() {
  // 定义共享状态，用于存储选中的 verse（如果需要）
  const [verseSearching, setVerseSearching] = useState<Verse | null>(null);

  const clearVerseSearching = () => {
    setVerseSearching(null);
  };
  // 定义回调函数，处理选中经文的逻辑
  const handleSelectVerse = (verse: Verse) => {
    console.log("在 App 中捕获到选中的经文：", verse);
    setVerseSearching(verse);
    // 这里可以再执行其他逻辑，比如更新全局状态、导航等
  };

  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* BibleApp 作为首页 */}
        <Route path="/" element={<BibleApp verseSearching={verseSearching}   onClearVerseSearching={clearVerseSearching} />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/my-prayers" element={<MyPrayerPage />} />
        <Route path="/prayers" element={<PrayerPage />} />
        {/* 将 handleSelectVerse 作为 prop 传给 VerseSearch */}
        <Route
          path="/verseSearch"
          element={<VerseSearch onSelectVerse={handleSelectVerse} />}
        />
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

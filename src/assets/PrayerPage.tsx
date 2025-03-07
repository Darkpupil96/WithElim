import React, { useState, useEffect } from "react";
import PrayerCard, { Prayer } from "../components/PrayerCard";
import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import Header from "../components/Header";
import { IoArrowBackCircleOutline } from "react-icons/io5";


interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  language: "t_cn" | "t_kjv";
  reading_book?: number;
  reading_chapter?: number;
}

const PrayerPage: React.FC = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  // 新增加载状态
  const [loading, setLoading] = useState<boolean>(true);
  
  // 用户信息状态
  const [user, setUser] = useState<UserInfo | null>(null);
  // 获取用户信息
  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("https://withelim.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setLanguage(data.language);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 获取公共祷告并去重
  const fetchPrayers = async () => {
    try {
      const response = await fetch(`https://withelim.com/api/prayers/public`);
      const data = await response.json();
      if (data.prayers && data.prayers.length > 0) {
        // 用 Map 去重：键为 prayer.id
        const prayerMap = new Map<number, Prayer>();
        prayers.forEach((p) => prayerMap.set(p.id, p));
        data.prayers.forEach((p: Prayer) => {
          if (!prayerMap.has(p.id)) {
            prayerMap.set(p.id, p);
          }
        });
        const newPrayers = Array.from(prayerMap.values());
        // 如果新数据数量与之前一致，则说明没有新增，停止懒加载
        if (newPrayers.length === prayers.length) {
          setHasMore(false);
        } else {
          setPrayers(newPrayers);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching prayers:", error);
    }
  };

  // 初次加载
  useEffect(() => {
    fetchPrayers();
  }, []);

  // 懒加载：当滚动到页面底部时触发
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasMore
    ) {
      fetchPrayers();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, prayers]);

 

  // 响应式 masonry 布局断点设置
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };
  const handleHeaderLanguageChange = (newLang: "t_cn" | "t_kjv") => {
    setLanguage(newLang);
    if (user) {
      const payload = { ...user, language: newLang };
      fetch("https://withelim.com/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Language updated via header", data);
          // 如果后端返回更新后的用户数据，则更新本地状态
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => console.error("更新语言失败", err));
    }
  };

  // Header 中退出登录回调
  const handleHeaderLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };
  if (loading) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px", textAlign: "center" }}>
        {language === "t_cn" ? "加载中..." : "Loading..."}
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, minHeight: "100vh", padding: "0"  }}>
       {/* Header 组件 */}
       <Header user={user} onLanguageChange={handleHeaderLanguageChange} onLogout={handleHeaderLogout} />
        
      <h2 style={{paddingTop:"150px"}}>
        {/* 返回按钮 */}
        <div onClick={() => navigate("/")} style={{ position: "relative", fontSize: "20px", cursor: "pointer",width:"90px",left:"20px" }}>
            <IoArrowBackCircleOutline style={{ position: "absolute", top: "7px", left: "0" }} />
            <span style={{ fontWeight: "normal" }}>
              {language === "t_cn" ? "返回" : "Back"}
            </span>
          </div>
        {language==="t_cn"?"公共祷告墙":"Public Prayers wall"}</h2>
      
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {prayers.map((prayer) => (
          <PrayerCard key={prayer.id} prayer={prayer} currentUser={user} />
        ))}
      </Masonry>
      {!hasMore && <p>
        {language === "t_cn" ? "没有更多祷告了。" : "No more prayers."}</p>}
    </div>
  );
};

export default PrayerPage;

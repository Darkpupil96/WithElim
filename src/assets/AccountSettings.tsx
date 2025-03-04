import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { MdPhotoCamera } from "react-icons/md";
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

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 用户信息状态
  const [user, setUser] = useState<UserInfo | null>(null);
  // 表单：更新用户名
  const [username, setUsername] = useState<string>("");
  // 表单：更新语言
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  // 控制头像悬停状态
  const [avatarHover, setAvatarHover] = useState<boolean>(false);

  // 更新提示消息状态
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);

  // 获取用户信息
  const fetchUser = async () => {
    if (!token) return;
    try {
      const response = await fetch("https://withelim.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setUsername(data.username);
        setLanguage(data.language);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 处理头像文件选择并自动上传
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const response = await fetch("https://withelim.com/api/auth/upload-avatar", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          // 显示更新提示
          setUpdateMessage(
            language === "t_cn"
              ? "你已成功更改信息"
              : "You have successfully updated your information"
          );
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 1000);
        }
      } catch (error) {
        console.error("上传头像失败:", error);
      }
    }
  };

  // 更新用户名 & 语言
  const handleProfileUpdate = async () => {
    if (!username) return;
    try {
      const payload = { username, language };
      const response = await fetch("https://withelim.com/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Profile updated", data);
      fetchUser();
      // 显示更新提示
      setUpdateMessage(
        language === "t_cn"
          ? "你已成功更改信息"
          : "You have successfully updated your information"
      );
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1000);
    } catch (error) {
      console.error("更新资料失败:", error);
    }
  };

  // Header 中的语言切换回调
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
          fetchUser();
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

  // 提示消息样式：从左边滑入，1s后淡出
  const messageStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "43%",
    left: showMessage ? "42%" : "-100%",
    opacity: showMessage ? 1 : 0,
    transition: "all 1s ease",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: 2000,
  };

  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, minHeight: "100vh", padding: "0" }}>
      {/* Header 组件 */}
      <Header user={user} onLanguageChange={handleHeaderLanguageChange} onLogout={handleHeaderLogout} />
       

      {/* 更新提示信息 */}
      {showMessage && <div style={messageStyle}>{updateMessage}</div>}

      {/* 账户设置主体 */}
      <div style={{ padding: "100px 20px 20px 20px", maxWidth: "600px", margin: "0 auto" }}>
        
         <br />
         <br />
         <br />
        <div style={{ fontSize:"36px",fontWeight:"bold", textAlign:"left" }}>
             {/* 返回按钮 */}
             <div  onClick={() => navigate("/") } style={{ position:"relative",fontSize: "20px",cursor:"pointer"}}>
                <IoArrowBackCircleOutline style={{position:"absolute",top:"7px",left:"0"}}
            />
            
            <span style={{fontWeight:"normal",marginLeft:"23px"}}>{language === "t_cn" ? "返回" : "Back"}</span>
            </div>

          {language === "t_cn" ? "账户设置" : "Account Settings"}
        </div>
        <p style={{ marginBottom: "10px",fontSize:"18px", textAlign:"left",opacity:"0.6" }}>
          {language === "t_cn" ? "用户信息" : "User Info"}
        </p>

        {user ? (
          <>
            {/* 用户 Profile Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f3f3f3",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              {/* 头像容器：悬停时显示遮罩和图标 */}
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  marginRight: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("avatarInput")?.click()}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <img
                  src={user.avatar}
                  alt="Profile pic"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: avatarHover ? 1 : 0,
                    transition: "opacity 0.3s",
                    zIndex: 2,
                  }}
                >
                  <MdPhotoCamera style={{ color: "white", fontSize: "24px", zIndex: 3 }} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id="avatarInput"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div style={{ lineHeight: 1.6 }}>
                <div>
                  <strong>{language === "t_cn" ? "用户名：" : "Username:"}</strong> {user.username}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>{language === "t_cn" ? "语言：" : "Language:"}</strong>{" "}
                  {user.language === "t_cn" ? "中文" : "English"}
                </div>
              </div>
            </div>

            {/* 更新用户名和语言 */}
            <div style={{ marginBottom: "20px",textAlign:"left" }}>
              <label>{language === "t_cn" ? "用户名:" : "Username:"}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginLeft: "10px",width:"20%" }}
              />
                <div style={{height:"20px"}}></div>
              <label>{language === "t_cn" ? "语言:" : "Language:"}</label>
              <select
                style={{ marginLeft: "10px" }}
                value={language}
                onChange={(e) => setLanguage(e.target.value as "t_cn" | "t_kjv")}
              >
                <option value="t_kjv">English</option>
                <option value="t_cn">中文</option>
              </select>
              <button 
              className="submitButton"
              onClick={handleProfileUpdate} style={{width: "120px",position:"relative",left:"130px",top:"-6px"}}>
                {language === "t_cn" ? "更新资料" : "Update"}
              </button>
            </div>
          </>
        ) : (
          <p>{language === "t_cn" ? "请先登录" : "Please log in."}</p>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;

import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { MdPhotoCamera } from "react-icons/md";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";

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
  // 表单：更新邮箱
  const [email, setEmail] = useState<string>("");
  // 表单：更新语言
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  // 新增：原密码与新密码状态
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  // 控制密码显示的状态
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // 控制头像悬停状态
  const [avatarHover, setAvatarHover] = useState<boolean>(false);
  // 更新提示消息状态
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);

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
        setUsername(data.username);
        setEmail(data.email);
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

// 更新用户名、邮箱及密码
const handleProfileUpdate = async () => {
  if (!username || !email) return;
  
  // 如果更新密码，则必须提供旧密码
  if (newPassword !== ""&& !oldPassword) {
    setUpdateMessage(
      language === "t_cn"
        ? "更新密码需要提供原密码"
        : "Original password is required to update password"
    );
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
    return;
  }

  const payload: any = { username };

  // 如果用户更改了邮箱，则加入 email 字段（不依赖于密码更新）
  if (user && email !== user.email) {
    payload.email = email;
  }
  
  // 如果输入了新密码（非空），则要求旧密码，并加入密码相关字段
  if (newPassword && newPassword.trim() !== "") {
    if (!oldPassword) {
      setUpdateMessage(
        language === "t_cn"
          ? "更新密码需要提供原密码"
          : "Original password is required to update password"
      );
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }
    payload.newPassword = newPassword;
    payload.oldPassword = oldPassword;
  }
  
  try {
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
    if (data.error) {
      setUpdateMessage(data.error);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }
    fetchUser();
    setUpdateMessage(
      language === "t_cn"
        ? "你已成功更改信息"
        : "You have successfully updated your information"
    );
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 1000);
    // 清空密码输入框
    setOldPassword("");
    setNewPassword("");
  } catch (error) {
    console.error("更新资料失败:", error);
  }
};


  const handleHeaderLanguageChange = (newLang: "t_cn" | "t_kjv") => {
    setLanguage(newLang);
    fetch("https://withelim.com/api/auth/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language: newLang }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Language updated via header", data);
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("更新语言失败", err));
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

  if (loading) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px", textAlign: "center" }}>
        {language === "t_cn" ? "加载中..." : "Loading..."}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, minHeight: "100vh", padding: "0" }}>
      {/* Header 组件 */}
      <Header user={user} onLanguageChange={handleHeaderLanguageChange} onLogout={handleHeaderLogout} />

      {/* 更新提示信息 */}
      {showMessage && <div style={messageStyle}>{updateMessage}</div>}

      {/* 账户设置主体 */}
      <div style={{ padding: "100px 20px 20px 20px", maxWidth: "600px", margin: "0 auto", overflow: "hidden" }}>
        <br />
        <br />
        <br />
        <div style={{ fontSize: "36px", fontWeight: "bold", textAlign: "left" }}>
          {/* 返回按钮 */}
          <div onClick={() => navigate("/")} style={{ position: "relative", fontSize: "20px", cursor: "pointer" }}>
            <IoArrowBackCircleOutline style={{ position: "absolute", top: "7px", left: "0" }} />
            <span style={{ fontWeight: "normal", marginLeft: "23px" }}>
              {language === "t_cn" ? "返回" : "Back"}
            </span>
          </div>
          {language === "t_cn" ? "账户设置" : "Account Settings"}
        </div>
        <p style={{ marginBottom: "10px", fontSize: "18px", textAlign: "left", opacity: "0.6" }}>
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
                  width: "100px",
                  aspectRatio: "1 / 1",
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
              <div style={{ lineHeight: 2 }}>
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

            {/* 更新用户名、邮箱及密码 */}
            <div style={{ marginBottom: "20px", textAlign: "left"}}>
              <label style={{fontSize:"13px"}}>{language === "t_cn" ? "用户名" : "Username"}</label> <br />
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </div>
              <div style={{ height: "20px" }}></div>
              <label style={{fontSize:"13px"}}>{language === "t_cn" ? "邮箱" : "Email"}</label> <br />
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </div>
              <div style={{ height: "20px" }}></div>
              <label style={{fontSize:"13px"}}>{language === "t_cn" ? "原密码" : "Current Password"}</label> <br />
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    marginLeft: "-50px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showOldPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </button>
              </div>
              <div style={{ height: "20px" }}></div>
              <label style={{fontSize:"13px"}}>{language === "t_cn" ? "新密码" : "New Password"}</label> <br />
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    marginLeft: "-50px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showNewPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </button>
              </div>
              <button
                className="submitButton"
                onClick={handleProfileUpdate}
                style={{ width: "120px", position: "relative", left: "0px", top: "20px" }}
              >
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



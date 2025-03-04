import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WithElimLogo2 from "../../public/WithElimLogo2.png";

interface HeaderProps {
  user: {
    id: number;
    username: string;
    avatar: string;
    language: "t_cn" | "t_kjv";
  } | null;
  onLanguageChange: (lang: "t_cn" | "t_kjv") => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLanguageChange, onLogout }) => {
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">(user ? user.language : "t_kjv");

  const handleLanguageChange = (newLang: "t_cn" | "t_kjv") => {
    setLanguage(newLang);
    onLanguageChange(newLang);
    setShowSettingsMenu(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowSettingsMenu(false);
  };

  return (
    <header
      style={{
        boxSizing: "border-box",
        padding: "20px 10vw 0 10vw",
        width: "100vw",
        height:"auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        position:"fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: "1px solid #ccc",
      }}
    >
      {/* Logo */}
      <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <img src={WithElimLogo2} alt="WithElim" height="100" />
      </div>

      {/* 右侧导航 */}
      <div style={{ position: "fixed", height:"100%",top:"40px",right:"70px" }}>
        {user ? (
          <img
            src={user.avatar || "https://withelim.com/media/default-avatar.png"}
            alt="avatar"
            style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: "999"
            }}
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          />
        ) : (
          <button onClick={() => navigate("/login")}>
            {language === "t_cn" ? "登录" : "Login"}
          </button>
        )}
        {showSettingsMenu && (
          <div
            onClick={() => setShowSettingsMenu(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "transparent",
              zIndex: 955,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "93px",
                right: "30px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: "200px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 999,
              }}
            >
                            {/* 未登录状态 */}
                            {!user && (
                <div style={{ padding: "10px", textAlign: "left" }}>
                  {/* 语言切换 */}
                  <div>
                    <label style={{ fontWeight: "bold" }}>
                      {language === "t_cn" ? "语言：" : "Language:"}
                    </label>
                    <select
                      value={language}
                      onChange={(e) =>{
                        handleLanguageChange(e.target.value as "t_cn" | "t_kjv");
                        setShowSettingsMenu(false);
                      }
                    }
                      style={{ marginLeft: "5px" }}
                    >
                      <option value="t_kjv">English</option>
                      <option value="t_cn">中文</option>
                    </select>
                  </div>
                  <hr style={{ margin: "10px 0" }} />
                  {/* Login 按钮 */}
                  <div className="navSelected"
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "none",
                      paddingLeft:"5px"
                    }}
                    onClick={() => {
                      setShowSettingsMenu(false);
                      navigate("/login",{ state: { language } });
                      
                    }}
                  >
                    {language === "t_cn" ? "登录" : "Login"}
                  </div>
                </div>
              )}

              {/* 已登录状态 */}
              {user && (
                <div style={{ padding: "13px",textAlign: "left",lineHeight:"2rem" }}>
                            <span style={{fontWeight:"bold",color:"#388683"}}>{user?.username}</span>
                  <div>
                    <label style={{ fontWeight: "bold" }}>
                      {language === "t_cn" ? "语言：" : "Language:"}
                    </label>
                    <select
                      value={language}
                      onChange={(e) =>{
                        handleLanguageChange(e.target.value as "t_cn" | "t_kjv");
                        setShowSettingsMenu(false);
                      }
                      }
                      style={{ marginLeft: "5px" }}
                    >
                      <option value="t_kjv">English</option>
                      <option value="t_cn">中文</option>
                    </select>
                  </div>
                  <hr style={{ margin: "10px 0" }} />

                  <div className="navSelected"
                    style={{
                      cursor: "pointer",

                      textDecoration: "none",
                      marginBottom: "8px",
                      paddingLeft:"5px"
                    }}
                    onClick={() => {
                      setShowSettingsMenu(false);
                      navigate("/account-settings");
                    }}
                  >
                    {language === "t_cn" ? "账户设置" : "Account Settings"}
                  </div>
                  <div className="navSelected"
                    style={{
                      cursor: "pointer",

                      textDecoration: "none",
                      marginBottom: "8px",
                      paddingLeft:"5px"
                    }}
                    onClick={() => {
                      setShowSettingsMenu(false);
                      navigate("/my-prayers");
                    }}
                  >
                    {language === "t_cn" ? "我的祷告" : "My Prayers"}
                  </div>
                  <div className="navSelected"
                    style={{ cursor: "pointer", color: "red", textDecoration: "none" ,paddingLeft:"5px"}}
                    onClick={() => {
                      setShowSettingsMenu(false);
                      handleLogout();
                    }}
                  >
                    {language === "t_cn" ? "退出登录" : "Sign out"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

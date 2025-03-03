import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FriendList from "./FriendList.tsx";
import { FaChevronLeft,FaChevronRight } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import WithElimLogo2 from "../../public/WithElimLogo2.png";


interface VerseItem {
  verse: number | string;
  text: string;
}

interface ResultData {
  bookName: string;
  chapterText: string;
  verses: string;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  language: string; // "t_kjv" 或 "t_cn"
}
//窗口检测宽度
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
const BibleApp: React.FC = () => {
  // ==================【状态定义】==================
  const navigate = useNavigate();

  // 用户信息（登录后从 /api/auth/me 获取）
  const [user, setUser] = useState<UserInfo | null>(null);

  // 语言：默认英文（"t_kjv"），如果用户已登录并有 language，则用用户的 language
  const [language, setLanguage] = useState<"t_kjv" | "t_cn">("t_kjv");

  // 用于控制头像点击后设置弹窗是否显示
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // 用于控制右下角朋友列表的展开/收起
  const [showFriendList, setShowFriendList] = useState<boolean>(false);

  // ==================【书卷和章节数据】==================
  // 英文书卷及章节数
  const booksAndChaptersEn: { [key: string]: number } = {
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36,
    "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4,
    "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25,
    "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13,
    "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31,
    "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
    "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12,
    "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
    "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3,
    "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28,
    "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
    "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4,
    "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6,
    "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
    "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5,
    "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
  };

  // 中文书卷及章节数（顺序与英文对应）
  const booksAndChaptersCn: { [key: string]: number } = {
    "创世记": 50, "出埃及记": 40, "利未记": 27, "民数记": 36,
    "申命记": 34, "约书亚记": 24, "士师记": 21, "路得记": 4,
    "撒母耳记上": 31, "撒母耳记下": 24, "列王纪上": 22, "列王纪下": 25,
    "历代志上": 29, "历代志下": 36, "以斯拉记": 10, "尼希米记": 13,
    "以斯帖记": 10, "约伯记": 42, "诗篇": 150, "箴言": 31,
    "传道书": 12, "雅歌": 8, "以赛亚书": 66,
    "耶利米书": 52, "耶利米哀歌": 5, "以西结书": 48, "但以理书": 12,
    "何西阿书": 14, "约珥书": 3, "阿摩司书": 9, "俄巴底亚书": 1, "约拿书": 4,
    "弥迦书": 7, "那鸿书": 3, "哈巴谷书": 3, "西番雅书": 3,
    "哈该书": 2, "撒迦利亚书": 14, "玛拉基书": 4, "马太福音": 28,
    "马可福音": 16, "路加福音": 24, "约翰福音": 21, "使徒行传": 28,
    "罗马书": 16, "哥林多前书": 16, "哥林多后书": 13, "加拉太书": 6,
    "以弗所书": 6, "腓立比书": 4, "歌罗西书": 4,
    "帖撒罗尼迦前书": 5, "帖撒罗尼迦后书": 3, "提摩太前书": 6,
    "提摩太后书": 4, "提多书": 3, "腓利门书": 1, "希伯来书": 13,
    "雅各书": 5, "彼得前书": 5, "彼得后书": 3, "约翰一书": 5,
    "约翰二书": 1, "约翰三书": 1, "犹大书": 1, "启示录": 22
  };

  // 书卷、章节及经文内容状态
  const [selectedBook, setSelectedBook] = useState<string>("1");
  const [selectedChapter, setSelectedChapter] = useState<string>("1");
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // ==================【工具函数】==================
  // 数字转换成中文数字（仅支持 1-99）
  const convertToChineseNumeral = (num: number): string => {
    const numerals = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    if (num < 10) {
      return numerals[num];
    } else if (num < 20) {
      return "十" + (num % 10 === 0 ? "" : numerals[num % 10]);
    } else {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      return numerals[tens] + "十" + (ones === 0 ? "" : numerals[ones]);
    }
  };

  // ==================【API 请求】==================
  // 获取当前登录用户信息
  const [userFetched, setUserFetched] = useState<boolean>(false);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("https://withelim.com/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        // 根据用户语言更新状态
        if (data.language === "t_cn") {
          setLanguage("t_cn");
        } else {
          setLanguage("t_kjv");
        }
        // 标记用户信息已经加载完成
        setUserFetched(true);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };
  
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    // 只有当用户信息加载完成后才调用获取经文的函数
    if (userFetched) {
      fetchAndDisplayResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFetched, language, selectedBook, selectedChapter]);

  // 获取经文
  const fetchAndDisplayResult = (): void => {
    const apiUrl = `https://withelim.com/api/bible?book=${selectedBook}&chapter=${selectedChapter}&v=${language}`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // 拼接每节经文：[verse] text
        const versesString = data.verses.map((item: VerseItem) => (
          <p key={item.verse} style={{ textAlign: "left", width: "60%", paddingLeft: "20%" }}>
            <span style={{ fontSize: "0.6rem" }}>[{item.verse}]</span> {item.text}
          </p>
        ));
        

        // 根据当前语言获取书卷名称
        const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
        const bookNames = Object.keys(booksMapping);
        const bookIndex = parseInt(selectedBook, 10) - 1;
        const selectedBookName = bookNames[bookIndex] || "";

        // 构造章节显示文本
        const chapterText =
          language === "t_cn"
            ? "第" + convertToChineseNumeral(parseInt(selectedChapter, 10)) + "章"
            : "Chapter " + selectedChapter;

        setResultData({
          bookName: selectedBookName,
          chapterText,
          verses: versesString,
        });
      })
      .catch((error) => console.error("请求错误:", error));
  };

  // ==================【副作用】==================
  useEffect(() => {
    // 初次加载时先检查是否有登录用户
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // 每次 language / selectedBook / selectedChapter 改变时，刷新经文
    fetchAndDisplayResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, selectedBook, selectedChapter]);

  // ==================【事件处理】==================
  // 切换到上一章
  const handlePrevChapter = (): void => {
    const currentChapter = parseInt(selectedChapter, 10);
    if (currentChapter === 1) {
      alert(language === "t_cn" ? "已经是第一章" : "Already at the first chapter");
    } else {
      setSelectedChapter((currentChapter - 1).toString());
    }
  };

  // 切换到下一章
  const handleNextChapter = (): void => {
    const currentChapter = parseInt(selectedChapter, 10);
    const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
    const bookNames = Object.keys(booksMapping);
    const currentBookName = bookNames[parseInt(selectedBook, 10) - 1];
    const maxChapter = booksMapping[currentBookName];
    if (currentChapter >= maxChapter) {
      alert(language === "t_cn" ? "已经是最后一章" : "Already at the last chapter");
    } else {
      setSelectedChapter((currentChapter + 1).toString());
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("token"); // 清除 token
    setUser(null); // 清空用户信息
    setLanguage(language); // 保留当前语言
    navigate("/"); // 跳转到首页
  };

  // 切换语言（此处仅切换前端；若需保存到后端，则需调用 /api/auth/update）
  const handleLanguageChange = (newLang: "t_cn" | "t_kjv") => {
    setLanguage(newLang);

    // 如果用户已登录，可在此发送请求更新用户的语言偏好
    if (user) {
      const token = localStorage.getItem("token");
      fetch("https://withelim.com/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...user,
          language: newLang,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          // 这里也可以更新本地的 user 状态
          setUser((prev) => (prev ? { ...prev, language: newLang } : null));
        })
        .catch((err) => console.error("更新语言失败", err));
    }
  };

  // ==================【渲染逻辑】==================
  // 根据当前语言获取对应的书卷映射
  const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
  const bookNames = Object.keys(booksMapping);

  // 根据当前选中书卷获取章节数
  const chaptersCount: number = booksMapping[bookNames[parseInt(selectedBook, 10) - 1]] || 0;
  const chapterOptions = Array.from({ length: chaptersCount }, (_, i) => i + 1);

  //
  const windowWidth = useWindowWidth();

  // ==================【JSX】==================
  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, minHeight: "100vh",padding:"0 0 0 0" }} >
      {/* 顶部导航栏 */}
      <header 
        style={{
          boxSizing: "border-box",
          padding: "20px 0 0 0",
          width: "100vw",
          height:"auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
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
        {/* 左上角LOGO和名称 */}
        <div style={{ 
          width:"80%",
          height:"50%", 
          display: "flex", 
          flexDirection:"row",
          justifyContent: "space-between",
          justifyItems:"center"
          }}>
        <div
          style={{ cursor: "pointer", fontSize: "20px",fontWeight: "bold" }}
        >
                <img onClick={() => navigate("/")} src={WithElimLogo2} alt="WithElim" height="100px"/>
        </div>
        {!user&&  (windowWidth >= 1638)&&// 未登录状态

(<div style={{display: "flex", flexDirection: "row",justifyContent: "space-between",width:"170px",height:"5%",position:"fixed",right:"10vw",paddingTop:"24px" }}> 
<button
  onClick={() =>
    navigate("/login", { state: { isRegistering: false,language } })
  }
>
  {language === "t_cn" ? "登录":"Login"}
  </button>
 &nbsp;&nbsp;&nbsp;&nbsp;
 <button
  onClick={() =>
    navigate("/login", { state: { isRegistering: true,language  } })
  }
>
  {language === "t_cn" ? "注册":"Register"}</button>
 </div>
)
 }
        {/* 右上角头像及设置菜单 */}
        <div style={{ position: "fixed", height:"100%",top:"40px",right:"70px" }}>
          
          <img 
            src={
              user?.avatar
                ? user.avatar
                : "https://withelim.com/media/default-avatar.png" // 默认头像
            }
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


          {showSettingsMenu && (
            <div // 点击空白处关闭设置菜单
            onClick={() => {setShowSettingsMenu(false);console.log("clicked")}}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 955,
              background: "transparent", // 或者半透明背景色
            }}
          >
            
            <div
            onClick={(e) => e.stopPropagation()} // 阻止冒泡
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
                    {language === "t_cn" ? "退出登录" : "Logout"}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
        </div>
        {/* 书卷下拉框 */}
<div style={{ boxSizing:"border-box",height:"30%"}}>
<label htmlFor="bookSelect">
          {language === "t_cn" ? "书卷：" : "Book:"}
        </label>
        <select
          id="bookSelect"
          value={selectedBook}
          onChange={(e) => {
            setSelectedBook(e.target.value);
            setSelectedChapter("1");
          }}
          style={{ margin: "0 10px 10px 5px" }}
        >
          {bookNames.map((bookName, index) => (
            <option key={index} value={(index + 1).toString()}>
              {bookName}
            </option>
          ))}
        </select>
        &nbsp;&nbsp;&nbsp;&nbsp;
        {/* 章节下拉框 */}
     
        <label htmlFor="chapterSelect">
          {language === "t_cn" ? "章节：" : "Chapter:"}
        </label>
        <select
          id="chapterSelect"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          style={{ margin: "0 10px 10px 5px" }}
        >
          {chapterOptions.map((num) => (
            <option key={num} value={num.toString()}>
              {language === "t_cn"
                ? "第" + convertToChineseNumeral(num) + "章"
                : "Chapter " + num}
            </option>
          ))}
        </select>
        </div>

      </header>

      {/* 中间主体（圣经内容） */}
      <main style={{ 
        paddingTop:"140px", 
        textAlign: "center",
        
        }}>
        {/* 显示返回结果 */}
        <div
          id="result"
          style={{
            marginTop: "20px",
            padding: "10px",

          }}
        >
          {resultData && (
            <>
              <h3>
                {resultData.bookName}: {resultData.chapterText}
              </h3>
              <div>{resultData.verses}</div>
            </>
          )}
        </div>
       
      </main>
 {/* 上一章 / 下一章 按钮 */}
 <div
  style={{
    display: "flex",
    position: "fixed",
    zIndex: 1000,
    width: windowWidth < 1000 ? "90vw" : "60vw",
    justifyContent: "space-between",
    top: "50vh",
    left: windowWidth < 1000 ? "5vw" : "20vw",
  }}
>
          <button onClick={handlePrevChapter} style={{ marginRight: "10px",width:"50px",height:"50px",borderRadius:"50%",padding:"0 0 0 0" }}>
        <FaChevronLeft/>
          </button>
          <button onClick={handleNextChapter} style={{ marginRight: "10px",width:"50px",height:"50px",borderRadius:"50%",padding:"0 0 0 0"  }}>
          <FaChevronRight/>
          </button>
        </div>

      {/* 右下角悬浮“朋友列表” */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 1001,
          textAlign: "left",
        }}
      >
        {/* 气泡按钮 */}
        <div className="Selected"
          onClick={() => setShowFriendList(!showFriendList)}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#388683",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <span style={{ fontSize: "24px" }}><IoChatbubbleEllipsesOutline/></span>
        </div>

        {/* 朋友列表展开 */}
        {showFriendList && (
           <div
           onClick={() => {
             setShowFriendList(false);
           }}
           style={{
             position: "fixed",
             top: 0,
             left: 0,
             width: "100vw",
             height: "100vh",
             zIndex: 955,
             background: "transparent", // 或半透明背景色
           }}
         >
         
  <div  onClick={(e) => e.stopPropagation()} // 阻止冒泡
    style={{
      position: "absolute",
      right: "50px",
      bottom: "80px",
      width: "150px",
      maxHeight: "300px",
      overflowY: "auto",
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      padding: "10px",
    }}
  >
    {!user ? (
      <div style={{ color: "#999" }} >
       <div>
  {language === "t_cn" ? (
    <>
      请先
      <span
        style={{ color: "blue", cursor: "pointer", marginLeft: "4px" }}
        onClick={() => navigate("/login",{ state: { language } })}
      >
        登录
      </span>
    </>
  ) : (
    <>
      Please
      <span
        style={{ color: "blue", cursor: "pointer", marginLeft: "4px" }}
        onClick={() => navigate("/login", { state: { language } })}
      >
        log in
      </span>
    </>
  )}
</div>
      </div>
    ) : (
      <>
        <h4 style={{ marginTop: 0, textAlign: "left" }}>
          {language === "t_cn" ? "朋友列表" : "Friend List"}
        </h4>
        <FriendList user={user}/>
      </>
    )}
  </div>
  </div>
)}
      </div>
    </div>
  );
};

export default BibleApp;

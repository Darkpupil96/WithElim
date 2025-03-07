import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FriendList from "./FriendList.tsx";
import SearchBar from "../components/SearchBar.tsx";
import { FaChevronLeft,FaChevronRight } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import WithElimLogo2 from "../../public/WithElimLogo2.png";
import { useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";


interface VerseItem {
  verse: number | string;
  text: string;
}
interface Verse {
  version: string;
  b: number;
  c: number;
  v: number;
  t: string;
}
interface BibleAppProps {
  verseSearching: Verse | null;
  onClearVerseSearching: () => void;
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
const BibleApp: React.FC<BibleAppProps> = ({ verseSearching,onClearVerseSearching }) => {
  // ==================【状态定义】==================
  const navigate = useNavigate();
  const location = useLocation();

//定位到搜索的内容
useLayoutEffect(() => {
  if (location.hash) {
    const elementId = location.hash.replace("#", "");
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}, [location.hash]);
  //检测是否通过搜索更改verses

  // 用户信息（登录后从 /api/auth/me 获取）
  const [user, setUser] = useState<UserInfo | null>(null);

  // 语言：默认英文（"t_kjv"），如果用户已登录并有 language，则用用户的 language
  const [language, setLanguage] = useState<"t_kjv" | "t_cn">(verseSearching?.version==="t_cn"?"t_cn":"t_kjv");


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
  const [selectedBook, setSelectedBook] = useState<string>(
    verseSearching?.b?.toString() ?? "1"
  );
  
  const [selectedChapter, setSelectedChapter] = useState<string>(
     verseSearching?.c?.toString() ?? "1"
  );

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
        // 根据用户阅读记录自动更新选中的书卷和章节
        if (data.reading_book && data.reading_chapter) {
          setSelectedBook(data.reading_book.toString());
          setSelectedChapter(data.reading_chapter.toString());
        }
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
  
  


const fetchAndDisplayResult = (): void => {
  const apiUrl = `https://withelim.com/api/bible?book=${selectedBook}&chapter=${selectedChapter}&v=${language}`;
  {fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // 拼接每节经文：[verse] text
      const versesString = data.verses.map((item: VerseItem) => {
    
        // 判断是否为当前选中的经文
        
        const isSelected = item.text === verseSearching?.t;
        return (
          <p
            key={item.verse}
            onClick={() => {handleVerseClick(item)}}
            style={{
              borderRadius:"5px",
              padding:"5px",
              textAlign: "left",
              width: "60%",
              marginLeft: "20%",
              zIndex: 950,
              cursor: "pointer",
              backgroundColor: isSelected ? "#6e8180" : "inherit",
              color: isSelected ? "white" : "inherit",
            }}
          >
            <span style={{ fontSize: "0.6rem" }}>[{item.verse}]</span>{" "}
            <span className="prayerVerse">{item.text}</span>
          </p>
        );
    });

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
}};


//prayer 提交

  // Prayer 状态
  const [prayerOpen, setPrayerOpen] = useState<boolean>(false);
// 在组件最上方添加状态变量
const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const [prayerTitle, setPrayerTitle] = useState<string>("");
  const [prayerText, setPrayerText] = useState<string>("");
  const [selectedVerse, setSelectedVerse] = useState<number | string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  // 点击 verse 时打开 prayer 弹窗
  const handleVerseClick = (Item:VerseItem) => {
    if (!user) {
      alert(language === "t_cn" ? "请先登录后再提交祷告。" : "Please log in before submitting a prayer.");
      return;
    }

    setSelectedVerse(Item.verse);
    setSelectedText(Item.text);
    setPrayerTitle("");
    setPrayerText("");
    setPrayerOpen(true);
  };

  // 提交 prayer 到 API
  const handlePrayerSubmit = async () => {
    if (!user || !selectedVerse || !prayerTitle.trim() || !prayerText.trim()) return;
    try {
      const payload = {
        title: prayerTitle,
        content: prayerText,
        is_private: isPrivate,
        verses: [
          {
            version: language,
            b: parseInt(selectedBook, 10),
            c: parseInt(selectedChapter, 10),
            v: parseInt(selectedVerse.toString(), 10),
          },
        ],
      };
      const response = await fetch("https://withelim.com/api/prayers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(language === "t_cn" ? "祷告已提交！" : "Prayer submitted successfully!");
        setPrayerOpen(false);
        setPrayerTitle("");
        setPrayerText("");
      } else {
        alert(language === "t_cn" ? "提交失败，请重试。" : "Submission failed, please try again.");
      }
    } catch (error) {
      console.error("提交祷告失败:", error);
      alert(language === "t_cn" ? "网络错误，请稍后再试。" : "Network error, please try again later.");
    }
  };

  
  // ==================【副作用】==================
  useEffect(() => {
    // 初次加载时先检查是否有登录用户
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // 只有当用户信息加载完成后才调用获取经文的函数
    if (userFetched) {
      fetchAndDisplayResult();
    }
     // 只有在用户已登录且用户信息加载完成时才更新阅读记录
    if (!verseSearching&&user && user.id) {
      // 构造更新阅读记录的 API URL
      const updateUrl = `https://withelim.com/api/auth/update-reading`;
      const token = localStorage.getItem("token");
  
      // 构造请求体：当前选中的书卷和章节
      const payload = {
        reading_book: parseInt(selectedBook, 10),
        reading_chapter: parseInt(selectedChapter, 10),
      };
  
      fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("阅读进度更新成功:", data);
        })
        .catch((err) => {
          console.error("更新阅读进度失败:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFetched, language, selectedBook, selectedChapter]);



  // ==================【事件处理】==================
  // 切换到上一章
  const handlePrevChapter = (): void => {
    onClearVerseSearching();
    const currentChapter = parseInt(selectedChapter, 10);
    // 当前书卷号是 1-indexed，转换为 0-indexed
    const currentBookIndex = parseInt(selectedBook, 10) - 1;
    // 根据当前语言获取对应的书卷和章节映射
    const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
    const bookNames = Object.keys(booksMapping);
  
    if (currentChapter === 1) {
      if (currentBookIndex === 0) {
        alert(language === "t_cn" ? "已经是第一章" : "Already at the first chapter");
      } else {
        // 退到上一本：上一本的索引为 currentBookIndex - 1
        const newBookIndex = currentBookIndex - 1;
        // 获取上一书卷的章节数作为最后一章
        const lastChapter = booksMapping[bookNames[newBookIndex]];
        // 更新状态：书卷和章节
        setSelectedBook((newBookIndex + 1).toString());
        setSelectedChapter(lastChapter.toString());
      }
    } else {
      setSelectedChapter((currentChapter - 1).toString());
    }
  };

  // 切换到下一章
  const handleNextChapter = (): void => {
    onClearVerseSearching();
    const currentChapter = parseInt(selectedChapter, 10);
    const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
    const bookNames = Object.keys(booksMapping);
    const currentBookName = bookNames[parseInt(selectedBook, 10) - 1];
    const maxChapter = booksMapping[currentBookName];
    if (currentChapter >= maxChapter) {
      if (currentBookName === bookNames[bookNames.length - 1]){ alert(language === "t_cn" ? "已经是最后一章" : "Already at the last chapter");}
      else {
        setSelectedBook((parseInt(selectedBook, 10) + 1).toString());
        setSelectedChapter("1");
      }
     
    } else {
      setSelectedChapter((currentChapter + 1).toString());
    }
  };

  // 当点击 VerseSearch 卡片时，更新状态，并跳转到主页定位到对应章节
  const handleSearchResultSelect = (verse: Verse) => {

   
    if (verse.version === "t_cn" || verse.version === "t_kjv") {
      setLanguage(verse.version);
    } else {
      // 给个兜底逻辑，例如默认英文
      setLanguage("t_kjv");
    };
    setSelectedBook(String(verse.b));
    setSelectedChapter(String(verse.c));
    const verseKey = `${verse.b}-${verse.c}-${verse.v}`;

       // 构造更新阅读记录的 API URL
       const updateUrl = `https://withelim.com/api/auth/update-reading`;
       const token = localStorage.getItem("token");
   
       if (token){// 构造请求体：当前选中的书卷和章节
       const payload = {
         reading_book: verse.b,
         reading_chapter: verse.c,
       };
   
       fetch(updateUrl, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(payload),
       })
         .then((res) => res.json())
         .then((data) => {
           console.log("阅读进度更新成功:", data);
          // navigate(`/#${verseKey}`);
          
           localStorage.setItem("searchingResultVerse", verseKey);
          // fetchAndDisplayResult();
          
             
    
         })
         .catch((err) => {
           console.error("更新阅读进度失败:", err);
         });}
 
        

    
    
  };


  
 // 当 verseSearching 变化时触发
 useEffect(() => {
  if (verseSearching) {
    const timer = setTimeout(() => {
      console.log("传入 verseSearching:", verseSearching);
      handleSearchResultSelect(verseSearching);
    }, 300); // 300 毫秒延时，根据需要调整

    // 清除上一次的定时器
    return () => clearTimeout(timer);
  }
}, [verseSearching]);


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
          style={{ cursor: "pointer", fontSize: "20px",fontWeight: "bold",height:"auto" }}
        >
                   <img
      onClick={() => navigate("/")}
      src={WithElimLogo2}
      alt="WithElim"
      height={windowWidth < 1000 ? "70px" : "100px"}
      style={{ cursor: "pointer" , paddingTop:windowWidth<1000?"15px":"0"}}
    />
        </div>
         {/**公共祷告墙进入*/}
 <span className="prayerWallButton" style={{
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
 }} onClick={()=>{navigate("/Prayers")}}>
  {language==="t_cn"?" 祷告墙":" Prayer wall"}</span>
           {/**Search bar*/}
    
           <SearchBar placeholder={language === "t_cn" ? "请输入关键词搜索经文" : "Enter keyword to search verses"} />

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
        <div style={{ height:"auto",paddingTop:"20px" }}>
          
          <img 
            src={
              user?.avatar
                ? user.avatar
                : "https://withelim.com/media/default-avatar.png" // 默认头像
            }
            alt="avatar"
            style={{
              width:windowWidth<1000?"40px":"50px",
              height:windowWidth<1000?"40px":"50px",
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: "999"
            }}
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          />


          {showSettingsMenu && (
            <div // 点击空白处关闭设置菜单
            onClick={() => {setShowSettingsMenu(false);}}
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
                      navigate("/account-settings",{ state: { language } });
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
        {/* Prayer 弹窗 */}
      {prayerOpen && (
       <div onClick={() => setPrayerOpen(false)}
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
        <div  onClick={(e) => e.stopPropagation()} 
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
            width: "90%",
            maxWidth: "400px",
          }}
        >
          
          <h4>{language === "t_cn" ? "写下你的祷告" : "Write your prayer"}</h4>
          <p>
            {language === "t_cn"
              ? `${Object.keys(booksAndChaptersCn)[parseInt(selectedBook, 10) - 1]} 经文: 第 ${selectedChapter} 章 - 第 ${selectedVerse} 节`
              : `${Object.keys(booksAndChaptersEn)[parseInt(selectedBook, 10) - 1]} Verse: Chapter ${selectedChapter}, Verse ${selectedVerse}`}
          </p>
          <p>{`${selectedText}`}</p>
          {/* 新增：祷告标题输入 */}
          <input
            type="text"
            value={prayerTitle}
            onChange={(e) => setPrayerTitle(e.target.value)}
            placeholder={language === "t_cn" ? "祷告标题" : "Prayer Title"}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          {/* 新增：可见性设置 */}
    <div style={{ marginBottom: "10px", textAlign: "left" }}>
      <label>{language === "t_cn" ? "可见性：" : "Visibility:"}</label>
      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          name="visibility"
          checked={!isPrivate}
          onChange={() => setIsPrivate(false)}
        />
        {language === "t_cn" ? "公开" : "Public"}
      </label>
      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          name="visibility"
          checked={isPrivate}
          onChange={() => setIsPrivate(true)}
        />
        {language === "t_cn" ? "私密" : "Private"}
      </label>
    </div>
          <textarea
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: "10px" }}
            placeholder={language === "t_cn" ? "请输入你的祷告内容" : "Enter your prayer here"}
          ></textarea>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setPrayerOpen(false)}>
              {language === "t_cn" ? "取消" : "Cancel"}
            </button>
            <button onClick={handlePrayerSubmit}>
              {language === "t_cn" ? "提交" : "Submit"}
            </button>
          </div>
        </div>
        </div>
      )}

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

          <button onClick={handlePrevChapter} style={{ 
            position: "fixed",
            bottom: "50vh",
            left:windowWidth<1596?"5vw":"20vw",
            zIndex: 900,
            marginRight: "10px",width:"50px",height:"50px",borderRadius:"50%",padding:"0 0 0 0" }}>
        <FaChevronLeft/>
          </button>
          <button onClick={handleNextChapter} style={{ 
                        position: "fixed",
                        bottom: "50vh",
                        right:windowWidth<1596?"5vw":"20vw",
                        zIndex: 900,
            marginRight: "10px",width:"50px",height:"50px",borderRadius:"50%",padding:"0 0 0 0"  }}>
          <FaChevronRight/>
          </button>


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

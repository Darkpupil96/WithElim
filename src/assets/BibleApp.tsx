import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FriendList from "./FriendList.tsx";
import SearchBar from "../components/SearchBar.tsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaNotesMedical } from "react-icons/fa6";
import WithElimLogo2 from "../../public/WithElimLogo2.png";

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
interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  language: string; // "t_kjv" 或 "t_cn"
}

// 窗口检测宽度
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

const BibleApp: React.FC<BibleAppProps> = ({ verseSearching, onClearVerseSearching }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 定位到搜索的内容
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (location.hash) {
      const elementId = location.hash.slice(1);
      setHighlightedId(elementId);
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        onClearVerseSearching?.();
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
       
      }, 500);
      setTimeout(() => {
      setHighlightedId(null);
    }, 3000);
      
    }
  }, [location.hash, verseSearching]);
  

  
  // 用户信息
  const [user, setUser] = useState<UserInfo | null>(null);
  // 语言：默认英文
  const [language, setLanguage] = useState<"t_kjv" | "t_cn">(
    verseSearching?.version === "t_cn" ? "t_cn" : "t_kjv"
  );

  // 控制设置菜单和朋友列表
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showFriendList, setShowFriendList] = useState<boolean>(false);

  // 英文和中文书卷及章节数
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

  // 书卷、章节状态
  const [selectedBook, setSelectedBook] = useState<string>(
    verseSearching?.b?.toString() ?? "1"
  );
  
  const [selectedChapter, setSelectedChapter] = useState<string>(
    verseSearching?.c?.toString() ?? "1"
  );

  // 存储从 API 获取的经文数据
  const [bibleData, setBibleData] = useState<any>(null);

  // 多段经文选取：选中的经文数组，以及最后点击的 active 经文（用于显示按钮）
  const [selectedVerses, setSelectedVerses] = useState<VerseItem[]>([]);
  const [activeVerse, setActiveVerse] = useState<VerseItem | null>(null);

  // 数字转换为中文数字（仅支持1-99）
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
  const [userFetched, setUserFetched] = useState<boolean>(false);
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // 访客模式下也标记为完成用户信息获取（即使没有用户数据）
        setUserFetched(true);
        return;
      }
      const response = await fetch("https://withelim.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data.reading_book && data.reading_chapter) {
          setSelectedBook(data.reading_book.toString());
          setSelectedChapter(data.reading_chapter.toString());
        }
        setLanguage(data.language === "t_cn" ? "t_cn" : "t_kjv");
        setUserFetched(true);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  // 修改后的 fetchAndDisplayResult：直接存入 bibleData
  const fetchAndDisplayResult = (): void => {
    const apiUrl = `https://withelim.com/api/bible?book=${selectedBook}&chapter=${selectedChapter}&v=${language}`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setBibleData(data);
      })
      .catch((error) => console.error("请求错误:", error));
  };

  // ==================【Prayer 提交】==================
  const [prayerOpen, setPrayerOpen] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [prayerTitle, setPrayerTitle] = useState<string>("");
  const [prayerText, setPrayerText] = useState<string>("");

  // 当点击一节经文时：
  // 如果用户未登录则提示，否则将该经文加入多选数组（避免重复），并更新 activeVerse 用于显示 <FaNotesMedical /> 按钮
  const handleVerseClick = (item: VerseItem) => {
    if (!user) {
      alert(language === "t_cn" ? "请先登录后再提交祷告。" : "Please log in before submitting a prayer.");
      return;
    }
    setSelectedVerses((prev) => {
      // 如果已存在，则不重复添加
      if (prev.some(v => v.verse === item.verse && v.text === item.text)) {
        return prev;
      }
      return [...prev, item];
    });
    setActiveVerse(item);
  };

  // 当点击全局空白区域时，清除所有经文选取状态
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".verse-line")) {
        setSelectedVerses([]);
        setActiveVerse(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 打开祷告弹窗时，若已有选中经文则清空输入（modal 内会显示所选经文列表）
  const handleOpenPrayerModal = () => {
    setPrayerTitle("");
    setPrayerText("");
    setPrayerOpen(true);
  };

  // 提交祷告时，将所有选中的经文转换为数组发送
  const handlePrayerSubmit = async () => {
    if (!user || selectedVerses.length === 0 || !prayerTitle.trim() || !prayerText.trim()) return;
    try {
      const payload = {
        title: prayerTitle,
        content: prayerText,
        is_private: isPrivate,
        verses: selectedVerses.map(v => ({
          version: language,
          b: parseInt(selectedBook, 10),
          c: parseInt(selectedChapter, 10),
          v: parseInt(v.verse.toString(), 10),
        })),
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
        setSelectedVerses([]);
        setActiveVerse(null);
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
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!verseSearching || userFetched || (!user && userFetched === false)) {
      fetchAndDisplayResult();
    }
    if (!verseSearching && user && user.id) {
      const updateUrl = `https://withelim.com/api/auth/update-reading`;
      const token = localStorage.getItem("token");
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
  }, [userFetched, language, selectedBook, selectedChapter]);

  // ==================【事件处理】==================
  const handlePrevChapter = (): void => {
    onClearVerseSearching();
    const currentChapter = parseInt(selectedChapter, 10);
    const currentBookIndex = parseInt(selectedBook, 10) - 1;
    const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
    const bookNames = Object.keys(booksMapping);
    if (currentChapter === 1) {
      if (currentBookIndex === 0) {
        alert(language === "t_cn" ? "已经是第一章" : "Already at the first chapter");
      } else {
        const newBookIndex = currentBookIndex - 1;
        const lastChapter = booksMapping[bookNames[newBookIndex]];
        setSelectedBook((newBookIndex + 1).toString());
        setSelectedChapter(lastChapter.toString());
      }
    } else {
      setSelectedChapter((currentChapter - 1).toString());
    }
      // 切换后自动滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextChapter = (): void => {
    onClearVerseSearching();
    const currentChapter = parseInt(selectedChapter, 10);
    const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
    const bookNames = Object.keys(booksMapping);
    const currentBookName = bookNames[parseInt(selectedBook, 10) - 1];
    const maxChapter = booksMapping[currentBookName];
    if (currentChapter >= maxChapter) {
      if (currentBookName === bookNames[bookNames.length - 1]) {
        alert(language === "t_cn" ? "已经是最后一章" : "Already at the last chapter");
      } else {
        setSelectedBook((parseInt(selectedBook, 10) + 1).toString());
        setSelectedChapter("1");
      }
    } else {
      setSelectedChapter((currentChapter + 1).toString());
    }
          // 切换后自动滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchResultSelect = (verse: Verse) => {
    if (verse.version === "t_cn" || verse.version === "t_kjv") {
      setLanguage(verse.version);
    } else {
      setLanguage("t_kjv");
    }
    setSelectedBook(String(verse.b));
    setSelectedChapter(String(verse.c));
    const verseKey = `${verse.b}-${verse.c}-${verse.v}`;
    const updateUrl = `https://withelim.com/api/auth/update-reading`;
    const token = localStorage.getItem("token");
    if (token) {
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
          localStorage.setItem("searchingResultVerse", verseKey);
        
        })
        .catch((err) => {
          console.error("更新阅读进度失败:", err);
        });
    }
  };

  useEffect(() => {
    if (verseSearching) {
      const timer = setTimeout(() => {
        console.log("传入 verseSearching:", verseSearching);
        handleSearchResultSelect(verseSearching);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [verseSearching]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLanguage(language);
    navigate("/");
  };

  const handleLanguageChange = (newLang: "t_cn" | "t_kjv") => {
    setLanguage(newLang);
    if (user) {
      const token = localStorage.getItem("token");
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
    }
  };

  // ==================【渲染逻辑】==================
  const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
  const bookNames = Object.keys(booksMapping);
  const chaptersCount: number = booksMapping[bookNames[parseInt(selectedBook, 10) - 1]] || 0;
  const chapterOptions = Array.from({ length: chaptersCount }, (_, i) => i + 1);
  const windowWidth = useWindowWidth();
//selectedVerses排序+省略
const sortedVerses = [...selectedVerses].sort(
  (a, b) => Number(a.verse) - Number(b.verse)
);

const firstFive = sortedVerses.slice(0, 5);
const remaining = sortedVerses.slice(5);
  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, minHeight: "100vh", padding: "0" }}>
      {/* 顶部导航栏 */}
      <header
        style={{
          boxSizing: "border-box",
          padding: "20px 0 0 0",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "white",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: "1px solid #ccc",
        }}
      >
        <div
          style={{
            width: "80%",
            height: "50%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div style={{ cursor: "pointer", fontSize: "20px", fontWeight: "bold" }}>
            <img
              onClick={() => navigate("/")}
              src={WithElimLogo2}
              alt="WithElim"
              height={windowWidth < 1100 ? "70px" : "100px"}
              style={{ cursor: "pointer", paddingTop: windowWidth < 1100 ? "10px" : "0" }}
            />
          </div>
          <span
            className="prayerWallButton"
            style={{ cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
            onClick={() => {
              navigate("/Prayers");
            }}
          >
            {language === "t_cn" ? " 祷告墙" : " Prayer wall"}
          </span>
          <SearchBar placeholder={language === "t_cn" ? "请输入关键词搜索经文" : "Enter keyword to search verses"} />
          {!user && windowWidth >= 1638 && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "170px",
                position: "fixed",
                right: "20vw",
                paddingTop: "24px",
              }}
            >
              <button
                onClick={() =>
                  navigate("/login", { state: { isRegistering: false, language } })
                }
              >
                {language === "t_cn" ? "登录" : "Login"}
              </button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                onClick={() =>
                  navigate("/login", { state: { isRegistering: true, language } })
                }
              >
                {language === "t_cn" ? "注册" : "Register"}
              </button>
            </div>
          )}
          <div style={{ paddingTop: "20px" }}>
            <img
              src={
                user?.avatar
                  ? user.avatar
                  : "https://withelim.com/media/default-avatar.png"
              }
              alt="avatar"
              style={{
                width: windowWidth < 1100 ? "40px" : "50px",
                height: windowWidth < 1100 ? "40px" : "50px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 999,
              }}
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            />
            {showSettingsMenu && (
              <div
                onClick={() => {
                  setShowSettingsMenu(false);
                }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 955,
                  background: "transparent",
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
                  {!user && (
                    <div style={{ padding: "10px", textAlign: "left" }}>
                      <div>
                        <label style={{ fontWeight: "bold" }}>
                          {language === "t_cn" ? "语言：" : "Language:"}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            handleLanguageChange(e.target.value as "t_cn" | "t_kjv");
                            setShowSettingsMenu(false);
                          }}
                          style={{ marginLeft: "5px" }}
                        >
                          <option value="t_kjv">English</option>
                          <option value="t_cn">中文</option>
                        </select>
                      </div>
                      <hr style={{ margin: "10px 0" }} />
                      <div
                        className="navSelected"
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "none",
                          paddingLeft: "5px",
                        }}
                        onClick={() => {
                          setShowSettingsMenu(false);
                          navigate("/login", { state: { language } });
                        }}
                      >
                        {language === "t_cn" ? "登录" : "Login"}
                      </div>
                    </div>
                  )}
                  {user && (
                    <div style={{ padding: "13px", textAlign: "left", lineHeight: "2rem" }}>
                      <span style={{ fontWeight: "bold", color: "#388683" }}>{user?.username}</span>
                      <div>
                        <label style={{ fontWeight: "bold" }}>
                          {language === "t_cn" ? "语言：" : "Language:"}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            handleLanguageChange(e.target.value as "t_cn" | "t_kjv");
                            setShowSettingsMenu(false);
                          }}
                          style={{ marginLeft: "5px" }}
                        >
                          <option value="t_kjv">English</option>
                          <option value="t_cn">中文</option>
                        </select>
                      </div>
                      <hr style={{ margin: "10px 0" }} />
                      <div
                        className="navSelected"
                        style={{ cursor: "pointer", marginBottom: "8px", paddingLeft: "5px" }}
                        onClick={() => {
                          setShowSettingsMenu(false);
                          navigate("/account-settings", { state: { language } });
                        }}
                      >
                        {language === "t_cn" ? "账户设置" : "Account Settings"}
                      </div>
                      <div
                        className="navSelected"
                        style={{ cursor: "pointer", marginBottom: "8px", paddingLeft: "5px" }}
                        onClick={() => {
                          setShowSettingsMenu(false);
                          navigate("/my-prayers");
                        }}
                      >
                        {language === "t_cn" ? "我的祷告" : "My Prayers"}
                      </div>
                      <div
                        className="navSelected"
                        style={{ cursor: "pointer", color: "red", paddingLeft: "5px" }}
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
        <div style={{ boxSizing: "border-box", height: "30%" }}>
          <label htmlFor="bookSelect">{language === "t_cn" ? "书卷：" : "Book:"}</label>
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
          <label htmlFor="chapterSelect">{language === "t_cn" ? "章节：" : "Chapter:"}</label>
          <select
            id="chapterSelect"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{ margin: "0 10px 10px 5px" }}
          >
            {chapterOptions.map((num) => (
              <option key={num} value={num.toString()}>
                {language === "t_cn" ? "第" + convertToChineseNumeral(num) + "章" : "Chapter " + num}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 中间主体（圣经内容） */}
      <main style={{ paddingTop: "140px", textAlign: "center" }}>
        {/* Prayer 弹窗 */}
        {prayerOpen && (
          <div
            onClick={() => setPrayerOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 955,
              background: "transparent",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
                zIndex: 1000,
                width: "70%",
                borderRadius: "10px",
                maxWidth: "400px",
              }}
            >
              <h4>{language === "t_cn" ? "写下你的祷告" : "Write your prayer"}</h4>
              <p>
                {language === "t_cn"
                  ? `${Object.keys(booksAndChaptersCn)[parseInt(selectedBook, 10) - 1]} 第 ${selectedChapter} 章`
                  : `${Object.keys(booksAndChaptersEn)[parseInt(selectedBook, 10) - 1]} Verse, Chapter ${selectedChapter}`}
              </p>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
    {/* 前 5 条：每条单独一行，显示 verse + text */}
    {firstFive.map((item, index) => (
      <li key={index} style={{ marginBottom: "5px" }}>
        [{item.verse}] {item.text}
      </li>
    ))}

    {/* 如果剩余条目 > 0，就合并成一个 <li> 并列显示 */}
    {remaining.length > 0 && (
      <li>
        <strong>其余经文：</strong>
        {remaining.map((item, idx) => (
          <span key={idx} style={{ marginRight: "8px" }}>
            [{item.verse}]
          </span>
        ))}
      </li>
    )}
  </ul>
              <input
                type="text"
                value={prayerTitle}
                onChange={(e) => setPrayerTitle(e.target.value)}
                placeholder={language === "t_cn" ? "祷告标题" : "Prayer Title"}
                style={{ width: "100%", marginBottom: "10px" }}
              />
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

        {/* 直接在 JSX 中渲染 API 返回的经文 */}
        <div
          id="result"
          style={{
            marginTop: "20px",
            padding: "10px",
          }}
        >
          {bibleData && (
            <>
              {(() => {
                const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
                const bookNames = Object.keys(booksMapping);
                const bookIndex = parseInt(selectedBook, 10) - 1;
                const selectedBookName = bookNames[bookIndex] || "";
                const chapterText =
                  language === "t_cn"
                    ? "第" + convertToChineseNumeral(parseInt(selectedChapter, 10)) + "章"
                    : "Chapter " + selectedChapter;
                return (
                  <>
                    <h3>
                      {selectedBookName}: {chapterText}
                    </h3>
                    <div>
                      {bibleData.verses.map((item: VerseItem) => {
                        // 判断当前经文是否被选中（多选）
                        const isSelected = selectedVerses.some(
                          v => v.verse === item.verse && v.text === item.text
                        );
                        // 判断是否为最后一次点击（active），用于显示 <FaNotesMedical /> 按钮
                        const isActive = activeVerse && activeVerse.verse === item.verse && activeVerse.text === item.text;
                        const verseId = `${selectedBook}-${selectedChapter}-${item.verse}`;
                       
                        return (
                          <div   id={verseId}
                            key={item.verse}
                            className="verse-line"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerseClick(item);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              width: "60%",
                              marginLeft: "20%",
                              padding: "5px",
                              borderRadius: "5px",
                              cursor: "pointer",
                              // 如果是搜索到的经文，也可以给予特殊背景
                              backgroundColor:highlightedId === verseId || isSelected ? "#6e8180" : "inherit",
                              color: highlightedId === verseId || isSelected ? "white" : "inherit",
                              textAlign:'left',
                              marginTop:"10px"
                            }}
                          >
                            <span style={{ fontSize: "0.6rem", marginRight: "5px" }}>
                              [{item.verse}]
                            </span>{" "}
                            <span className="prayerVerse">{item.text}</span>
                            {isActive && (
                              <FaNotesMedical size="20px"  className="notes-icon"
                                style={{ marginLeft: "10px", cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPrayerModal();
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </main>

      {/* 上一章 / 下一章 按钮 */}
      <button
        onClick={handlePrevChapter}
        style={{
          position: "fixed",
          bottom: "50vh",
          left: windowWidth < 1596 ? "5vw" : "20vw",
          zIndex: 900,
          marginRight: "10px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          padding: "0",
        }}
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={handleNextChapter}
        style={{
          position: "fixed",
          bottom: "50vh",
          right: windowWidth < 1596 ? "5vw" : "20vw",
          zIndex: 900,
          marginRight: "10px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          padding: "0",
        }}
      >
        <FaChevronRight />
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
        <div
          className="Selected"
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
          <span style={{ fontSize: "24px" }}>
            <IoChatbubbleEllipsesOutline />
          </span>
        </div>
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
              background: "transparent",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
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
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
            >
              {!user ? (
                <div style={{ color: "#999" }}>
                  <div>
                    {language === "t_cn" ? (
                      <>
                        请先
                        <span
                          style={{ color: "blue", cursor: "pointer", marginLeft: "4px" }}
                          onClick={() => navigate("/login", { state: { language } })}
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
                  <FriendList user={user} />
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

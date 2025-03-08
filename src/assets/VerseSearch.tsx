import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

// 导出 Verse 类型，便于在其他组件中使用
export interface Verse {
  version: string;
  b: number;
  c: number;
  v: number;
  t: string;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  language: "t_cn" | "t_kjv";
  reading_book?: number;
  reading_chapter?: number;
}

interface VerseSearchProps {
  onSelectVerse?: (verse: Verse) => void;
}

// ==================【书卷和章节数据】==================
// 英文书卷及章节数（顺序按圣经排列）
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

const VerseSearch: React.FC<VerseSearchProps> = ({ onSelectVerse }) => {
  const [searchWord, setSearchWord] = useState("");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [, setUser] = useState<UserInfo | null>(null);
  const token = localStorage.getItem("token");
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  const navigate = useNavigate();

  // 用于记录每个组（同书同章）的展开状态，默认均为收起状态
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  // 根据用户语言设置界面文字及标签
  const texts = {
    title: language === "t_cn" ? "经文搜索" : "Verse Search",
    placeholder: language === "t_cn"
      ? "请输入搜索关键词..."
      : "Please enter search keywords...",
    button: language === "t_cn" ? "搜索" : "Search",
    noResult: language === "t_cn" ? "暂无结果" : "No results",
    loginAlert: language === "t_cn" ? "请先登录！" : "Please log in first!",
    back: language === "t_cn" ? "返回" : "Back",
    verseLabel: language === "t_cn" ? "节" : "Verse"
  };

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

  // 当组件加载时，如果 URL 中有 word 参数，则自动搜索
  useEffect(() => {
    fetchUser();
    const word = searchParams.get("word");
    if (word) {
      setSearchWord(word);
      handleSearch(word);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 搜索：无论什么语言，都执行两种搜索并合并结果
  const handleSearch = async (wordParam?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(texts.loginAlert);
      navigate("/login");
      return;
    }

    const word = wordParam || searchWord;
    if (!word.trim()) return;
    setLoading(true);
    try {
      // 构造中文和英文接口 URL
      const urlChinese = `https://withelim.com/api/bible/Chinese/search?word=${encodeURIComponent(word)}`;
      const urlEnglish = `https://withelim.com/api/bible/English/search?word=${encodeURIComponent(word)}`;

      // 同时发起两个请求
      const [responseChinese, responseEnglish] = await Promise.all([
        fetch(urlChinese),
        fetch(urlEnglish)
      ]);

      const dataChinese = await responseChinese.json();
      const dataEnglish = await responseEnglish.json();

      // 合并两个接口返回的经文数据，确保结果是数组
      const fetchedVerses: Verse[] = [
        ...(dataChinese.verses || []),
        ...(dataEnglish.verses || [])
      ];

      // 清空展开状态，确保每次搜索后卡片均为收起状态
      setExpandedGroups({});
      setVerses(fetchedVerses);
    } catch (error) {
      console.error("Error searching verses:", error);
    } finally {
      setLoading(false);
    }
  };

  // 点击单个经文时调用回调函数
  const handleVerseClick = (verse: Verse, event: React.MouseEvent) => {
    // 阻止点击事件冒泡，避免同时触发卡片折叠/展开逻辑
    event.stopPropagation();
    console.log("VerseSearch 点击经文, verse:", verse);
    if (onSelectVerse) {
      onSelectVerse(verse);
    }
    navigate("/");
  };

  // 切换组展开/收起状态
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // 根据书和章对经文进行分组
  const groupedVerses = verses.reduce((groups, verse) => {
    const key = `${verse.b}-${verse.c}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(verse);
    return groups;
  }, {} as Record<string, Verse[]>);

  // 根据语言选择对应的书卷名称数组（假设 Verse.b 为 1-based 序号）
  const bookNames = language === "t_cn"
    ? Object.keys(booksAndChaptersCn)
    : Object.keys(booksAndChaptersEn);

  return (
    <div style={{ width: "50vw", minHeight:"100vw", margin: "0 auto" }}>
      <h2>{texts.title}</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder={texts.placeholder}
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          style={{ width: "90%",height:"30px",borderRadius:"7px" }}
        />
        <br />
        <br />
        <button onClick={() => handleSearch(searchWord)} disabled={loading}>
          {texts.button}
        </button>
   
        <button style={{ marginLeft: "30px" }} onClick={() => navigate("/")}>
          {texts.back}
        </button>
      </div>
      <div style={{width:"100%"}}>
        {verses.length === 0 ? (
          <p>{texts.noResult}</p>
        ) : (
          Object.entries(groupedVerses).map(([groupKey, groupVerses]) => {
            // groupKey 格式为 "b-c"，例如 "1-3"
            const [bookNum, chapter] = groupKey.split("-");
            const bookIndex = parseInt(bookNum, 10) - 1;
            const bookName = bookNames[bookIndex] || bookNum;
            const isExpanded = expandedGroups[groupKey];
            return (
              <div
                key={groupKey}
                style={{
                  border: "1px solid #ddd",
                  boxSizing:"border-box",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  width:"100%",
                }}
                onClick={() => toggleGroup(groupKey)}
              >
                <div>
                  <strong>
                    {language === "t_cn"
                      ? `${bookName} 第${chapter}章`
                      : `${bookName} chapter ${chapter}`}
                  </strong>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: "8px" }}>
                    {groupVerses.map((verse) => (
                      <div
                        key={`${verse.b}-${verse.c}-${verse.v}`}
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "8px",
                          marginTop: "8px",
                          cursor: "pointer"
                        }}
                        onClick={(event) => handleVerseClick(verse, event)}
                      >
                        <div>
                          <strong>
                             {language === "t_cn"?
                           `第${verse.v}${texts.verseLabel}` :`${texts.verseLabel}: ${verse.v}`
                             }
                          </strong>
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <span>{verse.t}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VerseSearch;

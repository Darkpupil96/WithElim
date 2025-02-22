import React, { useState, useEffect } from "react";

interface ResultData {
  bookName: string;
  chapterText: string;
  verses: string;
}

const BibleApp: React.FC = () => {
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

  // 状态定义：语言、书卷（选项序号，从 "1" 开始）、章节、以及 API 返回的数据
  const [language, setLanguage] = useState<string>("t_cn");
  const [selectedBook, setSelectedBook] = useState<string>("1");
  const [selectedChapter, setSelectedChapter] = useState<string>("1");
  const [resultData, setResultData] = useState<ResultData | null>(null);

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

  // 根据当前状态获取经文并更新结果
  const fetchAndDisplayResult = (): void => {
    const apiUrl = `http://withelim.com:5000/api/bible?book=${selectedBook}&chapter=${selectedChapter}&v=${language}`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // 拼接每节经文：[verse] text
        const versesString: string = data.verses
          .map((item: { verse: number | string; text: string }) => `[${item.verse}] ${item.text}`)
          .join(" ");
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

  useEffect(() => {
    fetchAndDisplayResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, selectedBook, selectedChapter]);

  // 根据当前语言获取对应的书卷映射
  const booksMapping = language === "t_cn" ? booksAndChaptersCn : booksAndChaptersEn;
  const bookNames = Object.keys(booksMapping);

  // 根据当前选中书卷获取章节数
  const chaptersCount: number = booksMapping[bookNames[parseInt(selectedBook, 10) - 1]] || 0;
  const chapterOptions = Array.from({ length: chaptersCount }, (_, i) => i + 1);

  // 切换到上一章的处理函数
  const handlePrevChapter = (): void => {
    const currentChapter = parseInt(selectedChapter, 10);
    if (currentChapter === 1) {
      alert(language === "t_cn" ? "已经是第一章" : "Already at first chapter");
    } else {
      setSelectedChapter((currentChapter - 1).toString());
    }
  };

  // 切换到下一章的处理函数
  const handleNextChapter = (): void => {
    const currentChapter = parseInt(selectedChapter, 10);
    const currentBookName = bookNames[parseInt(selectedBook, 10) - 1];
    const maxChapter = booksMapping[currentBookName];
    if (currentChapter >= maxChapter) {
      alert(language === "t_cn" ? "已经是最后一章" : "Already at last chapter");
    } else {
      setSelectedChapter((currentChapter + 1).toString());
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, margin: "20px" }}>
      {/* 主标题 */}
      <h2>{language === "t_cn" ? "以琳" : "WithElim"}</h2>
      {/* 语言下拉框 */}
      <label htmlFor="languageSelect">
        {language === "t_cn" ? "语言：" : "Language:"}
      </label>
      <select
        id="languageSelect"
        value={language}
        onChange={(e) => {
          const newLang = e.target.value;
          setLanguage(newLang);
          // 切换语言时默认选中第一本书第一章
          setSelectedBook("1");
          setSelectedChapter("1");
        }}
      >
        {language === "t_cn" ? (
          <>
            <option value="t_cn">中文</option>
            <option value="t_kjv">英文</option>
          </>
        ) : (
          <>
            <option value="t_kjv">English</option>
            <option value="t_cn">Chinese</option>
          </>
        )}
      </select>
      <br />
      {/* 书卷下拉框 */}
      <label htmlFor="bookSelect">
        {language === "t_cn" ? "书卷：" : "Book:"}
      </label>
      <select
        id="bookSelect"
        value={selectedBook}
        onChange={(e) => {
          setSelectedBook(e.target.value);
          // 书卷变化时重置章节为1
          setSelectedChapter("1");
        }}
      >
        {bookNames.map((bookName, index) => (
          <option key={index} value={(index + 1).toString()}>
            {bookName}
          </option>
        ))}
      </select>
      <br />
      {/* 章节下拉框 */}
      <label htmlFor="chapterSelect">
        {language === "t_cn" ? "章节：" : "Chapter:"}
      </label>
      <select
        id="chapterSelect"
        value={selectedChapter}
        onChange={(e) => setSelectedChapter(e.target.value)}
      >
        {chapterOptions.map((num) => (
          <option key={num} value={num.toString()}>
            {language === "t_cn"
              ? "第" + convertToChineseNumeral(num) + "章"
              : "Chapter " + num}
          </option>
        ))}
      </select>
      <br />
      {/* 显示返回结果 */}
      <div
        id="result"
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        {resultData && (
          <>
            <h3>
              {resultData.bookName}: {resultData.chapterText}
            </h3>
            <p>{resultData.verses}</p>
          </>
        )}
      </div>
      {/* 左右按钮切换章节 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <button onClick={handlePrevChapter}>
          {language === "t_cn" ? "上一章" : "Previous Chapter"}
        </button>
        <button onClick={handleNextChapter}>
          {language === "t_cn" ? "下一章" : "Next Chapter"}
        </button>
      </div>
    </div>
  );
};

export default BibleApp;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
    placeholder?: string;
  }
  const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "请输入搜索关键词..." }) => {
  const [searchWord, setSearchWord] = useState("");
  const navigate = useNavigate();

  // 用于检测窗口宽度是否小于 1100px
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
  // 控制在移动端是否显示输入框
  const [showInput, setShowInput] = useState(false);

  // 监听窗口 resize 更新 isMobile 状态
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 当用户按下回车键时，跳转到 /verseSearch 页面，并传递查询参数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchWord.trim()) {
      // 跳转到 /verseSearch?word=xxx
      navigate(`/verseSearch?word=${encodeURIComponent(searchWord.trim())}`);
      // 隐藏输入框（针对移动端）
      if (isMobile) setShowInput(false);
    }
  };

  return (
    <div
      style={{
        margin: "30px auto",
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {isMobile && !showInput ? (
        // 移动端只显示图标，点击后显示输入框
        <FiSearch
          size={24}
          style={{ cursor: "pointer" }}
          onClick={() =>navigate(`/verseSearch`)}
        />
      ) : (
        // 显示输入框
        <input
          type="text"
          placeholder={placeholder}
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            position:"fixed",
            left:"40.2vw",
            width: "20vw",
            padding: "8px",
            fontSize: "16px",
            borderRadius:"10px",
            borderBlockColor:"grey",
            borderWidth:"0.8px"

          }}
        />
      )}
    </div>
  );
};

export default SearchBar;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Friend {
  id: number;
  username: string;
  avatar: string | null;
}

interface FriendLists {
  confirmed: Friend[];
  request_sent: Friend[];
  request_received: Friend[];
}

const FriendList: React.FC<{ user: any }> = ({ user }) => {
  const [friends, setFriends] = useState<FriendLists>({
    confirmed: [],
    request_sent: [],
    request_received: []
  });
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  // 搜索关键词状态
  const [searchQuery, setSearchQuery] = useState<string>("");
  // 搜索候选用户状态
  const [candidateFriends, setCandidateFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (user && !friends.confirmed.length) { // 只有好友列表为空时才请求
      fetchFriends();
      setLanguage(user.language);
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("https://withelim.com/api/friends/full-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched friends:", data);
        setFriends(data);
      } else {
        console.error("Failed to get friend list");
      }
    } catch (error) {
      console.error("Exception in getting friend list", error);
    }
  };

  // 处理点击好友，跳转到好友的 Profile 页面
  const handleFriendClick = (friendId: number) => {
    navigate(`/user/${friendId}`);
  };

  // 搜索候选好友：当搜索关键词不为空时，直接调用后端接口返回候选用户
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const fetchCandidateFriends = async () => {
        try {
          // 这里假设后端公开搜索接口路径为 /api/auth/Usersearch，并使用 q 参数
          const response = await fetch(
            `https://withelim.com/api/auth/Usersearch?q=${encodeURIComponent(searchQuery)}`,
            {
              // 如果接口无需 token，可以不传 Authorization
              // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            // 假设返回格式为 { users: Friend[] }
            setCandidateFriends(data.users);
          } else {
            console.error("Failed to search candidate friends");
            setCandidateFriends([]);
          }
        } catch (error) {
          console.error("Exception in candidate friend search", error);
          setCandidateFriends([]);
        }
      };
      // 防抖 300ms
      const timer = setTimeout(() => {
        fetchCandidateFriends();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCandidateFriends([]);
    }
  }, [searchQuery]);



  const listContainerStyle: React.CSSProperties = {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
    textAlign: "left",
    overflowY: "auto",
    maxHeight: "200px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  return (
    <div>
      {/* 搜索输入框 */}
      <input
        type="text"
        value={searchQuery}
        placeholder={language === "t_cn" ? "搜索好友" : "Search Friends"}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "80%",
          padding: "5px",
          marginBottom: "10px",
          fontSize: "13px",
          border: "1px solid #ccc",
          borderRadius: "5px"
        }}
      />

      {/* 显示候选好友搜索结果 */}
      {searchQuery.trim() !== "" && candidateFriends.length > 0 && (
        <>
          <h5>{language === "t_cn" ? "搜索结果" : "Search Results"}</h5>
          <ul style={listContainerStyle}>
            {candidateFriends.map((candidate) => (
              <li
                key={candidate.id}
                onClick={() => handleFriendClick(candidate.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "5px",
                  background: "#f9f9f9",
                  marginBottom: "5px",
                  cursor:"pointer"
                 
                }}
              >
                <img
                  src={candidate.avatar || "https://withelim.com/media/default-avatar.png"}
                  alt={candidate.username}
                  style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
                />
                <span style={{ flex: 1, fontSize: "13px" }}>{candidate.username}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 显示已确认好友列表 */}
      <h5>{language === "t_cn" ? "好友 🟢" : "Friends 🟢"}</h5>
      {friends.confirmed.length > 0 ? (
        <ul style={listContainerStyle}>
          {friends.confirmed.map((friend) => (
            <li
              key={friend.id}
              onClick={() => handleFriendClick(friend.id)}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "5px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f3f3")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <img
                src={friend.avatar || "https://withelim.com/media/default-avatar.png"}
                alt={friend.username}
                style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
              />
              <span style={{ fontSize: "13px" }}>{friend.username}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "13px", color: "grey" }}>
          {language === "t_cn" ? "暂无好友" : "No confirmed friends."}
        </p>
      )}

      {/* 显示待发送好友请求列表 */}
      <h5>{language === "t_cn" ? "已请求 🟡" : "Pending Sent 🟡"}</h5>
      {friends.request_sent.length > 0 ? (
        <ul style={{ ...listContainerStyle, color: "#888" }}>
          {friends.request_sent.map((friend) => (
            <li
              key={friend.id}
              onClick={() => handleFriendClick(friend.id)}
              style={{ padding: "8px", borderRadius: "5px", cursor: "pointer" }}
            >
              <img
                src={friend.avatar || "https://withelim.com/media/default-avatar.png"}
                alt={friend.username}
                style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
              />
              <span style={{ fontSize: "13px" }}>
                {friend.username} ({language === "t_cn" ? "等待确认" : "Pending"})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "13px", color: "grey" }}>
          {language === "t_cn" ? "暂无待确认好友请求" : "No pending sent requests."}
        </p>
      )}

      {/* 显示待接受好友请求列表 */}
      <h5>{language === "t_cn" ? "待接受 🔵" : "Requests 🔵"}</h5>
      {friends.request_received.length > 0 ? (
        <ul style={{ ...listContainerStyle, color: "#007bff" }}>
          {friends.request_received.map((friend) => (
            <li
              key={friend.id}
              onClick={() => handleFriendClick(friend.id)}
              style={{ padding: "8px", borderRadius: "5px", cursor: "pointer" }}
            >
              <img
                src={friend.avatar || "https://withelim.com/media/default-avatar.png"}
                alt={friend.username}
                style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
              />
              <span style={{ fontSize: "13px" }}>
                {friend.username} ({language === "t_cn" ? "接受请求?" : "Accept?"})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "13px", color: "grey" }}>
          {language === "t_cn" ? "暂无好友请求" : "No friend requests received."}
        </p>
      )}
    </div>
  );
};

export default FriendList;


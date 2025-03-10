import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrayerCard, { Prayer } from "../components/PrayerCard";
import Header from "../components/Header";

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  language: "t_cn" | "t_kjv";
  reading_book?: number;
  reading_chapter?: number;
}

const UserPublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<"t_cn" | "t_kjv">("t_kjv");
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [friendStatus, setFriendStatus] = useState<"not_friends" | "request_sent" | "request_received" | "friends" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [friendLoading, setFriendLoading] = useState<boolean>(false); // ⏳ 处理好友按钮的状态
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
    fetchProfileUser();
  }, [userId, language]);

  // ✅ 获取当前登录用户信息（用于 Header）
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

  // ✅ 获取 `userId` 对应的用户公开信息
  const fetchProfileUser = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`https://withelim.com/api/auth/public/${userId}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setProfileUser(data.user);
      setPrayers(data.publicPrayers);
      if (token) {
        checkFriendStatus();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 查询好友状态
  const checkFriendStatus = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`https://withelim.com/api/friends/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", // ❗️避免获取缓存数据
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend status");
      }

      const data = await response.json();
      console.log(`Friend status: ${data.status}`);
      setFriendStatus(data.status);
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  useEffect(() => {
    if (profileUser && token) {
      checkFriendStatus();
    }
  }, [profileUser, token]);

 // ✅ 处理好友请求
const handleFriendAction = async () => {
  if (!userId || friendLoading) return;
  setFriendLoading(true);

  try {
      let response, data;

      if (friendStatus === "not_friends") {
          // ✅ 发送好友请求
          response = await fetch(`https://withelim.com/api/friends/add`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ friendId: userId }),
          });

      } else if (friendStatus === "request_received") {
          // ✅ 获取所有好友请求
          const requestIdResponse = await fetch(`https://withelim.com/api/friends/requests`, {
              headers: { Authorization: `Bearer ${token}` },
          });

          const requestData = await requestIdResponse.json();
          console.log("Friend Requests Data:", requestData); // 🛠️ Debug

          // ✅ **匹配 `friend_id === user.id`（当前用户是接收方）**
          const friendRequest = requestData.friendRequests.find(
              (req: any) => req.friend_id === user?.id
          );

          if (!friendRequest) {
              console.error("Friend request not found");
              setFriendLoading(false);
              return;
          }

          console.log("Accepting friend request with ID:", friendRequest.id);

          // ✅ 发送接受请求的 API 请求
          response = await fetch(`https://withelim.com/api/friends/respond`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ friendshipId: friendRequest.id, status: "accepted" }),
          });

      } else if (friendStatus === "friends") {
          // ✅ 解除好友关系（双向删除）
          response = await fetch(`https://withelim.com/api/friends/${userId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
          });
      }

      // **等待 API 响应**
      data = await response?.json();
      if (!response?.ok) {
          throw new Error(data.error || "Error processing friend request");
      }

      console.log("Friend action success:", data);

      // ✅ **确保前端状态同步后端**
      await checkFriendStatus();

  } catch (error) {
      console.error("Error handling friend request:", error);
  } finally {
      setFriendLoading(false);
  }
};

  // ✅ 显示 Loading 状态
  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px", fontSize: "18px" }}>Loading...</div>;
  }

  if (!profileUser) {
    return <div style={{ textAlign: "center", padding: "20px" }}>User not found.</div>;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "0" }}>
      <Header user={user} onLanguageChange={setLanguage} onLogout={() => navigate("/login")} />

      {/* 用户信息卡片 */}
      <div style={{ display: "flex", alignItems: "center", background: "#f3f3f3", padding: "20px", borderRadius: "8px", marginTop: "150px", textAlign: "left" }}>
        <img src={profileUser.avatar} alt="Avatar" style={{ width: "110px", height: "110px", borderRadius: "50%", marginRight: "20px" }} />
        <div>
          <h3>{profileUser.username}</h3>
          <p>{language === "t_cn" ? "邮箱:" : "Email:"} {profileUser.email}</p>
          <p>{language === "t_cn" ? "语言:" : "Language:"} {profileUser.language === "t_cn" ? "中文" : "English"}</p>
        </div>
      </div>
      <br /><br />

      {/* 好友按钮 */}
      {token && user?.id !== profileUser.id && (
        <button
          onClick={handleFriendAction}
          disabled={friendLoading || friendStatus === "request_sent"}
          style={{
            background:
              friendStatus === "friends" ? "#d9534f" :
              friendStatus === "request_sent" ? "#f0ad4e" :
              friendStatus === "request_received" ? "#5bc0de" :
              "#5cb85c",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: friendLoading || friendStatus === "request_sent" ? "not-allowed" : "pointer",
            marginBottom: "20px",
          }}
        >
          {friendLoading ? "Processing..."
            : friendStatus === "friends" ? "Remove Friend"
            : friendStatus === "request_sent" ? "Waiting for approval"
            : friendStatus === "request_received" ? "Accept Friend Request"
            : "Add Friend"}
        </button>
      )}

      {/* 公开祷文 */}
      <h4>{language === "t_cn" ? `${profileUser.username} 的祷告` : "Public Prayers"}</h4>
      {prayers.length > 0 ? prayers.map((prayer) => (
        <div style={{ width: "100%", justifyContent: "center", display: "flex" }} key={prayer.id}>
          <PrayerCard prayer={prayer} currentUser={user} />
        </div>
      )) : <p>{language === "t_cn" ? "暂时没有祷告" : "No public prayers"}</p>}
    </div>
  );
};

export default UserPublicProfile;



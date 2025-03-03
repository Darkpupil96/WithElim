import React, { useState, useEffect } from "react";

// 定义好友数据类型
interface Friend {
  id: number;
  username: string;
  avatar: string | null;
}

const FriendList: React.FC<{ user: any }> = ({ user }) => {
  const [friends, setFriends] = useState<Friend[]>([]);

  // 当用户登录后，调用 API 获取好友列表
  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("https://withelim.com/api/friends/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      } else {
        console.error("Failed to get friend list");
      }
    } catch (error) {
      console.error("Exception in getting friend list", error);
    }
  };

  return (
    <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0,textAlign: "left" }}>
      {friends.map((friend) => (
        <li key={friend.id} style={{ marginTop: "5px" }}>
          <img
            src={
              friend.avatar
                ? friend.avatar
                : "https://withelim.com/media/default-avatar.png"
            }
            alt={friend.username}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              marginRight: "5px",
            }}
          />
          {friend.username}
        </li>
      ))}
    </ul>
  );
};

export default FriendList;

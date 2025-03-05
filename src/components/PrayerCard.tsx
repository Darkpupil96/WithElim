import React, { useState, useEffect, ChangeEvent , useRef} from "react";

import { IoClose } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { FaCross } from "react-icons/fa";

export interface Verse {
  version: string;
  b: number;
  c: number;
  v: number;
  text: string;
}

export interface Prayer {
  id: number;
  title: string;
  content: string;
  is_private: boolean;
  created_at: string;
  username: string;
  verses: Verse[];
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  username: string;
  avatar?: string;
}

interface PrayerCardProps {
    prayer: Prayer;
    currentUser: { id: number; language: "t_cn" | "t_kjv"; username: string } | null;
  }

const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, currentUser }) => {
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(prayer.title);
  const [editContent, setEditContent] = useState<string>(prayer.content);
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(prayer.is_private);
//
 useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem("token");
      fetch(`https://withelim.com/api/prayers/${prayer.id}/isliked/${currentUser.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // data.liked 应为布尔值，true 表示已点赞
          setHasLiked(data.liked);
        })
        .catch((error) => {
          console.error("Error fetching like status:", error);
        });
    }
  }, [currentUser, prayer.id]);

  // 根据 currentUser 的语言设置文本，若为空则默认英文
  const userLang = currentUser?.language || "t_kjv";

// ref 用于控制点赞按钮 DOM
const prayButtonRef = useRef<HTMLButtonElement>(null);
  // 获取点赞数量
  const fetchLikeCount = async () => {
    try {
      const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}/likes`);
      const data = await response.json();
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Error fetching like count", error);
    }
  };

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}/comments`);
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  useEffect(() => {
    fetchLikeCount();
    fetchComments();
  }, [prayer.id]);

// 当 hasLiked 为 true 时，设置按钮内的 SVG path 填充颜色为红色
useEffect(() => {
    if (hasLiked && prayButtonRef.current) {
      const paths = prayButtonRef.current.querySelectorAll(".prayButton path");
      paths.forEach((path) => {
        path.removeAttribute("style");
        path.setAttribute("fill", "#d62828"); // 点赞为红色
      });
    } else if (prayButtonRef.current) {
      const paths = prayButtonRef.current.querySelectorAll(".prayButton path");
      paths.forEach((path) => {
        path.removeAttribute("style");
        path.setAttribute("fill", "#388683"); // 默认颜色（例如绿色）
      });
    }
  }, [likeCount, hasLiked]);
  
  const handlePray = async () => {
    if (!currentUser) {
      alert(userLang === "t_cn" ? "请先登录以点赞" : "Please log in to like this prayer.");
      return;
    }
    try {
      if (!hasLiked) {
        const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}/like`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          setHasLiked(true);
          setLikeCount(likeCount + 1);
        } else {
          const data = await response.json();
          if (data.error === "You have already liked this prayer") {
            // 如果返回错误，说明已经点赞，直接执行取消点赞操作
            const delResponse = await fetch(`https://withelim.com/api/prayers/${prayer.id}/unlike`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (delResponse.ok) {
              setHasLiked(false);
              setLikeCount(likeCount - 1);
              
            }
          } else {
            console.error("Error liking prayer", data.error);
          }
        }
      } else {
        
        // 如果当前已点赞，则直接取消点赞
        const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}/unlike`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          setHasLiked(false);
          setLikeCount(likeCount - 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };
  

  const handleCommentSubmit = async () => {
    if (!currentUser) {
      alert(userLang === "t_cn" ? "请先登录以发表评论" : "Please log in to comment.");
      return;
    }
    if (!commentText.trim()) return;
    try {
      const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      if (response.ok) {
        setCommentText("");
        setShowCommentInput(false);
        fetchComments();
                // 可考虑调用父组件的更新函数同步最新数据
                window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting comment", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          is_private: editIsPrivate,
          verses: prayer.verses, // 保持原有经文
        }),
      });
      if (response.ok) {
        setIsEditing(false);
        // 可考虑调用父组件的更新函数同步最新数据
        window.location.reload();
      } else {
        console.error(userLang === "t_cn" ? "更新祷文失败" : "Failed to update prayer");
      }
    } catch (error) {
      console.error("Error updating prayer", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(prayer.title);
    setEditContent(prayer.content);
    setEditIsPrivate(prayer.is_private);
  };

  const handleDelete = async () => {
    if (!window.confirm(userLang === "t_cn" ? "确定要删除该祷文吗？" : "Are you sure you want to delete this prayer?")) return;
    try {
      const response = await fetch(`https://withelim.com/api/prayers/${prayer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        window.location.reload();
      } else {
        console.error(userLang === "t_cn" ? "删除祷文失败" : "Failed to delete prayer");
      }
    } catch (error) {
      console.error("Error deleting prayer", error);
    }
  };

  return (
    <div className="PrayerCard" style={{position:"relative",border: "1px solid #ddd", borderRadius: "8px", padding: "15px 25px 15px 25px", marginBottom: "16px", backgroundColor: "#fff" }}>
                      {currentUser && currentUser.username === prayer.username && !isEditing&& (
              <span style={{paddingTop:"8px",cursor:"pointer",position:"absolute",right:"20px",top:"7px"}}> 
              <IoClose size="25px" className="IoClose" onClick={handleDelete}/></span>)
}
{currentUser && currentUser.username === prayer.username && (
              <FaEdit className="FaEdit" onClick={() => setIsEditing(true)} size="20px" color="grey" style={{cursor:"pointer",position:"absolute",left:"30px",top:"20px",paddingBottom:"10px"}}/>
          )}
      {isEditing ? (
        <div style={{  marginTop: "40px",width:"100%"}}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ width: "70%", marginBottom: "8px", fontSize: "18px" }}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            style={{ width: "70%", marginBottom: "8px" }}
          />
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={editIsPrivate}
              onChange={(e) => setEditIsPrivate(e.target.checked)}
            />
            {userLang === "t_cn" ? "私密" : "Private"}
          </label>
          <button onClick={handleSave} style={{ marginRight: "8px" }}>
            {userLang === "t_cn" ? "保存" : "Save"}
          </button>
          <button onClick={handleCancel}>{userLang === "t_cn" ? "取消" : "Cancel"}</button>
        </div>
      ) : (
        <div>
          <h3>{prayer.title}</h3>
          
          <p>{prayer.content}</p>
          <p style={{ fontSize: "12px", color: "#888" }}>
            {prayer.username} - {new Date(prayer.created_at).toLocaleString()}
          </p>
          <p>{userLang==="t_cn"?"关联经文":"Related scriptures"}</p>
          {prayer.verses && prayer.verses.length > 0 && (
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#555" }}>
              {prayer.verses.map((v, index) => (
                <p key={index}>
                  [{v.v}] {v.text}
                </p>
              ))}
            </div>
          )}
          <div style={{ display: "flex",justifyContent:"space-evenly", marginTop: "8px" }}>
            <span ref={prayButtonRef} style={{fontSize:"14px",paddingTop:"8px",cursor:"pointer"}}> <FaCross   className="prayButton" size="20px" onClick={handlePray}/> 
              &nbsp;
              {likeCount}</span>

              
        
              <button style={{}}onClick={() => setShowCommentInput(!showCommentInput)}>
  {showCommentInput 
    ? (userLang === "t_cn" ? "取消" : "Cancel")
    : (userLang === "t_cn" ? "回复" : "Reply")}
</button>

          </div>
          {showCommentInput && (
            <div style={{ marginTop: "8px",marginLeft:"10%",width:"80%" }}>
              <textarea
                value={commentText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
                rows={3}
                style={{ width: "100%", marginBottom: "8px" }}
                placeholder={userLang === "t_cn" ? "输入你的回复..." : "Enter your reply..."}
              />
              <button onClick={handleCommentSubmit}>
                {userLang === "t_cn" ? "提交回复" : "Submit"}
              </button>
            </div>
          )}
          {comments.length > 0 && (
            <div style={{ marginTop: "8px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ marginBottom: "10px" }}>
                  <strong>{comment.username}</strong>: {comment.content}{" "}
                  <span style={{ fontSize: "10px", color: "#999" }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrayerCard;

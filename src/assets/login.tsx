import { useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import axios from "axios";

// 你本地的 SVG logo，假设在 public 目录或 assets 目录
import WithElimLogo from "../../public/WithElim.svg";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// 用来声明接收的props类型


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const language = location.state?.language || "t_kjv";


  const API_URL = "https://withelim.com/api";
// 使用 location.state 来初始化 isRegistering，如果没有传值，则默认 false
const [isRegistering, setIsRegistering] = useState(
  location.state?.isRegistering || false
);

// 如果 location.state 变化，也更新 isRegistering
useEffect(() => {
  if (location.state?.isRegistering !== undefined) {
    setIsRegistering(location.state.isRegistering);
  }
}, [location.state]);
  // ==================【事件处理】==================
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(language === "t_cn" ? "邮箱和密码不能为空" : "Email and password cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || (language === "t_cn" ? "登录失败" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError(language === "t_cn" ? "所有字段都必须填写" : "All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      alert(language === "t_cn" ? "注册成功，请登录" : "Registration successful. Please log in.");
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.response?.data?.error || (language === "t_cn" ? "注册失败" : "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  // ==================【渲染】==================
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        {/* Logo */}
        <img src={WithElimLogo} alt="WithElim" />
        <CardHeader>
          <p></p>
          <p></p>
          <CardTitle>
          {language === "t_cn" ? "以琳" : "WithElim"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isRegistering ? (
            <>
              {/* 用户名 */}
              <Input
                placeholder={language === "t_cn" ? "用户名" : "Username"}
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              {/* 邮箱 */}
              <Input
                type="email"
                placeholder={language === "t_cn" ? "邮箱" : "Email"}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              {/* 密码 */}
              <Input
                type="password"
                placeholder={language === "t_cn" ? "密码" : "Password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mb-4"
              />

              {/* 错误提示 */}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <br />
              <br />

              {/* 注册按钮 */}
              <Button onClick={handleRegister} disabled={loading} className="w-full">
                {loading
                  ? language === "t_cn" ? "注册中..." : "Registering..."
                  : language === "t_cn" ? "注册" : "Register"}
              </Button>

              <p className="text-center mt-4 text-sm">
                {language === "t_cn" ? "已有账号？" : "Already have an account?"}{" "}
                <span
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsRegistering(false)}
                >
                  {language === "t_cn" ? "登录" : "Login"}
                </span>
              </p>
              <p className="text-center mt-4 text-sm">
                <span
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  {language === "t_cn" ? "游客模式" : "Guest mode"}
                </span>
              </p>
            </>
          ) : (
            <>
              {/* 邮箱 */}
              <Input
                type="email"
                placeholder={language === "t_cn" ? "邮箱" : "Email"}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              {/* 密码 */}
              <Input
                type="password"
                placeholder={language === "t_cn" ? "密码" : "Password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mb-4"
              />

              {/* 错误提示 */}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <br />
              <br />

              {/* 登录按钮 */}
              <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading
                  ? language === "t_cn" ? "登录中..." : "Logging in..."
                  : language === "t_cn" ? "登录" : "Login"}
              </Button>

              <p className="text-center mt-4 text-sm">
                {language === "t_cn" ? "还没有账号？" : "Don't have an account?"}{" "}
                <span
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsRegistering(true)}
                >
                  {language === "t_cn" ? "请注册" : "Register"}
                </span>
              </p>
              <p className="text-center mt-4 text-sm">
                <span
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  {language === "t_cn" ? "游客模式" : "Guest mode"}
                </span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

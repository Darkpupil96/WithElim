import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const API_URL = "https://withelim.com/api";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("邮箱和密码不能为空");
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
      setError(err.response?.data?.error || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("所有字段都必须填写");
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
      alert("注册成功，请登录");
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg" >
        <CardHeader>
          <CardTitle>{isRegistering ? "注册" : "登录"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isRegistering ? (
            <>
              <Input
                placeholder="用户名"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              <Input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mb-4"
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <br />
                <br />
              <Button onClick={handleRegister} disabled={loading} className="w-full">
                {loading ? "注册中..." : "注册"}
              </Button>
              <p className="text-center mt-4 text-sm">
                已有账号？<span className="text-blue-500 cursor-pointer" onClick={() => setIsRegistering(false)}>登录</span>
              </p>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mb-2"
              />
              <br />
              <br />
              
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mb-4"
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <br />
              <br />
              <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? "登录中..." : "登录"}
              </Button>
              <p className="text-center mt-4 text-sm">
                还没有账号？<span className="text-blue-500 cursor-pointer" onClick={() => setIsRegistering(true)}>请注册</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
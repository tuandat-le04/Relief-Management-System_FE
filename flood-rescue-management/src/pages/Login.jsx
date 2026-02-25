import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("vn");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate input
      if (!formData.username || !formData.password) {
        setError("Vui lòng nhập đầy đủ thông tin");
        setLoading(false);
        return;
      }

      // Call login API
      const response = await authService.login({
        email: formData.username,
        password: formData.password,
      });

      console.log("Login response:", response); // Debug log

      if (response.success) {
        // Get user info
        const user = authService.getCurrentUser();
        console.log("Current user:", user); // Debug log
        console.log("User role:", user?.role); // Debug log

        // Redirect based on role with fallback
        if (!user || !user.role) {
          console.error("User or role is undefined");
          setError("Không thể xác định quyền người dùng");
          setLoading(false);
          return;
        }

        const roleRoutes = {
          ADMIN: "/admin/dashboard",
          RESCUE_COORDINATOR: "/coordinator/dashboard",
          RESCUE_TEAM: "/rescue-team/dashboard",
          MANAGER: "/manager/dashboard",
          CITIZEN: "/citizen/dashboard",
        };

        const targetRoute = roleRoutes[user.role] || "/dashboard";
        console.log("Navigating to:", targetRoute); // Debug log

        navigate(targetRoute, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message && err.message.toLowerCase().includes("disabled")) {
        setError(
          "Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên hoặc chờ phê duyệt.",
        );
      } else {
        setError(
          err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111518] dark:text-gray-100 min-h-screen flex overflow-hidden">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA1viCHF16Z5-gQlEoL9lpNM3BJGpuUgpsWZAO6O5VAGefHgVmFAH9i3uRswJXRLeJDBOvKQXYROQsiOahZev_MZWkOalcIv_5DJNQM2rxkjX0UOcR3CYcpM6UdXU5N9F62CmLp0pAPWP8RhR3LUs6WiwwvBaqC0q82b2DXqs23XT7XcCjhrkQNoObvavvLFl2OlYSd2E4CJ4mpy01XZyOxEMI87En8iAVn3Iz4X4rJLXKWSPlvEL-J5XAMC7QuXEWIoaSGjzdFlQ')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a4b85]/90 via-[#0a4b85]/40 to-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              Hệ thống Cứu hộ Quốc gia
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Kết nối nguồn lực.
              <br />
              Chia sẻ yêu thương.
            </h1>

            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Hệ thống quản lý thông tin cứu trợ tập trung, minh bạch và kịp
              thời cho người dân Việt Nam.
            </p>

            <div className="mt-8 flex gap-4">
              <div className="flex -space-x-3">
                <img
                  alt="Volunteer"
                  className="w-10 h-10 rounded-full border-2 border-white/50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZcfw40vHmhX4yMFA7tKMtpw_Q6o0xJo56DcQxZndt_E-2Ve65MPKMi58NAtwM0nRbF2KyNSIKdk6GZdk1cQKxjwcNEJ6giViTGrH5zVefUgr1RIBRFytxUlS1Qfg0V0U7cIr19XcU5Nr7LwV9Y1nU7rN2eWac0JdHTJdEcB06xxkAFKkxcFgMbgtcZgq3uBv6fQQVhhJFj6M0cbw7pnqLhSLeVe9T56wed14sv1iNvmX7gdl9Peseehr_mqgQcI7LkFYgoWbszoI"
                />
                <img
                  alt="Volunteer"
                  className="w-10 h-10 rounded-full border-2 border-white/50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxzVCj4oYJS-ynv8zyXYGl1tNcPok76QUgKj3953vV8W6IVV0hqA9BV0fnlrbPZjwZ9A8XmO1WLkHe-Weu9S2NkX3KnToIEQCdR8_FjIutHQvtfMnDAZFT7OiP9ehVzwfxg_CF9dWiFfEDCetckwcjQXWxd6GEpIcCo6u9jyV19OQl4o6CZNkFgn7Zgp8_ec5UMES5plFGxzZNwgW9Mz0x7ha_iHnGG36k6UntsYc5entEY7i04XmrCGpL812KAnBEwz2VKqQtpi8"
                />
                <img
                  alt="Volunteer"
                  className="w-10 h-10 rounded-full border-2 border-white/50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBjKWm9llZtsifQvla7rAaApE_SMx1bACp8LKPzdm5KmlkguS1YUmzwJpQD-UjRAJakDMODnOICiaHkXOB25QnVDmekUBc5muLAnqGj3RVXDfHlJ-lIqvhjZv58SS6PkMVEeIWd_ga5DJqTDU5RLc78GVOcH-95zF4MvRVz2Beba0YPlGuY4HSt0nI5qRZbU2LbvAMTyiME7iMTRU2osRensemMWnGkYjO_29coptxm3iz9N-E_fpxB71Bvt-hBTHMbK37cqJNlQw"
                />
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/50 bg-primary/80 text-white text-xs font-bold backdrop-blur">
                  +2K
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-white font-bold text-sm">
                  Tình nguyện viên
                </span>
                <span className="text-white/60 text-xs">
                  Đang hoạt động trên cả nước
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative h-screen overflow-y-auto">
        {/* Header */}
        <header className="w-full px-6 py-5 flex items-center justify-between z-20 absolute top-0 left-0 right-0 lg:relative">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-glow">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#0F172A] dark:text-white text-lg font-extrabold tracking-tight uppercase hidden sm:block">
              CỨU HỘ VIỆT NAM
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark transition-colors text-xs font-bold">
            <span className="material-symbols-outlined text-sm text-gray-700 dark:text-gray-200">
              language
            </span>
            <button
              onClick={() => setLanguage("vn")}
              className={`transition-colors ${language === "vn" ? "text-gray-700 dark:text-gray-200" : "text-gray-400"}`}
            >
              VN
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setLanguage("en")}
              className={`font-normal transition-colors ${language === "en" ? "text-gray-700 dark:text-gray-200" : "text-gray-400"}`}
            >
              EN
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-6">
          <div className="w-full max-w-[440px]">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft dark:shadow-none dark:border dark:border-gray-700 overflow-hidden">
              {/* Form */}
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Đăng nhập hệ thống
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vui lòng nhập thông tin để truy cập hệ thống.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary text-[20px]">
                          mail
                        </span>
                      </div>
                      <input
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 transition-all text-sm font-medium"
                        placeholder="example@email.com"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                      Mật khẩu
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary text-[20px]">
                          lock
                        </span>
                      </div>
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 transition-all text-sm font-medium"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                        type="checkbox"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-bold text-primary hover:text-primary-dark hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-[#063660] hover:bg-[#052949] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-primary/30 transform active:scale-[0.98] transition-all duration-200 gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-sm">
                          refresh
                        </span>
                        <span>ĐANG ĐĂNG NHẬP...</span>
                      </>
                    ) : (
                      <>
                        <span>ĐĂNG NHẬP</span>
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Chưa có tài khoản?
              <Link
                to="/register"
                className="font-bold text-primary hover:text-primary-dark ml-1 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>

            {/* Security Badges */}
            <div className="mt-8 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="h-8 w-auto flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span className="material-symbols-outlined">security</span> Bảo
                mật SSL
              </div>
              <div className="h-8 w-auto flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span className="material-symbols-outlined">gavel</span> Pháp lý
                rõ ràng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

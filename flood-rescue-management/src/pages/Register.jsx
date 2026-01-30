import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Register = () => {
  const [role, setRole] = useState("citizen"); // 'citizen' or 'official'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear messages when user types
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate input
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.password
      ) {
        setError("Vui lòng nhập đầy đủ thông tin");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      // Validate phone format (Vietnamese phone number)
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        setError("Số điện thoại không hợp lệ");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu không khớp");
        setLoading(false);
        return;
      }

      if (!formData.agreeTerms) {
        setError("Vui lòng đồng ý với điều khoản sử dụng");
        setLoading(false);
        return;
      }

      // Map role to backend format
      const roleMapping = {
        citizen: "CITIZEN",
        official: "RESCUE_COORDINATOR", // hoặc role khác tùy backend
      };

      // Call register API
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: roleMapping[role],
      });

      if (response.success) {
        if (role === "official") {
          setSuccess(
            "Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt từ quản trị viên. Bạn sẽ nhận được thông báo khi tài khoản được kích hoạt.",
          );
        } else {
          setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-white overflow-hidden">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-end bg-[#111617]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#111617] via-[#111617]/80 to-transparent z-10"></div>
          <div
            className="h-full w-full bg-cover bg-center opacity-60"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhwhAm5_DCZJfqK6nGimb2jqLJjO54vQFZpgYuxzd-HES9sehLVgoZlhVPtWFILPG6YK42Mzs8Sk4FbHYTnXxzLdeXlkwirSUCOrhU2YRkQPB74ADRDM5o8BeR5sdhYeYLK908BjrgnsAAjP7J0t6v5IxCHfzvAa3mWILnPQHnLyPpIwAiywTdmhyHEikyeE6spDgFcWBFlmIDX8og89FpPjIXDTGQOrLfBD2vNMzVCEvg9vDhl-5jYstR_k3nK0yx4Obw4zI2Xfo')",
            }}
          />
        </div>

        <div className="relative z-20 px-12 py-16 pb-24">
          <div className="mb-6 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
            <span className="material-symbols-outlined text-3xl">shield</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white mb-4">
            Cùng chung tay vì một cộng đồng an toàn hơn
          </h1>

          <p className="text-text-secondary text-lg font-light leading-relaxed max-w-md">
            Hệ thống quản lý và điều phối cứu trợ tập trung. Kết nối nguồn lực,
            chia sẻ thông tin và hỗ trợ kịp thời trong các tình huống khẩn cấp.
          </p>

          <div className="mt-10 flex gap-4">
            <div className="flex -space-x-3">
              <img
                alt="User Avatar 1"
                className="w-10 h-10 rounded-full border-2 border-[#111617]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAor-x19_NmBBvBMjTG0TGt0vdPmrb7hnic6D3YyJrO9DLbyfxQxIY48AN3iThLVQ6-aVVS15FKrWui0C8JDM3glQDmtZrAuS7pIWra6PfonyiTDovPD5KjR33X_p5Bhl1USSURplN-cBMmSHD47zIPHyV5awNEXMAcFrlh9SLkYQACiFJP4eq9Te94Gme57hVRMeC-ECoMO_xQ8cNdO3vKxzOiVioRETsS2bzyTKhy75OashDe-k2PNAf4RTidQtmieMrj3yXn1Zw"
              />
              <img
                alt="User Avatar 2"
                className="w-10 h-10 rounded-full border-2 border-[#111617]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjQUgH1oKIq7F5wT_Rgkj7QwTuORkvTCm0JxHBDIW8rvAuXJXAeCDYuNyNBvXhQfP2dnRpymJc1NUVJv8sfrmmrk136LHrOShqiGIUNKenGIrh_V0uPQv0_h3q-MU-NOXqFPGAhmpzSDHaryvh78s7rDGd_kgvzbQIwH_3gL0e18xqQBWHo9eTeO406oYoHCfQyjNX-4CIz1XM7B2jyTGVOcWgFKCujkjPDsTCqV5QocruKJlSLZ29b4U2xU70t6U_mi45uykWp_w"
              />
              <img
                alt="User Avatar 3"
                className="w-10 h-10 rounded-full border-2 border-[#111617]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1pVYjtDFABfh0lnTXoOJDF5AXYfSWjXgV9GtludaeEBIFeHMQy-gqzthUwmNH2lrKibE2VQEDlkVXsTSD5EKJvfXggSuOHeGTeza6P8ZAFwiyhmy04IidVma2gIlI2_ita50KedDaCcUpC_fJh7gRzBsmYjsugVr06fC-U6cFqc7B5gTiFrwvwmqGkz7ah-fPYNIo51rlxPd2Qu7ScBoeA7KbqY7ZJDm82cLMPRppsGZ0pHriANUmtM_bxbwhDNX1v6z7SyO2Ybw"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-white font-bold text-sm">12,000+</span>
              <span className="text-text-secondary text-xs">
                Tình nguyện viên đã tham gia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col h-full bg-background-dark relative overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden h-2 w-full bg-primary"></div>

        <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 sm:px-12">
          <div className="w-full max-w-[520px] flex flex-col gap-8">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Đăng Ký Tài Khoản Mới
              </h2>
              <p className="text-text-secondary text-base">
                Nhập thông tin để tham gia hệ thống cứu trợ.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider text-xs">
                  Vai trò tham gia
                </label>
                <div className="flex w-full bg-surface-dark p-1 rounded-lg">
                  <label className="flex-1 cursor-pointer">
                    <input
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="citizen"
                      checked={role === "citizen"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <div className="flex items-center justify-center py-2.5 rounded-md text-sm font-medium text-text-secondary transition-all peer-checked:bg-surface-darker peer-checked:text-white peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-border-dark hover:text-white">
                      <span className="material-symbols-outlined text-[18px] mr-2">
                        person
                      </span>
                      Người dân
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="official"
                      checked={role === "official"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <div className="flex items-center justify-center py-2.5 rounded-md text-sm font-medium text-text-secondary transition-all peer-checked:bg-surface-darker peer-checked:text-white peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-border-dark hover:text-white">
                      <span className="material-symbols-outlined text-[18px] mr-2">
                        badge
                      </span>
                      Cán bộ / Tổ chức
                    </div>
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-white text-sm font-medium leading-normal">
                  Họ và tên
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-darker border border-border-dark text-white text-base rounded-lg focus:ring-primary focus:border-primary block p-3 placeholder-text-secondary/50 transition-colors"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  type="text"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-white text-sm font-medium leading-normal">
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-surface-darker border border-border-dark text-white text-base rounded-lg focus:ring-primary focus:border-primary block p-3 placeholder-text-secondary/50 transition-colors"
                  placeholder="example@email.com"
                  type="email"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-white text-sm font-medium leading-normal">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-surface-darker border border-border-dark text-white text-base rounded-lg focus:ring-primary focus:border-primary block p-3 placeholder-text-secondary/50 transition-colors"
                  placeholder="0912 345 678"
                  type="tel"
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-white text-sm font-medium leading-normal">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-surface-darker border border-border-dark text-white text-base rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 placeholder-text-secondary/50 transition-colors"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary cursor-pointer hover:text-white text-[20px]"
                    >
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white text-sm font-medium leading-normal">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-surface-darker border border-border-dark text-white text-base rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 placeholder-text-secondary/50 transition-colors"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary cursor-pointer hover:text-white text-[20px]"
                    >
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 border border-border-dark rounded bg-surface-darker focus:ring-3 focus:ring-primary/30 focus:ring-offset-0 cursor-pointer"
                    type="checkbox"
                  />
                </div>
                <label
                  className="ml-3 text-sm font-medium text-text-secondary select-none cursor-pointer"
                  htmlFor="terms"
                >
                  Tôi đồng ý với{" "}
                  <a className="text-primary hover:underline" href="#">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a className="text-primary hover:underline" href="#">
                    Chính sách bảo mật
                  </a>{" "}
                  của hệ thống.
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-primary hover:bg-[#158bb3] focus:ring-4 focus:ring-primary/30 font-bold rounded-lg text-lg px-5 py-4 text-center mr-2 mb-2 transition-all shadow-[0_4px_14px_0_rgba(29,158,201,0.39)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN"}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-border-dark/50">
              <p className="text-text-secondary text-sm">
                Đã có tài khoản?
                <Link
                  to="/login"
                  className="font-bold text-white hover:text-primary transition-colors ml-1"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full py-4 text-center">
          <p className="text-[10px] text-text-secondary/40 uppercase tracking-widest">
            Hệ thống Cứu Trợ Quốc Gia © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

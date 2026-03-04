import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import api from "../../services/api";
import CitizenMapGoong from "../../components/citizen/CitizenMapGoong";

export default function CitizenReliefRequest() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		fullName: "",
		phone: "",
		address: "",
		description: "",
		supplies: {
			food: false,
			water: false,
			medicine: false,
			hygiene: false,
			clothes: false,
		},
	});

	const [isLocating, setIsLocating] = useState(false);
	const [coords, setCoords] = useState({ latitude: null, longitude: null });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isMapOpen, setIsMapOpen] = useState(false);

	const handleChange = (field) => (e) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleSupplyToggle = (key) => {
		setForm((prev) => ({
			...prev,
			supplies: { ...prev.supplies, [key]: !prev.supplies[key] },
		}));
	};

	const fillAddressFromCoords = async (latitude, longitude) => {
		try {
			const apiKey = import.meta.env.VITE_GOONG_GEOLOCATION_KEY;
			if (!apiKey) {
				console.warn("Thiếu VITE_GOONG_GEOLOCATION_KEY trong file .env");
				return;
			}

			const url = `https://rsapi.goong.io/geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`;
			const res = await fetch(url);
			const data = await res.json();

			const address = data?.results?.[0]?.formatted_address;
			if (address) {
				setForm((prev) => ({ ...prev, address }));
			}
		} catch (error) {
			console.error("Reverse geocode error", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setIsSubmitting(true);

			const user = currentUser;
			const selectedSupplies = Object.entries(form.supplies)
				.filter(([, value]) => value)
				.map(([key]) => key)
				.join(", ");

			const payload = {
				userId: user?.id ?? user?.userId ?? null,
				phone: form.phone,
				requestType: "RELIEF",
				latitude: coords.latitude ?? 0,
				longitude: coords.longitude ?? 0,
				description: form.description || "",
				priority: "LOW",
				requestSupplies: selectedSupplies || null,
				requestMedia: null,
			};

			// Gửi đúng endpoint /api/v1/rescue-requests/relief
			const response = await api.post("/rescue-requests/relief", payload);
			try {
				const created = response?.data?.data;
				if (created?.id != null) {
					localStorage.setItem("lastReliefRequestId", String(created.id));
				}
			} catch (err) {
				console.warn("Không lưu được lastReliefRequestId:", err);
			}

			alert("Yêu cầu nhu yếu phẩm đã được gửi thành công!");
		} catch (error) {
			console.error("Submit relief request error", error);
			const message =
				error.response?.data?.message ||
				error.message ||
				"Gửi yêu cầu nhu yếu phẩm thất bại. Vui lòng thử lại.";
			alert(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLogout = () => {
		authService.logout();
		navigate("/login");
	};

	const handleAutoLocation = async () => {
		try {
			if (!navigator.geolocation) {
				alert("Trình duyệt không hỗ trợ lấy vị trí tự động.");
				return;
			}

			setIsLocating(true);

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					try {
						const { latitude, longitude } = position.coords;

						setCoords({ latitude, longitude });
						await fillAddressFromCoords(latitude, longitude);
					} catch (error) {
						console.error("Auto location error", error);
						alert("Có lỗi khi lấy địa chỉ tự động.");
					} finally {
						setIsLocating(false);
					}
				},
				(error) => {
					console.error("Geolocation error", error);
					alert("Không lấy được vị trí. Vui lòng kiểm tra quyền truy cập vị trí.");
					setIsLocating(false);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				}
			);
		} catch (e) {
			console.error(e);
			alert("Có lỗi khi lấy vị trí tự động.");
			setIsLocating(false);
		}
	};

	const completedSteps = (() => {
		let steps = 0;
		if (form.fullName.trim() && form.phone.trim()) steps += 1;
		if (form.address.trim()) steps += 1;
		const hasSupplies = Object.values(form.supplies).some(Boolean);
		if (hasSupplies || form.description.trim()) steps += 1;
		return steps;
	})();

	const progressPercent = (completedSteps / 3) * 100;

	const currentUser = authService.getCurrentUser();
	const displayName =
		currentUser?.fullName || currentUser?.username || currentUser?.name || "Người dùng";
	const roleLabel = currentUser?.role === "CITIZEN" ? "Người dân" : "Người dùng";
	const avatarUrl =
		currentUser?.avatar ||
		"https://lh3.googleusercontent.com/aida-public/AB6AXuC5tF_1eIvvrD83eWRAoe-3d96B0aXaXs0jqAWxqyswKI8LBiqyVvXHOnhHzw7Lo0qP_mmp2JQP3ThRBAd0GohkAV439UpMYlBTQbLcWRY3WSY9C2s9jILWHGFq-ZDjSsiagrlYlpzMYlzr6tn60wG23atqijkSQSWYuGpd0_vlJ47riljO8rivoPHnrBImgTd_4MZ8AKU-xUIEDckE7iwA8Y3sEa_Fpguo4ZwL_MDTXnAITVBYEaXXfxKQb098GdXmTcTnamZUeU0";

	return (
		<div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-[#131416] dark:text-white transition-colors duration-200">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#dee0e3] dark:border-gray-800">
				<div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-primary p-1.5 rounded-lg text-white">
							<span className="material-symbols-outlined block">volunteer_activism</span>
						</div>
						<h2 className="text-xl font-bold tracking-tight">Cứu Hộ Việt Nam</h2>
						<span className="hidden md:inline-flex bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
							Hỗ trợ cứu trợ
						</span>
					</div>
					<div className="flex items-center gap-6">
						<div className="hidden md:flex items-center gap-6 text-sm font-medium">
							<Link className="hover:text-primary transition-colors" to="/citizen/dashboard">
								Trang chủ
							</Link>
							<Link className="hover:text-primary transition-colors" to="#">
								Bản đồ cứu trợ
							</Link>
							<Link className="hover:text-primary transition-colors" to="#">
								Hướng dẫn
							</Link>
						</div>
						<div className="flex items-center gap-3 border-l pl-6 border-gray-200 dark:border-gray-700">
							{currentUser ? (
								<>
									<button className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 pl-1 pr-3 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
										<div className="size-8 bg-gray-200 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:ring-primary/20 transition-all">
											<img alt="User Avatar" className="w-full h-full object-cover" src={avatarUrl} />
										</div>
										<div className="text-left hidden lg:block">
											<p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{displayName}</p>
											<p className="text-[10px] text-gray-500 font-medium">{roleLabel}</p>
										</div>
									</button>
									<button
										type="button"
										onClick={handleLogout}
										className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap ml-2"
									>
										Đăng xuất
									</button>
								</>
							) : (
								<Link
									to="/login"
									className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
								>
									Đăng nhập
								</Link>
							)}
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Main form area */}
				<form className="lg:col-span-8 space-y-8" onSubmit={handleSubmit}>
					<div className="text-center md:text-left">
						<h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4 text-primary">
							Gửi Yêu Cầu Nhu Yếu Phẩm
						</h1>
						<p className="text-[#6b7680] dark:text-gray-400 text-lg md:text-xl">
							Chúng tôi sẽ kết nối nhu cầu của bạn với các đơn vị cứu trợ và nhà hảo tâm gần nhất. Hãy giữ vững tinh thần.
						</p>
					</div>

					{/* Progress */}
					<div className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl p-6 shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<p className="text-lg font-bold">Tiến trình yêu cầu</p>
							<p className="text-primary font-bold text-sm bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">
								{completedSteps}/3 bước {completedSteps === 3 ? "hoàn tất" : ""}
							</p>
						</div>
						<div className="w-full bg-[#dee0e3] dark:bg-gray-800 h-3 rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all duration-500"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
						<p className="mt-3 text-[#6b7680] dark:text-gray-400 text-sm italic">
							{completedSteps === 3
								? "Sẵn sàng gửi thông tin cứu trợ ngay bây giờ."
								: "Vui lòng hoàn thành đủ thông tin ở các bước trên."}
						</p>
					</div>

					<div className="space-y-6">
						{/* Section 1: Recipient info */}
						<section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
							<div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-orange-50/30 dark:bg-gray-800/50">
								<h3 className="text-xl font-bold flex items-center gap-2">
									<span className="material-symbols-outlined text-primary">person</span>
									1. Thông tin người nhận
								</h3>
							</div>
							<div className="p-6 grid md:grid-cols-2 gap-6">
								<div className="flex flex-col gap-2">
									<label className="text-[#131416] dark:text-gray-200 text-lg font-bold">Họ và tên</label>
									<input
										className="h-14 rounded-lg border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:ring-0 focus:border-primary px-4"
										placeholder="Nhập tên người cần tiếp tế"
										type="text"
										value={form.fullName}
										onChange={handleChange("fullName")}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label className="text-[#131416] dark:text-gray-200 text-lg font-bold">Số điện thoại</label>
									<input
										className="h-14 rounded-lg border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:ring-0 focus:border-primary px-4"
										placeholder="Số liên lạc khẩn cấp"
										type="tel"
										value={form.phone}
										onChange={handleChange("phone")}
									/>
								</div>
							</div>
						</section>

						{/* Section 2: Location */}
						<section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
							<div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-orange-50/30 dark:bg-gray-800/50">
								<h3 className="text-xl font-bold flex items-center gap-2">
									<span className="material-symbols-outlined text-primary">local_shipping</span>
									2. Vị trí nhận hàng
								</h3>
							</div>
							<div className="p-6 space-y-6">
								<div className="flex flex-col gap-2">
									<label className="text-[#131416] dark:text-gray-200 text-lg font-bold">Địa chỉ chi tiết</label>
									<div className="flex flex-col md:flex-row gap-4">
										<input
											className="flex-1 h-14 rounded-lg border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:ring-0 focus:border-primary px-4"
											placeholder="Xóm, thôn, xã, huyện, tỉnh..."
											type="text"
											value={form.address}
											onChange={handleChange("address")}
										/>
										<button
											type="button"
											onClick={handleAutoLocation}
											className="bg-primary/10 hover:bg-primary/20 text-primary h-14 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap border border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
											disabled={isLocating}
										>
											<span className="material-symbols-outlined">my_location</span>
											{isLocating ? "Đang lấy vị trí..." : "Lấy vị trí tự động"}
										</button>
									</div>
								</div>
								<div className="rounded-xl overflow-hidden border border-[#dee0e3] dark:border-gray-700 h-48 bg-gray-100 relative">
									<button
										type="button"
										onClick={() => setIsMapOpen(true)}
										className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
									>
										<div className="bg-white/90 dark:bg-black/80 px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2">
											<span className="material-symbols-outlined text-primary">location_on</span>
											<span className="font-medium text-sm">Chọn vị trí trên bản đồ</span>
										</div>
									</button>
								</div>
							</div>
						</section>

						{/* Section 3: Supplies */}
						<section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
							<div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-orange-50/30 dark:bg-gray-800/50">
								<h3 className="text-xl font-bold flex items-center gap-2">
									<span className="material-symbols-outlined text-primary">inventory_2</span>
									3. Nhu yếu phẩm cần thiết
								</h3>
							</div>
							<div className="p-6 space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-colors">
										<input
											className="w-6 h-6 rounded text-primary focus:ring-primary border-gray-300"
											type="checkbox"
											checked={form.supplies.food}
											onChange={() => handleSupplyToggle("food")}
										/>
										<span className="font-bold">Thực phẩm (Mì tôm, gạo)</span>
									</label>
									<label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-colors">
										<input
											className="w-6 h-6 rounded text-primary focus:ring-primary border-gray-300"
											type="checkbox"
											checked={form.supplies.water}
											onChange={() => handleSupplyToggle("water")}
										/>
										<span className="font-bold">Nước sạch</span>
									</label>
									<label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-colors">
										<input
											className="w-6 h-6 rounded text-primary focus:ring-primary border-gray-300"
											type="checkbox"
											checked={form.supplies.medicine}
											onChange={() => handleSupplyToggle("medicine")}
										/>
										<span className="font-bold">Thuốc men / Sơ cứu</span>
									</label>
									<label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-colors">
										<input
											className="w-6 h-6 rounded text-primary focus:ring-primary border-gray-300"
											type="checkbox"
											checked={form.supplies.hygiene}
											onChange={() => handleSupplyToggle("hygiene")}
										/>
										<span className="font-bold">Đồ vệ sinh cá nhân</span>
									</label>
									<label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-colors col-span-full">
										<input
											className="w-6 h-6 rounded text-primary focus:ring-primary border-gray-300"
											type="checkbox"
											checked={form.supplies.clothes}
											onChange={() => handleSupplyToggle("clothes")}
										/>
										<span className="font-bold">Quần áo / Chăn màn</span>
									</label>
								</div>
								<div className="flex flex-col gap-2">
									<label className="text-[#131416] dark:text-gray-200 text-lg font-bold">Mô tả chi tiết nhu cầu</label>
									<textarea
										className="w-full rounded-lg border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:ring-0 focus:border-primary p-4"
										placeholder="Ví dụ: Cần sữa cho trẻ em 1 tuổi, băng vệ sinh phụ nữ, pin đèn pin..."
										rows={4}
										value={form.description}
										onChange={handleChange("description")}
									></textarea>
								</div>
							</div>
						</section>

						{/* Section 4: Photos */}
						<section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
							<div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-orange-50/30 dark:bg-gray-800/50">
								<h3 className="text-xl font-bold flex items-center gap-2">
									<span className="material-symbols-outlined text-primary">photo_camera</span>
									4. Ảnh hiện trạng
								</h3>
							</div>
							<div className="p-6">
								<div className="border-2 border-dashed border-[#dee0e3] dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center gap-3 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-orange-50/30 transition-colors cursor-pointer group">
									<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
									</div>
									<div className="text-center">
										<p className="text-lg font-bold">Tải ảnh khu vực của bạn</p>
										<p className="text-[#6b7680] text-sm">
											Giúp chúng tôi nhận diện môi trường xung quanh (Tối đa 5 ảnh)
										</p>
									</div>
								</div>
							</div>
						</section>
					</div>

					{/* Submit */}
					<div className="py-10">
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-[#218838] hover:bg-[#19692c] text-white py-6 rounded-2xl text-2xl md:text-3xl font-black uppercase tracking-wider shadow-xl shadow-green-500/30 transform active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<span className="material-symbols-outlined text-4xl">local_shipping</span>
							{isSubmitting ? "Đang gửi yêu cầu..." : "GỬI YÊU CẦU TIẾP TẾ"}
						</button>
						<div className="mt-6 flex flex-col items-center text-center gap-3">
							<div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-widest">
								<span className="material-symbols-outlined text-sm">lock</span>
								Bảo mật cấp chính phủ
							</div>
							<p className="text-[#6b7680] dark:text-gray-400 font-medium text-sm">
								Thông tin của bạn được ưu tiên xử lý bởi Ban Chỉ đạo Phòng chống Thiên tai Quốc gia.
							</p>
						</div>
					</div>
				</form>

				{isMapOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col">
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
								<h3 className="text-lg font-bold flex items-center gap-2">
									<span className="material-symbols-outlined text-primary">map</span>
									Chọn vị trí nhận hàng
								</h3>
								<button
									type="button"
									onClick={() => setIsMapOpen(false)}
									className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<span className="material-symbols-outlined">close</span>
								</button>
							</div>
							<div className="flex-1">
								<CitizenMapGoong
									initialCoords={coords.latitude && coords.longitude ? coords : null}
									onSelectLocation={async ({ latitude, longitude }) => {
										setCoords({ latitude, longitude });
										await fillAddressFromCoords(latitude, longitude);
									}}
								/>
							</div>
							<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
								<div className="text-gray-600 dark:text-gray-300">
									Tọa độ đã chọn: {coords.latitude && coords.longitude
										? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
										: "Chưa chọn"}
								</div>
								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setIsMapOpen(false)}
										className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
									>
										Hủy
									</button>
									<button
										type="button"
										onClick={() => setIsMapOpen(false)}
										className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
									>
										Xác nhận vị trí
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sidebar */}
				<aside className="lg:col-span-4 space-y-6">
					<div className="sticky top-24">
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl shadow-sm mb-6">
							<h4 className="text-red-600 dark:text-red-400 font-black text-sm uppercase mb-4 tracking-widest flex items-center gap-2">
								<span className="material-symbols-outlined">emergency</span>
								Liên hệ khẩn cấp
							</h4>
							<div className="space-y-4">
								<div className="flex justify-between items-center border-b border-red-100 dark:border-red-800 pb-3">
									<span className="font-bold text-gray-700 dark:text-gray-300">Cảnh sát</span>
									<a className="text-3xl font-black text-red-600 hover:scale-105 transition-transform" href="tel:113">
										113
									</a>
								</div>
								<div className="flex justify-between items-center border-b border-red-100 dark:border-red-800 pb-3">
									<span className="font-bold text-gray-700 dark:text-gray-300">Cứu hỏa</span>
									<a className="text-3xl font-black text-red-600 hover:scale-105 transition-transform" href="tel:114">
										114
									</a>
								</div>
								<div className="flex justify-between items-center">
									<span className="font-bold text-gray-700 dark:text-gray-300">Cấp cứu</span>
									<a className="text-3xl font-black text-red-600 hover:scale-105 transition-transform" href="tel:115">
										115
									</a>
								</div>
							</div>
						</div>
						<div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50 p-6 rounded-2xl shadow-sm">
							<h4 className="text-orange-600 dark:text-orange-400 font-black text-sm uppercase mb-3 tracking-widest flex items-center gap-2">
								<span className="material-symbols-outlined">tips_and_updates</span>
								Lời khuyên an toàn
							</h4>
							<ul className="text-sm space-y-3 text-orange-800 dark:text-orange-200">
								<li className="flex gap-2">
									<span className="text-primary font-bold">•</span>
									<span>Ưu tiên nước uống sạch và đồ khô có thời hạn sử dụng lâu.</span>
								</li>
								<li className="flex gap-2">
									<span className="text-primary font-bold">•</span>
									<span>Luôn giữ pin điện thoại ở chế độ tiết kiệm năng lượng.</span>
								</li>
								<li className="flex gap-2">
									<span className="text-primary font-bold">•</span>
									<span>Để sẵn một túi cứu thương bao gồm các loại thuốc cơ bản.</span>
								</li>
								<li className="flex gap-2">
									<span className="text-primary font-bold">•</span>
									<span>Không tự ý di chuyển qua dòng nước lũ nếu không có hỗ trợ.</span>
								</li>
							</ul>
						</div>
					</div>
				</aside>
			</main>

			{/* Footer */}
			<footer className="bg-white dark:bg-background-dark border-t border-[#dee0e3] dark:border-gray-800 py-12 mt-12">
				<div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-4 gap-8">
					<div className="col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<div className="bg-primary p-1 rounded text-white">
								<span className="material-symbols-outlined block text-sm">volunteer_activism</span>
							</div>
							<span className="font-bold">Hệ thống Điều phối Cứu hộ Quốc gia</span>
						</div>
						<p className="text-sm text-[#6b7680] max-w-sm">
							Phát triển bởi Ban Chỉ đạo Quốc gia về Phòng chống thiên tai. Hệ thống kết nối người dân với các đơn vị cứu trợ quân đội, công an và tình nguyện viên trên toàn quốc.
						</p>
					</div>
					<div>
						<h5 className="font-bold mb-4 text-sm uppercase tracking-wider">Thông tin</h5>
						<ul className="text-sm space-y-2 text-[#6b7680]">
							<li>
								<a className="hover:text-primary" href="#">
									Về chúng tôi
								</a>
							</li>
							<li>
								<a className="hover:text-primary" href="#">
									Chính sách bảo mật
								</a>
							</li>
							<li>
								<a className="hover:text-primary" href="#">
									Điều khoản sử dụng
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h5 className="font-bold mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h5>
						<ul className="text-sm space-y-2 text-[#6b7680]">
							<li>
								<a className="hover:text-primary" href="#">
									Câu hỏi thường gặp
								</a>
							</li>
							<li>
								<a className="hover:text-primary" href="#">
									Báo lỗi hệ thống
								</a>
							</li>
							<li>
								<a className="hover:text-primary" href="#">
									Cẩm nang thoát nạn
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-[#f1f2f3] dark:border-gray-800 text-center text-xs text-[#6b7680]">
					© 2024 Cứu Hộ Việt Nam. Một sáng kiến vì cộng đồng.
				</div>
			</footer>
		</div>
	);
}


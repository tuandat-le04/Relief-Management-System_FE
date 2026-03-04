import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const ReportRescueTeam = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		authService.logout();
		navigate("/login");
	};
	return (
		<>
			<header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-background-dark px-6 py-3 lg:px-10 shadow-sm">
				<div className="flex items-center gap-8">
					<div className="flex items-center gap-3">
						<div className="bg-primary p-2 rounded-lg text-white shadow-lg shadow-primary/30">
							<span className="material-symbols-outlined block text-2xl">emergency</span>
						</div>
						<div>
							<h2 className="text-[#131416] dark:text-white text-xl font-black leading-tight tracking-tight uppercase">Cứu Hộ VN</h2>
							<p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Team Alpha-1</p>
						</div>
					</div>
					<div className="hidden md:flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5">
						<span className="w-2 h-2 rounded-full bg-success-green animate-pulse mr-2"></span>
						<span className="text-success-green text-xs font-bold uppercase">Hệ thống trực tuyến</span>
					</div>
				</div>
				<div className="flex items-center gap-4 lg:gap-6">
					<nav className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
						<button
							type="button"
							onClick={() => navigate("/rescue-team/dashboard")}
							className="px-4 py-2 rounded-md text-[#6b7680] dark:text-gray-400 text-sm font-bold hover:text-primary transition-colors"
						>
							Nhiệm vụ
						</button>
						<button
							type="button"
							className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-primary text-sm font-bold"
						>
							Lịch sử
						</button>
					</nav>
					<button className="flex items-center justify-center rounded-lg h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-black shadow-lg shadow-red-600/30 transition-all active:scale-95 border-2 border-red-500">
						<span className="material-symbols-outlined mr-2">campaign</span>
						<span>SOS</span>
					</button>
					<button
						type="button"
						onClick={handleLogout}
						className="hidden sm:inline-flex items-center justify-center rounded-lg h-11 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-bold border border-gray-300 dark:border-gray-600 transition-colors"
					>
						<span className="material-symbols-outlined mr-1 text-base">logout</span>
						<span>Đăng xuất</span>
					</button>
					<div
						className="h-11 w-11 rounded-full bg-cover bg-center border-2 border-white shadow-md ring-2 ring-primary/20"
						data-alt="Ảnh đại diện đội trưởng đội cứu hộ"
						style={{
							backgroundImage:
								'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuyHJht1Ui_YnTJY1DSTJcepL41z4IZMSumUIurIVYz9lef0hO7-k_3uGKOnurRxgL8dyP3uXt8LLnxj0am06PnWSIY2rEbTIWwBVHMyaX-Ubx2HcV_jmPv0vWeY7QjH7wnnbSuvmdF3a96wV66E8_Xkkm4SJzfiy5u8pZsR7Jg1GT1YRXxBBTCjsOtcNX1pL-AlsMP3II1iJxEO0E1UYqEpwzWTj6UZeSCvlEbrTbzEdxkZ8BFHsX9mCnN-_TbKVl9lw6NXuuRBM")',
						}}
					></div>
				</div>
			</header>
			<main className="bg-background-light dark:bg-background-dark font-display text-[#131416] dark:text-white min-h-screen">
				<div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
					<aside className="hidden lg:flex flex-col w-72 border-r border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1c1e22] p-4 gap-6 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
						<div className="px-2">
							<h1 className="text-[#131416] dark:text-white text-xl font-black mb-1">Đội Cứu Hộ 01</h1>
							<p className="text-sm text-gray-500 font-medium">Khu vực: Quận 1 - Bình Thạnh</p>
						</div>
						<nav className="flex flex-col gap-2 flex-1">
							<button
								type="button"
								onClick={() => navigate("/rescue-team/dashboard")}
								className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
							>
								<span className="material-symbols-outlined">assignment</span>
								<p className="text-sm font-bold">Nhiệm vụ</p>
							</button>
							<button
								type="button"
								onClick={() => navigate("/rescue-team/members")}
								className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
							>
								<span className="material-symbols-outlined">groups</span>
								<p className="text-sm font-bold">Thành viên</p>
							</button>
							<button
								type="button"
								className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 cursor-pointer text-left"
							>
								<div className="flex items-center gap-3">
									<span className="material-symbols-outlined">history</span>
									<p className="text-sm font-bold">Lịch sử</p>
								</div>
							</button>
						</nav>
						<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
							<div className="flex items-start gap-3">
								<span className="material-symbols-outlined text-primary">cloud</span>
								<div>
									<p className="text-xs font-bold text-gray-500 uppercase">Thời tiết hiện tại</p>
									<p className="text-sm font-bold text-gray-900 dark:text-white">Mưa lớn, Ngập cục bộ</p>
									<p className="text-xs text-primary font-bold mt-1">26°C - Gió ĐN 15km/h</p>
								</div>
							</div>
						</div>
					</aside>
					<section className="flex-1 flex flex-col h-full bg-[#f6f7f8] dark:bg-background-dark overflow-hidden relative">
						<div className="flex-1 overflow-y-auto task-scroll p-6 lg:p-10">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
								<div className="bg-white dark:bg-[#1c1e22] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
									<div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-3 rounded-xl">
										<span className="material-symbols-outlined text-3xl">task_alt</span>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Tổng nhiệm vụ</p>
										<h3 className="text-3xl font-black text-gray-900 dark:text-white">124</h3>
									</div>
								</div>
								<div className="bg-white dark:bg-[#1c1e22] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
									<div className="bg-green-100 dark:bg-green-900/30 text-success-green p-3 rounded-xl">
										<span className="material-symbols-outlined text-3xl">person_check</span>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Người đã cứu</p>
										<h3 className="text-3xl font-black text-gray-900 dark:text-white">318</h3>
									</div>
								</div>
								<div className="bg-white dark:bg-[#1c1e22] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
									<div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 p-3 rounded-xl">
										<span className="material-symbols-outlined text-3xl">timer</span>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Giờ hoạt động</p>
										<h3 className="text-3xl font-black text-gray-900 dark:text-white">860h</h3>
									</div>
								</div>
								<div className="bg-white dark:bg-[#1c1e22] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
									<div className="bg-red-100 dark:bg-red-900/30 text-red-600 p-3 rounded-xl">
										<span className="material-symbols-outlined text-3xl">medical_services</span>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Sơ cứu tại chỗ</p>
										<h3 className="text-3xl font-black text-gray-900 dark:text-white">42</h3>
									</div>
								</div>
							</div>
							<div className="bg-white dark:bg-[#1c1e22] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
								<div className="flex items-center gap-2 w-full md:w-auto">
									<div className="relative w-full md:w-64">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
										<input
											className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
											placeholder="Tìm theo mã, tên nạn nhân..."
											type="text"
										/>
									</div>
								</div>
								<div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
									<div className="flex items-center gap-2">
										<label className="text-sm font-bold text-gray-500 whitespace-nowrap">Lọc theo:</label>
										<select className="py-2 pl-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium dark:text-white focus:ring-primary focus:border-primary cursor-pointer">
											<option>Ngày hoàn thành</option>
											<option>Mới nhất</option>
											<option>Cũ nhất</option>
										</select>
									</div>
									<select className="py-2 pl-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium dark:text-white focus:ring-primary focus:border-primary cursor-pointer">
										<option>Kết quả nhiệm vụ</option>
										<option>Tất cả</option>
										<option>Đã sơ tán</option>
										<option>Cấp cứu tại chỗ</option>
										<option>Chuyển viện</option>
									</select>
									<button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
										<span className="material-symbols-outlined text-lg">download</span>
										Xuất báo cáo
									</button>
								</div>
							</div>
							<div className="bg-white dark:bg-[#1c1e22] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse">
										<thead>
											<tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 font-bold">
												<th className="px-6 py-4">Mã Nhiệm Vụ</th>
												<th className="px-6 py-4">Tên Nạn Nhân</th>
												<th className="px-6 py-4">Địa Điểm</th>
												<th className="px-6 py-4">Thời Gian Hoàn Thành</th>
												<th className="px-6 py-4">Kết Quả</th>
												<th className="px-6 py-4">Ghi Chú</th>
												<th className="px-6 py-4 text-center">Hành Động</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9920</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Trần Thị B</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="45 Nguyễn Huệ, Quận 1"
												>
													45 Nguyễn Huệ, Quận 1
												</td>
												<td className="px-6 py-4 text-gray-500">10/10/2023 - 14:30</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
														Đã sơ tán
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Sức khỏe ổn định, đã đưa về khu tập trung.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9918</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Lê Văn C</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="Hẻm 203 XVNT, Bình Thạnh"
												>
													Hẻm 203 XVNT, Bình Thạnh
												</td>
												<td className="px-6 py-4 text-gray-500">10/10/2023 - 11:15</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
														<span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
														Cấp cứu tại chỗ
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Vết thương phần mềm, đã băng bó.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9892</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Gia đình anh Nam (4 người)</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="Khu dân cư Thanh Đa, Bình Thạnh"
												>
													Khu dân cư Thanh Đa, Bình Thạnh
												</td>
												<td className="px-6 py-4 text-gray-500">09/10/2023 - 22:45</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
														Đã sơ tán
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Nước ngập sâu 1.5m, di dời bằng xuồng.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9885</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Nguyễn Văn K</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="Cầu Sài Gòn (Chân cầu)"
												>
													Cầu Sài Gòn (Chân cầu)
												</td>
												<td className="px-6 py-4 text-gray-500">09/10/2023 - 19:20</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
														<span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
														Chuyển viện
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Gãy chân, chuyển BV Nhân dân Gia Định.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9850</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Cụ bà H'Hen</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="Chung cư cũ, Phường 27, Bình Thạnh"
												>
													Chung cư cũ, P.27, Bình Thạnh
												</td>
												<td className="px-6 py-4 text-gray-500">09/10/2023 - 08:10</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
														Đã sơ tán
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Cung cấp lương thực, đưa đến nhà người thân.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
											<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
												<td className="px-6 py-4">
													<span className="font-mono font-bold text-primary">#RE-9842</span>
												</td>
												<td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Nhóm công nhân (3 người)</td>
												<td
													className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate"
													title="Công trường xây dựng đường D1"
												>
													Công trường đường D1
												</td>
												<td className="px-6 py-4 text-gray-500">08/10/2023 - 17:40</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
														Đã sơ tán
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
													Mắc kẹt do giàn giáo sập, không thương tích.
												</td>
												<td className="px-6 py-4 text-center">
													<button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
														<span className="material-symbols-outlined text-xl">visibility</span>
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Hiển thị <span className="font-bold text-gray-900 dark:text-white">1-6</span> trên
										<span className="font-bold text-gray-900 dark:text-white"> 124</span> nhiệm vụ
									</p>
									<div className="flex gap-2">
										<button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-sm font-bold">
											Trước
										</button>
										<button className="px-3 py-1 rounded bg-primary text-white text-sm font-bold shadow">1</button>
										<button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold">
											2
										</button>
										<button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold">
											3
										</button>
										<span className="px-2 py-1 text-gray-400">...</span>
										<button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold">
											Sau
										</button>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
				<button className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl z-50 ring-4 ring-red-600/30">
					<span className="material-symbols-outlined text-4xl">emergency_share</span>
				</button>
			</main>
		</>
	);
};

export default ReportRescueTeam;


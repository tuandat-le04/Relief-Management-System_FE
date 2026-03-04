import React, { useState, useEffect } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  Inventory2 as BoxIcon,
  LocalShipping as ShipIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as DownloadIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as ClockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  LocalHospital as MedicalIcon,
  Restaurant as FoodIcon,
  Water as WaterIcon,
  Checkroom as ClothIcon,
  Speed as SpeedIcon,
  Emergency as EmergencyIcon,
} from "@mui/icons-material";
import {
  getAllWarehouses,
  getWarehouseInventory,
  inventoryIn,
  inventoryOut,
} from "../../services/warehouseService";

export default function ManagerInventory() {
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch warehouses và inventory khi component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Fetch inventory khi warehouse được chọn thay đổi
  useEffect(() => {
    if (selectedWarehouse && selectedWarehouse !== "all") {
      fetchInventory(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  // Lấy danh sách warehouses
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await getAllWarehouses();
      if (response.success) {
        setWarehouses(response.data);
        // Nếu có warehouse, lấy inventory của warehouse đầu tiên
        if (response.data.length > 0 && selectedWarehouse === "all") {
          fetchInventory(response.data[0].id);
        }
      }
    } catch (err) {
      setError("Không thể tải danh sách kho");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy inventory của warehouse
  const fetchInventory = async (warehouseId) => {
    try {
      setLoading(true);
      const response = await getWarehouseInventory(warehouseId);
      if (response.success) {
        // Transform API data to match component's expected format
        const transformedItems = response.data.items.map((item) => ({
          id: item.itemId,
          name: item.itemName,
          category: getCategoryByItemName(item.itemName),
          warehouse: getWarehouseName(warehouseId),
          quantity: item.quantity,
          unit: getUnitByItemName(item.itemName),
          status: getStatusByQuantity(item.quantity),
          lastUpdate: "Vừa cập nhật",
          icon: getIconByItemName(item.itemName),
          iconColor: getColorByItemName(item.itemName),
        }));
        setInventoryItems(transformedItems);
      }
    } catch (err) {
      setError("Không thể tải inventory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to transform data
  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? warehouse.resourceId : "Kho không xác định";
  };

  const getCategoryByItemName = (itemName) => {
    if (
      itemName.toLowerCase().includes("gạo") ||
      itemName.toLowerCase().includes("mì")
    ) {
      return "Lương thực";
    } else if (itemName.toLowerCase().includes("nước")) {
      return "Nhu yếu phẩm";
    } else if (
      itemName.toLowerCase().includes("thuốc") ||
      itemName.toLowerCase().includes("vaccine")
    ) {
      return "Y tế";
    } else {
      return "Vật dụng";
    }
  };

  const getUnitByItemName = (itemName) => {
    if (itemName.toLowerCase().includes("gạo")) return "bao";
    if (itemName.toLowerCase().includes("nước")) return "thùng";
    if (itemName.toLowerCase().includes("mì")) return "thùng";
    if (itemName.toLowerCase().includes("vaccine")) return "liều";
    return "cái";
  };

  const getStatusByQuantity = (quantity) => {
    if (quantity < 50) return "critical";
    if (quantity < 100) return "warning";
    return "good";
  };

  const getIconByItemName = (itemName) => {
    if (
      itemName.toLowerCase().includes("gạo") ||
      itemName.toLowerCase().includes("mì")
    ) {
      return <FoodIcon sx={{ fontSize: 20 }} />;
    } else if (itemName.toLowerCase().includes("nước")) {
      return <WaterIcon sx={{ fontSize: 20 }} />;
    } else if (
      itemName.toLowerCase().includes("thuốc") ||
      itemName.toLowerCase().includes("vaccine")
    ) {
      return <MedicalIcon sx={{ fontSize: 20 }} />;
    } else {
      return <BoxIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getColorByItemName = (itemName) => {
    if (
      itemName.toLowerCase().includes("gạo") ||
      itemName.toLowerCase().includes("mì")
    ) {
      return "text-blue-500";
    } else if (itemName.toLowerCase().includes("nước")) {
      return "text-cyan-500";
    } else if (
      itemName.toLowerCase().includes("thuốc") ||
      itemName.toLowerCase().includes("vaccine")
    ) {
      return "text-red-500";
    } else {
      return "text-slate-500";
    }
  };

  // Xử lý nhập kho
  const handleInventoryIn = async (warehouseId, itemId, quantity) => {
    try {
      const response = await inventoryIn(warehouseId, { itemId, quantity });
      if (response.success) {
        // Refresh inventory sau khi nhập kho thành công
        fetchInventory(warehouseId);
        alert("Nhập kho thành công!");
      }
    } catch (err) {
      alert("Lỗi khi nhập kho: " + err.message);
      console.error(err);
    }
  };

  // Xử lý xuất kho
  const handleInventoryOut = async (warehouseId, itemId, quantity) => {
    try {
      const response = await inventoryOut(warehouseId, { itemId, quantity });
      if (response.success) {
        // Refresh inventory sau khi xuất kho thành công
        fetchInventory(warehouseId);
        alert("Xuất kho thành công!");
      }
    } catch (err) {
      alert("Lỗi khi xuất kho: " + err.message);
      console.error(err);
    }
  };

  // Stats data for main categories (tính toán từ inventory items)
  const inventoryStats = [
    {
      title: "Gạo & Lương Khô",
      value: inventoryItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes("gạo") ||
            item.name.toLowerCase().includes("mì"),
        )
        .reduce((acc, item) => acc + item.quantity, 0)
        .toString(),
      unit: "Bao/Thùng",
      percentage: 85,
      status: "good",
      change: "+2.5",
      icon: <FoodIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      remaining: "Ổn định",
    },
    {
      title: "Nước Sạch",
      value: inventoryItems
        .filter((item) => item.name.toLowerCase().includes("nước"))
        .reduce((acc, item) => acc + item.quantity, 0)
        .toString(),
      unit: "Thùng",
      percentage: 60,
      status: "normal",
      change: "+400",
      icon: <WaterIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
      remaining: "Ổn định",
    },
    {
      title: "Mì Tôm & Đồ Hộp",
      value: inventoryItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes("mì") ||
            item.name.toLowerCase().includes("hộp"),
        )
        .reduce((acc, item) => acc + item.quantity, 0)
        .toString(),
      unit: "Thùng",
      percentage: 42,
      status: "warning",
      change: "-300",
      icon: <BoxIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      remaining: "Cần bổ sung",
    },
    {
      title: "Thuốc & Y Tế",
      value: inventoryItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes("thuốc") ||
            item.name.toLowerCase().includes("vaccine"),
        )
        .reduce((acc, item) => acc + item.quantity, 0)
        .toString(),
      unit: "Liều/Hộp",
      percentage: 15,
      status: "critical",
      change: "-50",
      icon: <MedicalIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
      remaining: "KHẨN CẤP",
    },
  ];

  // Pending requests data (giữ nguyên mock data vì chưa có API)
  const [pendingRequests] = useState([
    {
      id: 1,
      requester: "Điều phối viên An",
      location: "Khu vực A - Xã Hòa Vang",
      items: [
        { name: "Gạo", quantity: "500 kg" },
        { name: "Nước sạch", quantity: "200 thùng" },
      ],
      time: "10p trước",
      priority: "normal",
      avatar: "A1",
    },
    {
      id: 2,
      requester: "Trạm Y Tế B",
      location: "Khu vực B - Huyện Lệ Thủy",
      items: [
        { name: "Thuốc hạ sốt", quantity: "50 hộp" },
        { name: "Băng gạc", quantity: "100 cuộn" },
      ],
      time: "35p trước",
      priority: "urgent",
      avatar: "B2",
    },
    {
      id: 3,
      requester: "Tình nguyện viên Tuấn",
      location: "Khu vực C - Vùng Cô Lập",
      items: [
        { name: "Áo phao", quantity: "20 cái" },
        { name: "Đèn pin", quantity: "15 cái" },
      ],
      time: "1h trước",
      priority: "normal",
      avatar: "C5",
    },
  ]);

  // Critical items (tính toán từ inventory items)
  const criticalItems = inventoryItems
    .filter((item) => item.status === "critical")
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      remaining: `${item.quantity} ${item.unit}`,
      icon: item.icon,
    }));

  const getStatusColor = (percentage) => {
    if (percentage >= 70) return "bg-emerald-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status) => {
    const styles = {
      good: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      critical: "bg-red-50 text-red-700 border-red-200",
    };
    const labels = {
      good: "Sẵn sàng",
      warning: "Sắp hết",
      critical: "Cảnh báo thấp",
    };
    return {
      style: styles[status] || styles.good,
      label: labels[status] || status,
    };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshIcon
                  sx={{ fontSize: 48 }}
                  className="text-blue-500 animate-spin mb-4"
                />
                <p className="text-slate-600 font-semibold">
                  Đang tải dữ liệu...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <WarningIcon sx={{ fontSize: 24 }} className="text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">Lỗi</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={fetchWarehouses}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                      Quản Lý Kho Hàng
                    </h1>
                    <p className="text-slate-600 text-base">
                      Theo dõi, điều phối và kiểm soát hàng cứu trợ tập trung •
                      <span className="text-slate-900 font-semibold ml-1">
                        {new Date().toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fetchWarehouses()}
                      className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <RefreshIcon sx={{ fontSize: 20 }} />
                      <span>Làm mới</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-orange-50 border-2 border-orange-300 rounded-2xl text-orange-600 font-semibold transition-all duration-300 shadow-sm hover:shadow-lg">
                      <EmergencyIcon sx={{ fontSize: 20 }} />
                      <span>Xuất kho khẩn cấp</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold">
                      <AddIcon sx={{ fontSize: 20 }} />
                      <span>Nhập kho mới</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {inventoryStats.map((stat, index) => (
                  <div
                    key={index}
                    className={`group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border-2 transition-all duration-500 overflow-hidden ${
                      stat.status === "critical"
                        ? "border-red-200 hover:border-red-300"
                        : stat.status === "warning"
                          ? "border-amber-200 hover:border-amber-300"
                          : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Background gradient effect */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        stat.status === "critical"
                          ? "bg-gradient-to-br from-red-50 to-transparent"
                          : stat.status === "warning"
                            ? "bg-gradient-to-br from-amber-50 to-transparent"
                            : "bg-gradient-to-br from-slate-50 to-transparent"
                      }`}
                    ></div>

                    {stat.status === "critical" && (
                      <div className="absolute top-4 right-4">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      </div>
                    )}

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3.5 rounded-2xl ${stat.iconBg} shadow-lg shadow-black/10 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        >
                          {stat.icon}
                        </div>
                      </div>

                      <div className="space-y-1 mb-4">
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                          {stat.value}
                          <span className="text-lg font-semibold text-slate-500 ml-1">
                            {stat.unit}
                          </span>
                        </h3>
                        <p className="text-sm font-semibold text-slate-900">
                          {stat.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              stat.status === "critical"
                                ? "text-red-600"
                                : stat.status === "warning"
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                            }`}
                          >
                            {stat.percentage}% Sức chứa
                          </span>
                          <span className="text-xs text-slate-500">
                            • {stat.remaining}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getStatusColor(stat.percentage)}`}
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Pending Requests Column */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                          <ClockIcon sx={{ fontSize: 24 }} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            Yêu cầu chờ duyệt
                          </h2>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {pendingRequests.length} yêu cầu đang chờ
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold">
                        {pendingRequests.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`group p-5 rounded-2xl border-2 transition-all duration-300 ${
                          request.priority === "urgent"
                            ? "bg-red-50/50 border-red-200 hover:border-red-300 hover:bg-red-50"
                            : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-300 shadow-lg">
                              {request.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {request.requester}
                              </p>
                              <p className="text-xs text-slate-600">
                                {request.location}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-1 rounded-lg font-medium">
                            {request.time}
                          </span>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl mb-3 space-y-1.5 border border-slate-200">
                          {request.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs"
                            >
                              <span
                                className={`font-medium ${request.priority === "urgent" ? "text-red-700" : "text-slate-600"}`}
                              >
                                {item.name}:
                              </span>
                              <span className="text-slate-900 font-bold">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/20">
                            <CheckIcon sx={{ fontSize: 16 }} />
                            Duyệt xuất kho
                          </button>
                          <button className="px-4 py-2.5 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all duration-300">
                            <CancelIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Table Column */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                          <BoxIcon sx={{ fontSize: 24 }} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            Danh sách tồn kho theo khu vực
                          </h2>
                          <p className="text-sm text-slate-600 mt-0.5">
                            Quản lý và theo dõi vật tư
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Warehouse selector */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                          <button
                            onClick={() => setSelectedWarehouse("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                              selectedWarehouse === "all"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Tất cả
                          </button>
                          {warehouses.map((warehouse) => (
                            <button
                              key={warehouse.id}
                              onClick={() => setSelectedWarehouse(warehouse.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                selectedWarehouse === warehouse.id
                                  ? "bg-white text-slate-900 shadow-sm"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {warehouse.resourceId}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <SearchIcon
                          sx={{ fontSize: 18 }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Tìm kiếm vật tư..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <button className="p-2.5 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
                        <FilterIcon
                          sx={{ fontSize: 20 }}
                          className="text-slate-600"
                        />
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-slate-900/20">
                        <DownloadIcon sx={{ fontSize: 18 }} />
                        <span>Xuất</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-slate-50/50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Tên vật tư
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Mã Kho
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Tồn kho
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Cập nhật
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryItems.map((item, idx) => {
                          const status = getStatusBadge(item.status);
                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-slate-50 transition-colors ${
                                item.status === "critical" ? "bg-red-50/30" : ""
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${item.iconColor}`}
                                  >
                                    {item.icon}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {item.category}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {item.warehouse}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-lg font-bold text-slate-900">
                                  {item.quantity}
                                  <span className="text-xs font-normal text-slate-500 ml-1">
                                    {item.unit}
                                  </span>
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.style}`}
                                >
                                  {item.status === "critical" && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                  )}
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {item.lastUpdate}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                  <MoreIcon
                                    sx={{ fontSize: 20 }}
                                    className="text-slate-600"
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Critical Items Alert */}
              <div className="bg-gradient-to-r from-red-50 via-red-50/50 to-transparent rounded-3xl p-6 border-2 border-red-200 shadow-lg shadow-red-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-100 rounded-2xl text-red-600 shadow-lg shadow-red-200/50">
                      <WarningIcon sx={{ fontSize: 32 }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-900 mb-1">
                        Cảnh báo tồn kho nghiêm trọng
                      </h3>
                      <p className="text-sm text-red-700">
                        Các vật phẩm dưới mức an toàn cần nhập kho ngay lập tức
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 whitespace-nowrap">
                    Tạo phiếu nhập khẩn cấp
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {criticalItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white border-2 border-red-100 hover:border-red-300 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-red-600 font-semibold">
                            Còn lại: {item.remaining}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-100 group-hover:bg-red-600 group-hover:text-white px-3 py-1.5 rounded-xl font-semibold transition-all duration-300">
                        Nhập ngay
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-xs text-slate-500">
                  © 2024 ReliefOps System. Inventory Module v2.4.1 (Build 8902)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

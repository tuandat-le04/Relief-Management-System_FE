import React, { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  Inventory2 as BoxIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  LocalHospital as MedicalIcon,
  Restaurant as FoodIcon,
  WaterDrop as WaterIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  VolunteerActivism as DistributeIcon,
  LocationOn as LocationIcon,
  Warehouse as WarehouseIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  PauseCircle as PauseIcon,
} from "@mui/icons-material";
import {
  getAllWarehouses,
  createWarehouse,
  getWarehouseInventory,
  inventoryIn,
  inventoryOut,
  createReliefDistribution,
} from "../../services/warehouseService";
import { getActiveItems } from "../../services/adminCatalogService";

// ==================== CONFIG ====================

const ITEM_TYPE_CONFIG = {
  FOOD: {
    label: "Thực phẩm",
    smallIcon: null,
    bigIcon: null,
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    textColor: "text-orange-600",
    badgeStyle: "bg-orange-50 text-orange-700 border-orange-200",
    statsBorder: "border-orange-200 hover:border-orange-300",
  },
  DRINK: {
    label: "Nước uống",
    smallIcon: null,
    bigIcon: null,
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    textColor: "text-cyan-600",
    badgeStyle: "bg-cyan-50 text-cyan-700 border-cyan-200",
    statsBorder: "border-cyan-200 hover:border-cyan-300",
  },
  MEDICAL_SUPPLIES: {
    label: "Vật tư y tế",
    smallIcon: null,
    bigIcon: null,
    iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
    textColor: "text-red-600",
    badgeStyle: "bg-red-50 text-red-700 border-red-200",
    statsBorder: "border-red-200 hover:border-red-300",
  },
};

const WAREHOUSE_STATUS_CONFIG = {
  ACTIVE: {
    label: "Hoạt động",
    style: "bg-emerald-100 text-emerald-700",
  },
  INACTIVE: {
    label: "Tạm ngưng",
    style: "bg-slate-100 text-slate-600",
  },
  LOCKED: {
    label: "Bị khóa",
    style: "bg-red-100 text-red-700",
  },
};

// ==================== ITEM TYPE ICON COMPONENT ====================

function ItemTypeIcon({ itemType, size = 16 }) {
  if (itemType === "FOOD") return <FoodIcon sx={{ fontSize: size }} />;
  if (itemType === "DRINK") return <WaterIcon sx={{ fontSize: size }} />;
  if (itemType === "MEDICAL_SUPPLIES")
    return <MedicalIcon sx={{ fontSize: size }} />;
  return <BoxIcon sx={{ fontSize: size }} />;
}

// ==================== MODAL COMPONENT ====================

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20 }} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ManagerInventory() {
  // ---------- State ----------
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------- Modal states ----------
  const [showCreateWarehouseModal, setShowCreateWarehouseModal] =
    useState(false);
  const [showInventoryInModal, setShowInventoryInModal] = useState(false);
  const [showInventoryOutModal, setShowInventoryOutModal] = useState(false);
  const [showReliefDistModal, setShowReliefDistModal] = useState(false);

  // ---------- Form states ----------
  const [createWarehouseForm, setCreateWarehouseForm] = useState({
    userId: "",
    resourceId: "",
    supplyId: "",
    status: "ACTIVE",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [inventoryInForm, setInventoryInForm] = useState({
    itemId: "",
    quantity: "",
  });
  const [inventoryOutForm, setInventoryOutForm] = useState({
    itemId: "",
    quantity: "",
  });
  const [reliefDistForm, setReliefDistForm] = useState({
    missionId: "",
    inventoryId: "",
    quantity: "",
    householdIdentifier: "",
    isConfirmed: false,
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchInitialData();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.id) setCreateWarehouseForm((f) => ({ ...f, userId: user.id }));
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) fetchInventory(selectedWarehouseId);
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ==================== DATA FETCHING ====================

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [warehousesRes, catalogRes] = await Promise.all([
        getAllWarehouses(),
        getActiveItems(),
      ]);
      if (warehousesRes.success) {
        setWarehouses(warehousesRes.data);
        if (warehousesRes.data.length > 0) {
          setSelectedWarehouseId(warehousesRes.data[0].id);
        }
      }
      if (catalogRes.success) {
        setCatalogItems(catalogRes.data);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async (warehouseId) => {
    try {
      setInventoryLoading(true);
      const response = await getWarehouseInventory(warehouseId);
      if (response.success) setInventoryData(response.data);
    } catch (err) {
      console.error("Lỗi tải tồn kho:", err);
      setInventoryData(null);
    } finally {
      setInventoryLoading(false);
    }
  };

  // ==================== HELPERS ====================

  const getCatalogItem = useCallback(
    (itemId) => catalogItems.find((c) => c.id === itemId),
    [catalogItems],
  );

  const getItemTypeConfig = useCallback(
    (itemId) => {
      const c = getCatalogItem(itemId);
      return c ? ITEM_TYPE_CONFIG[c.itemType] : null;
    },
    [getCatalogItem],
  );

  const showToast = (type, message) => setToast({ type, message });

  const selectedWarehouse = warehouses.find(
    (w) => w.id === selectedWarehouseId,
  );

  // ==================== STATS ====================

  const inventoryStats = useMemo(() => {
    const grouped = {};
    Object.keys(ITEM_TYPE_CONFIG).forEach((type) => {
      grouped[type] = { totalQuantity: 0, itemCount: 0 };
    });
    if (inventoryData?.items) {
      inventoryData.items.forEach((item) => {
        const c = catalogItems.find((cat) => cat.id === item.itemId);
        if (c && grouped[c.itemType] !== undefined) {
          grouped[c.itemType].totalQuantity += item.quantity;
          grouped[c.itemType].itemCount += 1;
        }
      });
    }
    return Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => ({
      type,
      ...config,
      ...grouped[type],
    }));
  }, [inventoryData, catalogItems]);

  // ==================== FILTERED LIST ====================

  const filteredItems = useMemo(() => {
    if (!inventoryData?.items) return [];
    return inventoryData.items.filter((item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [inventoryData, searchQuery]);

  const lowStockItems = useMemo(() => {
    if (!inventoryData?.items) return [];
    return inventoryData.items.filter((item) => item.quantity < 50);
  }, [inventoryData]);

  // ==================== ACTION HANDLERS ====================

  const handleInventoryIn = async (e) => {
    e.preventDefault();
    if (!selectedWarehouseId) return;
    try {
      setSubmitting(true);
      const response = await inventoryIn(selectedWarehouseId, {
        itemId: Number(inventoryInForm.itemId),
        quantity: Number(inventoryInForm.quantity),
      });
      if (response.success) {
        setInventoryData(response.data);
        setShowInventoryInModal(false);
        setInventoryInForm({ itemId: "", quantity: "" });
        showToast("success", "Nhập kho thành công!");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Lỗi khi nhập kho!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInventoryOut = async (e) => {
    e.preventDefault();
    if (!selectedWarehouseId) return;
    try {
      setSubmitting(true);
      const response = await inventoryOut(selectedWarehouseId, {
        itemId: Number(inventoryOutForm.itemId),
        quantity: Number(inventoryOutForm.quantity),
      });
      if (response.success) {
        setInventoryData(response.data);
        setShowInventoryOutModal(false);
        setInventoryOutForm({ itemId: "", quantity: "" });
        showToast("success", "Xuất kho thành công!");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Lỗi khi xuất kho!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await createWarehouse({
        ...createWarehouseForm,
        userId: Number(createWarehouseForm.userId),
        latitude: parseFloat(createWarehouseForm.latitude),
        longitude: parseFloat(createWarehouseForm.longitude),
      });
      if (response.success) {
        setWarehouses((prev) => [...prev, response.data]);
        setShowCreateWarehouseModal(false);
        setCreateWarehouseForm({
          userId: "",
          resourceId: "",
          supplyId: "",
          status: "ACTIVE",
          latitude: "",
          longitude: "",
          address: "",
        });
        showToast("success", "Tạo kho mới thành công!");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Lỗi khi tạo kho!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReliefDistribution = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await createReliefDistribution({
        missionId: Number(reliefDistForm.missionId),
        inventoryId: Number(reliefDistForm.inventoryId),
        quantity: Number(reliefDistForm.quantity),
        householdIdentifier: reliefDistForm.householdIdentifier,
        isConfirmed: reliefDistForm.isConfirmed,
      });
      if (response.success) {
        fetchInventory(selectedWarehouseId);
        setShowReliefDistModal(false);
        setReliefDistForm({
          missionId: "",
          inventoryId: "",
          quantity: "",
          householdIdentifier: "",
          isConfirmed: false,
        });
        showToast("success", "Ghi nhận phân phối cứu trợ thành công!");
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Lỗi khi phân phối cứu trợ!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircleIcon
                  sx={{ fontSize: 20 }}
                  className="text-emerald-600"
                />
              ) : (
                <WarningIcon sx={{ fontSize: 20 }} className="text-red-600" />
              )}
              {toast.message}
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-1 hover:bg-black/10 rounded-lg"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          )}

          {/* Loading */}
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <WarningIcon sx={{ fontSize: 24 }} className="text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">Lỗi tải dữ liệu</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={fetchInitialData}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* HEADER */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                      Quản Lý Kho Hàng
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                      Theo dõi tồn kho · Nhập/Xuất hàng · Phân phối cứu trợ
                      &bull;{" "}
                      <span className="text-slate-700 font-semibold">
                        {new Date().toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={fetchInitialData}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      <RefreshIcon sx={{ fontSize: 18 }} />
                      Làm mới
                    </button>
                    <button
                      onClick={() => setShowCreateWarehouseModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-violet-50 border border-violet-300 rounded-xl text-violet-700 font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      <WarehouseIcon sx={{ fontSize: 18 }} />
                      Tạo kho mới
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedWarehouseId) {
                          showToast("error", "Vui lòng chọn kho trước!");
                          return;
                        }
                        setShowInventoryOutModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-50 border border-amber-300 rounded-xl text-amber-700 font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      <TrendingDownIcon sx={{ fontSize: 18 }} />
                      Xuất kho
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedWarehouseId) {
                          showToast("error", "Vui lòng chọn kho trước!");
                          return;
                        }
                        setShowInventoryInModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <TrendingUpIcon sx={{ fontSize: 18 }} />
                      Nhập kho
                    </button>
                    <button
                      onClick={() => setShowReliefDistModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
                    >
                      <DistributeIcon sx={{ fontSize: 18 }} />
                      Phân phối cứu trợ
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Warehouses count */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                      <WarehouseIcon sx={{ fontSize: 24 }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tổng số kho
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {warehouses.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(WAREHOUSE_STATUS_CONFIG).map(
                      ([status, cfg]) => {
                        const count = warehouses.filter(
                          (w) => w.status === status,
                        ).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={status}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.style}`}
                          >
                            {count} {cfg.label}
                          </span>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* ItemType stats */}
                {inventoryStats.map((stat) => (
                  <div
                    key={stat.type}
                    className={`bg-white rounded-2xl p-5 border-2 shadow-sm hover:shadow-lg transition-all ${stat.statsBorder}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-3 rounded-xl ${stat.iconBg} text-white shadow-lg shadow-black/10`}
                      >
                        <ItemTypeIcon itemType={stat.type} size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className={`text-3xl font-bold ${stat.textColor}`}>
                          {stat.totalQuantity.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {stat.itemCount}
                      </span>{" "}
                      loại hàng hóa trong kho được chọn
                    </p>
                  </div>
                ))}
              </div>

              {/* WAREHOUSE TABS + INVENTORY TABLE */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                        <BoxIcon sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Tồn kho chi tiết
                        </h2>
                        {selectedWarehouse && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <LocationIcon sx={{ fontSize: 12 }} />
                            {selectedWarehouse.address}
                            <span
                              className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${WAREHOUSE_STATUS_CONFIG[selectedWarehouse.status]?.style}`}
                            >
                              {
                                WAREHOUSE_STATUS_CONFIG[
                                  selectedWarehouse.status
                                ]?.label
                              }
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <SearchIcon
                        sx={{ fontSize: 16 }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Tìm kiếm hàng hóa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Warehouse tabs */}
                  <div className="flex flex-wrap gap-2">
                    {warehouses.map((wh) => (
                      <button
                        key={wh.id}
                        onClick={() => setSelectedWarehouseId(wh.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          selectedWarehouseId === wh.id
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <WarehouseIcon sx={{ fontSize: 14 }} />
                        <span
                          className="max-w-[150px] truncate"
                          title={wh.address}
                        >
                          {wh.resourceId || wh.address || `Kho #${wh.id}`}
                        </span>
                        {wh.status !== "ACTIVE" && (
                          <span
                            className={`px-1 py-0.5 rounded text-[10px] font-bold ${WAREHOUSE_STATUS_CONFIG[wh.status]?.style}`}
                          >
                            {WAREHOUSE_STATUS_CONFIG[wh.status]?.label}
                          </span>
                        )}
                      </button>
                    ))}
                    {warehouses.length === 0 && (
                      <p className="text-sm text-slate-400 italic">
                        Chưa có kho nào. Hãy tạo kho mới.
                      </p>
                    )}
                  </div>
                </div>

                {/* Inventory table */}
                {inventoryLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshIcon
                      sx={{ fontSize: 36 }}
                      className="text-blue-400 animate-spin mr-3"
                    />
                    <span className="text-slate-500 font-medium">
                      Đang tải tồn kho...
                    </span>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <BoxIcon
                      sx={{ fontSize: 48 }}
                      className="mb-3 opacity-40"
                    />
                    <p className="font-semibold">
                      {searchQuery
                        ? "Không tìm thấy hàng hóa phù hợp"
                        : "Kho hiện tại chưa có hàng hóa"}
                    </p>
                    {!searchQuery && selectedWarehouseId && (
                      <button
                        onClick={() => setShowInventoryInModal(true)}
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <AddIcon sx={{ fontSize: 16 }} /> Nhập hàng vào kho
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Hàng hóa
                          </th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Phân loại
                          </th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Đơn vị / Dung tích
                          </th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Tồn kho
                          </th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Cập nhật cuối
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item) => {
                          const typeConfig = getItemTypeConfig(item.itemId);
                          const catalogItem = getCatalogItem(item.itemId);
                          const isLow = item.quantity < 50;
                          const isWarning =
                            item.quantity >= 50 && item.quantity < 100;
                          return (
                            <tr
                              key={item.itemId}
                              className={`hover:bg-slate-50 transition-colors ${isLow ? "bg-red-50/40" : ""}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeConfig ? typeConfig.iconBg : "bg-slate-200"} text-white shadow-sm`}
                                  >
                                    <ItemTypeIcon
                                      itemType={catalogItem?.itemType}
                                      size={16}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {item.itemName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      ID: {item.itemId}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {typeConfig ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeConfig.badgeStyle}`}
                                  >
                                    <ItemTypeIcon
                                      itemType={catalogItem?.itemType}
                                      size={12}
                                    />
                                    {typeConfig.label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Không xác định
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {catalogItem?.capacity || (
                                  <span className="text-slate-400 italic text-xs">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-xl font-bold ${isLow ? "text-red-600" : isWarning ? "text-amber-600" : "text-slate-900"}`}
                                >
                                  {item.quantity.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {isLow ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Tồn kho thấp
                                  </span>
                                ) : isWarning ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                    Sắp hết hàng
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                    Sẵn sàng
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {item.lastUpdate ? (
                                  new Date(item.lastUpdate).toLocaleString(
                                    "vi-VN",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )
                                ) : (
                                  <span className="italic">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredItems.length > 0 && (
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Hiển thị{" "}
                      <strong className="text-slate-700">
                        {filteredItems.length}
                      </strong>{" "}
                      hàng hóa
                    </span>
                    <span>
                      Kho:{" "}
                      <strong className="text-slate-700">
                        {selectedWarehouse?.resourceId ||
                          selectedWarehouse?.address ||
                          `#${selectedWarehouseId}`}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* LOW STOCK ALERT */}
              {lowStockItems.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 via-red-50/50 to-transparent rounded-3xl p-6 border-2 border-red-200 shadow-lg shadow-red-100/50 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-red-100 rounded-2xl text-red-600">
                        <WarningIcon sx={{ fontSize: 28 }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-900">
                          Cảnh báo tồn kho thấp ({lowStockItems.length} mặt
                          hàng)
                        </h3>
                        <p className="text-sm text-red-600">
                          Các hàng hóa dưới 50 đơn vị cần nhập kho gấp
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInventoryInModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                    >
                      Nhập kho khẩn cấp
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockItems.slice(0, 6).map((item) => {
                      const typeConfig = getItemTypeConfig(item.itemId);
                      return (
                        <div
                          key={item.itemId}
                          className="bg-white border-2 border-red-100 hover:border-red-300 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-md group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig ? typeConfig.iconBg : "bg-slate-200"} text-white`}
                            >
                              <ItemTypeIcon
                                itemType={getCatalogItem(item.itemId)?.itemType}
                                size={16}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {item.itemName}
                              </p>
                              <p className="text-xs text-red-600 font-semibold">
                                Còn lại: {item.quantity} đơn vị
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowInventoryInModal(true)}
                            className="text-xs bg-slate-100 group-hover:bg-red-600 group-hover:text-white px-3 py-1.5 rounded-xl font-semibold transition-all"
                          >
                            Nhập ngay
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                <p className="text-xs text-slate-400">
                  2026 ReliefOps System · Warehouse Module v2.0 · Dữ liệu thời
                  gian thực từ API
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: TẠO KHO MỚI */}
      <Modal
        open={showCreateWarehouseModal}
        onClose={() => setShowCreateWarehouseModal(false)}
        title="Tạo kho mới"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>User ID (Manager) *</label>
              <input
                type="number"
                required
                value={createWarehouseForm.userId}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    userId: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Nhập user ID"
              />
            </div>
            <div>
              <label className={labelClass}>Trạng thái *</label>
              <select
                required
                value={createWarehouseForm.status}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="LOCKED">Bị khóa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mã tài nguyên (Resource ID)</label>
              <input
                type="text"
                value={createWarehouseForm.resourceId}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    resourceId: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="VD: RES-001"
              />
            </div>
            <div>
              <label className={labelClass}>Mã nguồn cung (Supply ID)</label>
              <input
                type="text"
                value={createWarehouseForm.supplyId}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    supplyId: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="VD: SUP-001"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Địa chỉ *</label>
            <input
              type="text"
              required
              value={createWarehouseForm.address}
              onChange={(e) =>
                setCreateWarehouseForm((f) => ({
                  ...f,
                  address: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="VD: 123 Đường Lê Lợi, TP.HCM"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="any"
                value={createWarehouseForm.latitude}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    latitude: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="VD: 10.12345678"
              />
            </div>
            <div>
              <label className={labelClass}>Kinh độ (Longitude)</label>
              <input
                type="number"
                step="any"
                value={createWarehouseForm.longitude}
                onChange={(e) =>
                  setCreateWarehouseForm((f) => ({
                    ...f,
                    longitude: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="VD: 106.12345678"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateWarehouseModal(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
            >
              {submitting ? "Đang tạo..." : "Tạo kho"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: NHẬP KHO */}
      <Modal
        open={showInventoryInModal}
        onClose={() => setShowInventoryInModal(false)}
        title="Nhập hàng vào kho"
      >
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
          <WarehouseIcon sx={{ fontSize: 16 }} />
          Kho:{" "}
          <strong>
            {selectedWarehouse?.resourceId ||
              selectedWarehouse?.address ||
              `#${selectedWarehouseId}`}
          </strong>
        </div>
        <form onSubmit={handleInventoryIn} className="space-y-4">
          <div>
            <label className={labelClass}>Hàng hóa *</label>
            <select
              required
              value={inventoryInForm.itemId}
              onChange={(e) =>
                setInventoryInForm((f) => ({ ...f, itemId: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">-- Chọn hàng hóa --</option>
              {catalogItems.map((item) => (
                <option key={item.id} value={item.id}>
                  [{ITEM_TYPE_CONFIG[item.itemType]?.label || item.itemType}]{" "}
                  {item.name}
                  {item.capacity ? ` - ${item.capacity}` : ""}
                </option>
              ))}
            </select>
            {catalogItems.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Chưa có danh mục hàng hóa. Vui lòng liên hệ Admin.
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Số lượng nhập *</label>
            <input
              type="number"
              required
              min="1"
              value={inventoryInForm.quantity}
              onChange={(e) =>
                setInventoryInForm((f) => ({ ...f, quantity: e.target.value }))
              }
              className={inputClass}
              placeholder="Nhập số lượng (> 0)"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInventoryInModal(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              {submitting ? "Đang nhập..." : "Xác nhận nhập kho"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: XUẤT KHO */}
      <Modal
        open={showInventoryOutModal}
        onClose={() => setShowInventoryOutModal(false)}
        title="Xuất hàng khỏi kho"
      >
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-center gap-2">
          <WarehouseIcon sx={{ fontSize: 16 }} />
          Kho:{" "}
          <strong>
            {selectedWarehouse?.resourceId ||
              selectedWarehouse?.address ||
              `#${selectedWarehouseId}`}
          </strong>
        </div>
        <form onSubmit={handleInventoryOut} className="space-y-4">
          <div>
            <label className={labelClass}>Hàng hóa *</label>
            <select
              required
              value={inventoryOutForm.itemId}
              onChange={(e) =>
                setInventoryOutForm((f) => ({ ...f, itemId: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">-- Chọn hàng hóa --</option>
              {inventoryData?.items?.map((item) => {
                const typeConfig = getItemTypeConfig(item.itemId);
                return (
                  <option key={item.itemId} value={item.itemId}>
                    [{typeConfig?.label || "-"}] {item.itemName} - Tồn:{" "}
                    {item.quantity}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className={labelClass}>Số lượng xuất *</label>
            <input
              type="number"
              required
              min="1"
              value={inventoryOutForm.quantity}
              onChange={(e) =>
                setInventoryOutForm((f) => ({ ...f, quantity: e.target.value }))
              }
              className={inputClass}
              placeholder="Nhập số lượng cần xuất (> 0)"
            />
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200">
            Hệ thống sẽ kiểm tra tồn kho. Nếu số lượng yêu cầu vượt quá tồn kho,
            thao tác sẽ bị từ chối.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInventoryOutModal(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              {submitting ? "Đang xuất..." : "Xác nhận xuất kho"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PHÂN PHỐI CỨU TRỢ */}
      <Modal
        open={showReliefDistModal}
        onClose={() => setShowReliefDistModal(false)}
        title="Phân phối hàng cứu trợ"
      >
        <form onSubmit={handleReliefDistribution} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
            Ghi nhận việc phân phối hàng hóa trực tiếp đến hộ dân theo nhiệm vụ
            cứu hộ. Thao tác này sẽ tự động giảm tồn kho tương ứng.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ID Nhiệm vụ (Mission ID) *</label>
              <input
                type="number"
                required
                min="1"
                value={reliefDistForm.missionId}
                onChange={(e) =>
                  setReliefDistForm((f) => ({
                    ...f,
                    missionId: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Nhập mission ID"
              />
            </div>
            <div>
              <label className={labelClass}>ID Tồn kho (Inventory ID) *</label>
              <input
                type="number"
                required
                min="1"
                value={reliefDistForm.inventoryId}
                onChange={(e) =>
                  setReliefDistForm((f) => ({
                    ...f,
                    inventoryId: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Nhập inventory ID"
              />
              {inventoryData?.items && inventoryData.items.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Các item trong kho:{" "}
                  {inventoryData.items
                    .map(
                      (i) => `${i.itemName}(id:${i.inventoryId || i.itemId})`,
                    )
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>Số lượng phân phối *</label>
            <input
              type="number"
              required
              min="0"
              value={reliefDistForm.quantity}
              onChange={(e) =>
                setReliefDistForm((f) => ({ ...f, quantity: e.target.value }))
              }
              className={inputClass}
              placeholder="Số lượng (>= 0)"
            />
          </div>
          <div>
            <label className={labelClass}>CCCD / Mã định danh hộ dân *</label>
            <input
              type="text"
              required
              value={reliefDistForm.householdIdentifier}
              onChange={(e) =>
                setReliefDistForm((f) => ({
                  ...f,
                  householdIdentifier: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="VD: 079201012345"
              maxLength={20}
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="isConfirmed"
              checked={reliefDistForm.isConfirmed}
              onChange={(e) =>
                setReliefDistForm((f) => ({
                  ...f,
                  isConfirmed: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded accent-blue-600"
            />
            <label
              htmlFor="isConfirmed"
              className="text-sm text-slate-700 font-medium cursor-pointer"
            >
              Hộ dân đã xác nhận nhận hàng
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReliefDistModal(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              {submitting ? "Đang ghi nhận..." : "Xác nhận phân phối"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

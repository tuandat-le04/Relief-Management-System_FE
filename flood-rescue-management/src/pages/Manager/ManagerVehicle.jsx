import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/manager/Sidebar";
import vehicleService from "../../services/vehicleService";
import {
  LocalShipping as TruckIcon,
  DirectionsBoat as BoatIcon,
  Flight as DroneIcon,
  LocalAirport as HelicopterIcon,
  PlayCircle as ActiveIcon,
  Build as MaintenanceIcon,
  PauseCircle as ReadyIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ViewList as ListIcon,
  GridView as GridIcon,
  LocationOn,
  ChevronRight,
  Refresh as SyncIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// ── Danh mục loại phương tiện (API enum) ─────────────────────────────────────
const VEHICLE_TYPES = [
  { value: "BOAT", label: "Cano / Xuồng" },
  { value: "TRUCK", label: "Xe tải" },
  { value: "HELICOPTER", label: "Trực thăng" },
  { value: "DRONE", label: "Drone / UAV" },
  { value: "CAR", label: "Xe con" },
  { value: "VAN", label: "Xe van" },
];

const API_STATUSES = ["AVAILABLE", "IN_USE", "MAINTENANCE"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getVehicleIcon = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "BOAT" || t === "CANO" || t === "SPEEDBOAT") return <BoatIcon />;
  if (t === "TRUCK" || t === "VAN" || t === "CAR") return <TruckIcon />;
  if (t === "DRONE" || t === "UAV") return <DroneIcon />;
  if (t === "HELICOPTER" || t === "AIRCRAFT") return <HelicopterIcon />;
  return <TruckIcon />;
};

const getVehicleTypeName = (type) => {
  const found = VEHICLE_TYPES.find(
    (t) => t.value.toUpperCase() === (type || "").toUpperCase(),
  );
  return found ? found.label : type || "Khác";
};

const getStatusInfo = (statusRaw) => {
  switch (statusRaw) {
    case "IN_USE":
      return {
        label: "Đang vận hành",
        style:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100",
        icon: <ActiveIcon sx={{ fontSize: 14 }} />,
      };
    case "MAINTENANCE":
      return {
        label: "Đang bảo trì",
        style:
          "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100",
        icon: <MaintenanceIcon sx={{ fontSize: 14 }} />,
      };
    case "AVAILABLE":
    default:
      return {
        label: "Sẵn sàng",
        style:
          "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100",
        icon: <ReadyIcon sx={{ fontSize: 14 }} />,
      };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Thêm / Sửa phương tiện
// ─────────────────────────────────────────────────────────────────────────────
const VehicleFormModal = ({ isOpen, onClose, onSuccess, editVehicle }) => {
  const isEdit = !!editVehicle;
  const [form, setForm] = useState({
    type: "BOAT",
    model: "",
    licensePlate: "",
    capacityPerson: 1,
    status: "AVAILABLE",
    depotId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEdit) {
        setForm({
          type: editVehicle.typeRaw || "BOAT",
          model: editVehicle.model || "",
          licensePlate: editVehicle.licensePlate || "",
          capacityPerson: editVehicle.capacityPerson || 1,
          status: editVehicle.statusRaw || "AVAILABLE",
          depotId: editVehicle.depotId || "",
        });
      } else {
        setForm({
          type: "BOAT",
          model: "",
          licensePlate: "",
          capacityPerson: 1,
          status: "AVAILABLE",
          depotId: "",
        });
      }
    }
  }, [isOpen, editVehicle]);

  const handleChange = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.type) {
      setError("Vui lòng chọn loại phương tiện");
      return;
    }
    if (!form.licensePlate) {
      setError("Vui lòng nhập biển số xe");
      return;
    }
    if (!form.capacityPerson || Number(form.capacityPerson) < 1) {
      setError("Sức chứa phải ≥ 1 người");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      type: form.type,
      licensePlate: form.licensePlate,
      capacityPerson: Number(form.capacityPerson),
      status: form.status,
      ...(form.model && { model: form.model }),
      ...(form.depotId && { depotId: Number(form.depotId) }),
    };
    const result = isEdit
      ? await vehicleService.updateVehicle(editVehicle.id, payload)
      : await vehicleService.createVehicle(payload);
    setSaving(false);
    if (result.success) {
      onSuccess(
        result.message ||
          (isEdit ? "Cập nhật thành công" : "Thêm phương tiện thành công"),
      );
      onClose();
    } else setError(result.error);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">
              {isEdit ? "edit" : "add_circle"}
            </span>
            {isEdit ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"}
          </h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Loại phương tiện <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Model
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="VD: Zodiac Pro 500"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.licensePlate}
              onChange={(e) => handleChange("licensePlate", e.target.value)}
              placeholder="VD: 79-A1 12345"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Sức chứa (người) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.capacityPerson}
                onChange={(e) => handleChange("capacityPerson", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Trạng thái ban đầu
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                disabled={isEdit && editVehicle?.statusRaw === "IN_USE"}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {API_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "AVAILABLE"
                      ? "Sẵn sàng"
                      : s === "IN_USE"
                        ? "Đang vận hành"
                        : "Bảo trì"}
                  </option>
                ))}
              </select>
              {isEdit && editVehicle?.statusRaw === "IN_USE" && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Xe đang sử dụng — dùng "Đổi trạng thái"
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              ID bãi đậu (tuỳ chọn)
            </label>
            <input
              type="number"
              min="1"
              value={form.depotId}
              onChange={(e) => handleChange("depotId", e.target.value)}
              placeholder="Để trống nếu chưa có"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-base">
                error
              </span>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition-all flex items-center gap-2"
          >
            {saving && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            )}
            {isEdit ? "Lưu thay đổi" : "Thêm phương tiện"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Đổi trạng thái
// ─────────────────────────────────────────────────────────────────────────────
const ChangeStatusModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const [newStatus, setNewStatus] = useState("AVAILABLE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && vehicle) {
      setNewStatus(vehicle.statusRaw || "AVAILABLE");
      setError(null);
    }
  }, [isOpen, vehicle]);

  const handleSave = async () => {
    if (newStatus === vehicle.statusRaw) {
      setError("Trạng thái không thay đổi");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await vehicleService.updateVehicleStatus(
      vehicle.id,
      newStatus,
    );
    setSaving(false);
    if (result.success) {
      onSuccess(result.message || "Cập nhật trạng thái thành công");
      onClose();
    } else setError(result.error);
  };

  if (!isOpen || !vehicle) return null;
  const currentInfo = getStatusInfo(vehicle.statusRaw);
  const nextInfo = getStatusInfo(newStatus);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-base">
            Đổi trạng thái phương tiện
          </h2>
          <button
            onClick={onClose}
            className="text-orange-200 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Phương tiện:{" "}
            <strong className="text-slate-900">{vehicle.code}</strong> (ID #
            {vehicle.id})
          </p>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${currentInfo.style}`}
            >
              {currentInfo.icon}
              {currentInfo.label}
            </span>
            <span className="text-slate-400 text-xl">→</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${nextInfo.style}`}
            >
              {nextInfo.icon}
              {nextInfo.label}
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Trạng thái mới
            </label>
            <select
              value={newStatus}
              onChange={(e) => {
                setNewStatus(e.target.value);
                setError(null);
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="AVAILABLE">✅ Sẵn sàng (AVAILABLE)</option>
              <option value="IN_USE">🔵 Đang vận hành (IN_USE)</option>
              <option value="MAINTENANCE">🔧 Bảo trì (MAINTENANCE)</option>
            </select>
          </div>
          {vehicle.statusRaw === "IN_USE" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              ⚠ Xe đang trong nhiệm vụ. Chỉ đổi trạng thái khi có lý do chính
              đáng.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-sm">
                error
              </span>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold transition-all flex items-center gap-2"
          >
            {saving && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            )}
            Lưu trạng thái
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Xác nhận xóa
// ─────────────────────────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await vehicleService.deleteVehicle(vehicle.id);
    setDeleting(false);
    if (result.success) {
      onSuccess("Xóa phương tiện thành công");
      onClose();
    } else setError(result.error);
  };

  if (!isOpen || !vehicle) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-base">
            Xác nhận xóa phương tiện
          </h2>
          <button onClick={onClose} className="text-red-200 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-700">
            Bạn có chắc muốn xóa phương tiện{" "}
            <strong className="text-slate-900">{vehicle.code}</strong>?
            <br />
            <span className="text-xs text-slate-500 mt-1 block">
              Hành động này không thể hoàn tác.
            </span>
          </p>
          {vehicle.statusRaw === "IN_USE" && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
              ❌ Không thể xóa phương tiện đang vận hành (IN_USE).
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || vehicle.statusRaw === "IN_USE"}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center gap-2"
          >
            {deleting && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            )}
            Xóa phương tiện
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ManagerVehicle — Component chính
// ─────────────────────────────────────────────────────────────────────────────
export default function ManagerVehicle() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // Dữ liệu từ API
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusVehicle, setStatusVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteVehicle, setDeleteVehicle] = useState(null);

  // ── Fetch dữ liệu ─────────────────────────────────────────────────────────
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await vehicleService.getAllVehicles();
    setLoading(false);
    if (result.success) setVehicles(result.data);
    else setError(result.error || "Không thể tải dữ liệu phương tiện");
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };
  const handleActionSuccess = (msg) => {
    showToast("success", msg);
    fetchVehicles();
  };

  // ── Mở modal ─────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditVehicle(null);
    setFormOpen(true);
  };
  const openEditModal = (v) => {
    setEditVehicle(v);
    setFormOpen(true);
  };
  const openStatusModal = (v) => {
    setStatusVehicle(v);
    setStatusModalOpen(true);
  };
  const openDeleteModal = (v) => {
    setDeleteVehicle(v);
    setDeleteModalOpen(true);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      v.code.toLowerCase().includes(q) ||
      (v.model || "").toLowerCase().includes(q) ||
      (v.licensePlate || "").toLowerCase().includes(q) ||
      (v.team || "").toLowerCase().includes(q);
    const matchType =
      !selectedType || (v.typeRaw || "").toUpperCase() === selectedType;
    const matchStatus = !selectedStatus || v.statusRaw === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.statusRaw === "AVAILABLE").length,
    inUse: vehicles.filter((v) => v.statusRaw === "IN_USE").length,
    maintenance: vehicles.filter((v) => v.statusRaw === "MAINTENANCE").length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Toast notification */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Manager</span>
                  <ChevronRight
                    sx={{ fontSize: 16 }}
                    className="text-slate-400"
                  />
                  <span className="text-slate-900 font-semibold">
                    Quản lý phương tiện
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                  Quản Lý Phương Tiện Cứu Hộ
                </h1>
                <p className="text-slate-600 text-base">
                  Theo dõi trạng thái và điều phối đội xe, tàu, thiết bị bay •
                  <span className="text-slate-900 font-semibold ml-1">
                    Kết nối API thời gian thực
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchVehicles}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm font-semibold text-slate-700 hover:shadow-md disabled:opacity-50"
                >
                  <SyncIcon
                    sx={{ fontSize: 20 }}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span>Làm mới</span>
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all font-semibold group"
                >
                  <AddIcon
                    sx={{ fontSize: 20 }}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                  <span>Thêm phương tiện</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Tổng phương tiện",
                value: stats.total,
                icon: <TruckIcon sx={{ fontSize: 28 }} />,
                grad: "from-blue-500 to-indigo-600",
                shad: "shadow-blue-500/20",
                sub: "Đã đăng ký trong hệ thống",
              },
              {
                label: "Sẵn sàng",
                value: stats.available,
                icon: <ReadyIcon sx={{ fontSize: 28 }} />,
                grad: "from-sky-500 to-blue-600",
                shad: "shadow-sky-500/20",
                sub: "Có thể điều phối ngay",
              },
              {
                label: "Đang vận hành (IN_USE)",
                value: stats.inUse,
                icon: <ActiveIcon sx={{ fontSize: 28 }} />,
                grad: "from-emerald-500 to-teal-600",
                shad: "shadow-emerald-500/20",
                sub: "Đang thực hiện nhiệm vụ",
              },
              {
                label: "Đang bảo trì",
                value: stats.maintenance,
                icon: <MaintenanceIcon sx={{ fontSize: 28 }} />,
                grad: "from-amber-500 to-orange-600",
                shad: "shadow-amber-500/20",
                sub: "Cần hoàn thành sửa chữa",
              },
            ].map(({ label, value, icon, grad, shad, sub }) => (
              <div
                key={label}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-500 overflow-hidden"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3.5 rounded-2xl bg-gradient-to-br ${grad} shadow-lg ${shad} text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                    >
                      {icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                      {value}
                    </h3>
                    <p className="text-sm font-semibold text-slate-900">
                      {label}
                    </p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Error State ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">
                error
              </span>
              <div className="flex-1">
                <p className="font-semibold text-red-700">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Kiểm tra kết nối mạng hoặc đăng nhập lại.
                </p>
              </div>
              <button
                onClick={fetchVehicles}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* ── Filters ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative group w-full lg:w-80">
                  <SearchIcon
                    sx={{ fontSize: 20 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo biển số, model, đội..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 font-medium"
                >
                  <option value="">Tất cả loại xe</option>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 font-medium"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="AVAILABLE">✅ Sẵn sàng</option>
                  <option value="IN_USE">🔵 Đang vận hành</option>
                  <option value="MAINTENANCE">🔧 Đang bảo trì</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
                  title="Danh sách"
                >
                  <ListIcon sx={{ fontSize: 20 }} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
                  title="Lưới"
                >
                  <GridIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200/60 flex items-center justify-center gap-3">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
              <p className="text-slate-500 font-medium">
                Đang tải dữ liệu phương tiện từ máy chủ...
              </p>
            </div>
          )}

          {/* ── Vehicle List ── */}
          {!loading && !error && viewMode === "list" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Biển số / Mã
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Sức chứa
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <span className="material-symbols-outlined text-slate-300 text-5xl block mb-2">
                            directions_car
                          </span>
                          <p className="text-slate-400 font-medium">
                            {vehicles.length === 0
                              ? "Chưa có phương tiện nào. Hãy thêm mới!"
                              : "Không có phương tiện phù hợp với bộ lọc."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle) => {
                        const si = getStatusInfo(vehicle.statusRaw);
                        return (
                          <tr
                            key={vehicle.id}
                            className="group hover:bg-blue-50/30 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {vehicle.code}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    ID #{vehicle.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                  {getVehicleIcon(vehicle.typeRaw)}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                  {getVehicleTypeName(vehicle.typeRaw)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                              {vehicle.model || (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-slate-700">
                                <span className="material-symbols-outlined text-slate-400 text-base">
                                  group
                                </span>
                                {vehicle.capacityPerson} người
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${si.style}`}
                              >
                                {si.icon} {si.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openStatusModal(vehicle)}
                                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white transition-all"
                                  title="Đổi trạng thái"
                                >
                                  Đổi trạng thái
                                </button>
                                <button
                                  onClick={() => openEditModal(vehicle)}
                                  disabled={vehicle.statusRaw === "IN_USE"}
                                  className="p-2 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Chỉnh sửa"
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(vehicle)}
                                  disabled={vehicle.statusRaw === "IN_USE"}
                                  className="p-2 rounded-xl text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Xóa"
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex justify-between items-center">
                <p className="text-xs text-slate-600 font-medium">
                  Hiển thị{" "}
                  <span className="text-slate-900 font-bold">
                    {filteredVehicles.length}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="text-slate-900 font-bold">
                    {vehicles.length}
                  </span>{" "}
                  phương tiện
                </p>
              </div>
            </div>
          )}

          {/* ── Vehicle Grid ── */}
          {!loading && !error && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-slate-300 text-5xl block mb-2">
                    directions_car
                  </span>
                  {vehicles.length === 0
                    ? "Chưa có phương tiện nào. Hãy thêm mới!"
                    : "Không có phương tiện phù hợp."}
                </div>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const si = getStatusInfo(vehicle.statusRaw);
                  return (
                    <div
                      key={vehicle.id}
                      className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-blue-300/60 transition-all duration-500"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          {getVehicleIcon(vehicle.typeRaw)}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${si.style}`}
                        >
                          {si.icon}
                          {si.label}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="text-base font-bold text-slate-900">
                          {vehicle.code}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {getVehicleTypeName(vehicle.typeRaw)}
                          {vehicle.model ? ` — ${vehicle.model}` : ""}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-slate-400 text-sm">
                            group
                          </span>
                          Sức chứa: {vehicle.capacityPerson} người
                        </div>
                        {vehicle.location &&
                          vehicle.location !== "Chưa cập nhật" && (
                            <div className="flex items-start gap-1">
                              <LocationOn
                                sx={{ fontSize: 14 }}
                                className="text-slate-400 mt-0.5"
                              />
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {vehicle.location}
                              </p>
                            </div>
                          )}
                        <p className="text-xs text-slate-400 pt-1">
                          ID #{vehicle.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => openStatusModal(vehicle)}
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white transition-all"
                        >
                          Đổi trạng thái
                        </button>
                        <button
                          onClick={() => openEditModal(vehicle)}
                          disabled={vehicle.statusRaw === "IN_USE"}
                          className="p-2 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Chỉnh sửa"
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(vehicle)}
                          disabled={vehicle.statusRaw === "IN_USE"}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              © 2026 ReliefOps System · Dữ liệu phương tiện kết nối trực tiếp từ
              API
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <VehicleFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        editVehicle={editVehicle}
        onSuccess={handleActionSuccess}
      />
      <ChangeStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        vehicle={statusVehicle}
        onSuccess={handleActionSuccess}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        vehicle={deleteVehicle}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}

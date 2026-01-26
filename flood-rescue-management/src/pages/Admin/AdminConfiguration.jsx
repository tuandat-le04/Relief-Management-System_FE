import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import {
  MdDirectionsBoat,
  MdAirportShuttle,
  MdFlight,
  MdMedication,
  MdWaterDrop,
  MdRiceBowl,
  MdTune,
  MdWarning,
  MdInventory2,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdHelp,
  MdExpandMore,
  MdWater,
  MdClose,
  MdRefresh,
} from "react-icons/md";

const AdminConfiguration = () => {
  // Icon mapping helper
  const getIcon = (iconName, className = "text-xl") => {
    const iconMap = {
      sailing: <MdDirectionsBoat className={className} />,
      airport_shuttle: <MdAirportShuttle className={className} />,
      flight: <MdFlight className={className} />,
      medication: <MdMedication className={className} />,
      water_drop: <MdWaterDrop className={className} />,
      rice_bowl: <MdRiceBowl className={className} />,
      tune: <MdTune className={className} />,
      warning: <MdWarning className={className} />,
      directions_boat: <MdDirectionsBoat className={className} />,
      inventory_2: <MdInventory2 className={className} />,
    };
    return iconMap[iconName] || null;
  };

  const [activeTab, setActiveTab] = useState("params");
  const [sosRadius, setSosRadius] = useState(15);
  const [waterLevel, setWaterLevel] = useState(120);
  const [autoDrone, setAutoDrone] = useState(true);
  const [bandwidthSave, setBandwidthSave] = useState(false);
  const [gpsFrequency, setGpsFrequency] = useState("standard");

  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "Cano cứu hộ",
      description: "Tốc độ cao",
      icon: "sailing",
      status: "active",
    },
    {
      id: 2,
      name: "Xe lội nước",
      description: "Địa hình ngập",
      icon: "airport_shuttle",
      status: "active",
    },
    {
      id: 3,
      name: "Drone Trinh sát",
      description: "Tầm xa 5km",
      icon: "flight",
      status: "active",
    },
  ]);

  const [supplies, setSupplies] = useState([
    {
      id: 1,
      name: "Thuốc men",
      description: "Sơ cấp cứu",
      icon: "medication",
      priority: "High",
      unit: "Hộp",
    },
    {
      id: 2,
      name: "Nước sạch",
      description: "Chai 500ml",
      icon: "water_drop",
      priority: "High",
      unit: "Chai",
    },
    {
      id: 3,
      name: "Lương thực khô",
      description: "Gạo, Mì tôm",
      icon: "rice_bowl",
      priority: "Med",
      unit: "Kg",
    },
  ]);

  const [disasterZones, setDisasterZones] = useState([
    { id: 1, name: "Thái Nguyên", active: true },
    { id: 2, name: "Lào Cai", active: true },
    { id: 3, name: "Yên Bái", active: false, note: "Đã qua đỉnh lũ" },
  ]);

  const tabs = [
    { id: "vehicles", label: "Danh mục phương tiện", icon: "directions_boat" },
    { id: "supplies", label: "Danh mục nhu yếu phẩm", icon: "inventory_2" },
    { id: "zones", label: "Vùng thiên tai", icon: "warning" },
  ];

  const handleDeleteVehicle = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phương tiện này?")) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const handleDeleteSupply = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhu yếu phẩm này?")) {
      setSupplies(supplies.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>
        {/* Top Bar with Breadcrumbs */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white z-0">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Home
              </a>
              <span className="text-gray-300">/</span>
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Admin
              </a>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-semibold">
                Cấu hình hệ thống
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                <MdHelp className="text-xl" />
              </button>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <p className="text-gray-500 text-xs font-mono">V1.2.4-RC</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="px-8 py-6">
            {/* Page Heading */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cấu Hình Danh Mục & Tham Số
              </h1>
              <p className="text-gray-600">
                Quản lý trung tâm cho các loại phương tiện, nhu yếu phẩm cứu
                trợ, tham số vận hành và các vùng cảnh báo thiên tai.
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {getIcon(tab.icon, "text-lg")}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "vehicles" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Danh sách phương tiện
                  </h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowVehicleModal(true);
                    }}
                    className="px-4 py-2 bg-[#3c8cdd] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MdAdd className="text-lg" />
                    Thêm phương tiện
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Icon
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Tên phương tiện
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Mô tả
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vehicles.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                              {getIcon(
                                vehicle.icon,
                                "text-emerald-500 text-xl",
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-semibold">
                              {vehicle.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 text-sm">
                              {vehicle.description}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {vehicle.status === "active"
                                ? "Hoạt động"
                                : "Ngừng"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(vehicle);
                                  setShowVehicleModal(true);
                                }}
                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <MdEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <MdDelete className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "supplies" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Danh sách nhu yếu phẩm
                  </h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowSupplyModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MdAdd className="text-lg" />
                    Thêm nhu yếu phẩm
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Icon
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Tên vật phẩm
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Mô tả
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Đơn vị
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Ưu tiên
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {supplies.map((supply) => (
                        <tr
                          key={supply.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                              {getIcon(supply.icon, "text-emerald-500 text-xl")}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-semibold">
                              {supply.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 text-sm">
                              {supply.description}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 text-sm">
                              {supply.unit}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                supply.priority === "High"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}
                            >
                              {supply.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(supply);
                                  setShowSupplyModal(true);
                                }}
                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <MdEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDeleteSupply(supply.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <MdDelete className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "zones" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Vùng thiên tai
                  </h2>
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <MdAdd className="text-lg" />
                    Thêm vùng mới
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    {disasterZones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                          zone.active
                            ? "bg-red-500/10 border border-red-500/30 text-red-700"
                            : "bg-gray-100 border border-gray-200 text-gray-600"
                        }`}
                      >
                        {zone.active && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                        <span className="font-medium">{zone.name}</span>
                        {zone.note && (
                          <span className="text-xs">({zone.note})</span>
                        )}
                        <button className="ml-2 hover:text-red-600">
                          {zone.active ? (
                            <MdClose className="text-base" />
                          ) : (
                            <MdRefresh className="text-base" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguration;

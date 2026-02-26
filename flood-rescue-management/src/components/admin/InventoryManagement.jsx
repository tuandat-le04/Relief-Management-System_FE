import React, { useState } from "react";
import {
  MdMedication,
  MdWaterDrop,
  MdRiceBowl,
  MdAdd,
  MdEdit,
  MdDelete,
} from "react-icons/md";

const InventoryManagement = () => {
  // Icon mapping helper
  const getIcon = (iconName, className = "text-xl") => {
    const iconMap = {
      medication: <MdMedication className={className} />,
      water_drop: <MdWaterDrop className={className} />,
      rice_bowl: <MdRiceBowl className={className} />,
    };
    return iconMap[iconName] || <MdMedication className={className} />;
  };

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

  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDeleteSupply = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhu yếu phẩm này?")) {
      setSupplies(supplies.filter((s) => s.id !== id));
    }
  };

  return (
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
                  <p className="text-gray-900 font-semibold">{supply.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 text-sm">{supply.description}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 text-sm">{supply.unit}</p>
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
  );
};

export default InventoryManagement;

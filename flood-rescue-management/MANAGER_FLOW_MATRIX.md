# Manager Flow Matrix

File này là bản rút gọn để review nhanh role **Manager** theo format:

- Flow
- UI Trigger
- File / Function
- API Call
- Payload
- UI Effect
- Code Ref

---

## 1. Route Manager

| Flow | File / Function | UI Effect | Code Ref |
|---|---|---|---|
| Điều hướng `/manager/teams` | `ManagerRoutes.jsx` | Mở page quản lý đội | `src/routes/ManagerRoutes.jsx:23-31` |
| Điều hướng `/manager/dashboard` | `ManagerRoutes.jsx` | Hiện đang alias sang `ManagerTeamManagement` | `src/routes/ManagerRoutes.jsx:32-44` |
| Điều hướng `/manager/vehicles` | `ManagerRoutes.jsx` | Mở page quản lý phương tiện | `src/routes/ManagerRoutes.jsx:45-57` |
| Điều hướng `/manager/inventory` | `ManagerRoutes.jsx` | Mở page quản lý kho | `src/routes/ManagerRoutes.jsx:58-69` |
| Điều hướng `/manager/reports` | `ManagerRoutes.jsx` | Mở page báo cáo | `src/routes/ManagerRoutes.jsx:70-82` |

---

## 2. Manager Dashboard overview

| Mục | Nội dung |
|---|---|
| Flow | Load dashboard tổng hợp của manager |
| UI Trigger | Mở page `ManagerDashboard` |
| File / Function | `ManagerDashboard.jsx` → `loadDashboardData` |
| API Call | `GET /reports/summary`, `GET /vehicles`, `GET /rescue-teams`, `GET /rescue-teams/available`, `GET /warehouses`, unread notifications, inventory từng kho |
| Payload | Không có body |
| UI Effect | Build stats, alert, vehicles list, inventory snapshot |
| Code Ref | `src/pages/Manager/ManagerDashboard.jsx:131-389` |

---

## 3. Quản lý đội cứu hộ

| Mục | Nội dung |
|---|---|
| Flow | Xem danh sách đội, trạng thái đội, unread notifications |
| UI Trigger | Mở `/manager/teams` hoặc refresh |
| File / Function | `ManagerTeamManagement.jsx` → `loadTeamData` |
| API Call | `GET /rescue-teams`, `GET /rescue-teams/available`, `GET /notifications/unread` |
| Payload | Không có body |
| UI Effect | Render table đội, cards thống kê, alert, badge số thông báo |
| Code Ref | `src/pages/Manager/ManagerTeamManagement.jsx:92-182`, `243-470` |

### Search / filter
| Flow | File / Function | UI Effect | Code Ref |
|---|---|---|---|
| Search team | `filteredTeams` | Lọc theo tên đội, đội trưởng, mã kho, vùng | `src/pages/Manager/ManagerTeamManagement.jsx:188-207` |
| Filter status | `statusFilter` | Lọc ACTIVE / BUSY / INACTIVE | `src/pages/Manager/ManagerTeamManagement.jsx:75-76`, `193-203`, `335-344` |

---

## 4. Quản lý phương tiện

| Mục | Nội dung |
|---|---|
| Flow | Load toàn bộ phương tiện |
| UI Trigger | Vào page / refresh |
| File / Function | `vehicleService.getAllVehicles` + logic page `ManagerVehicle.jsx` |
| API Call | `GET /vehicles` |
| Payload | Không có body |
| UI Effect | Hiển thị danh sách vehicle, trạng thái, filter/view | `src/services/vehicleService.js:90-117` |
| Code Ref | `src/pages/Manager/ManagerVehicle.jsx:1-1178` |

### Thêm / sửa vehicle
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Thêm vehicle | Bấm mở modal rồi submit | `VehicleFormModal` | `POST /vehicles` | `{ vehicleTypeId, type, licensePlate, capacityPerson, status, model?, depotId? }` | Đóng modal, reload list | `src/pages/Manager/ManagerVehicle.jsx:112-226`; `src/services/vehicleService.js:138-190` |
| Sửa vehicle | Mở modal edit rồi submit | `VehicleFormModal` | `PUT /vehicles/{id}` | cùng payload create | Đóng modal, reload list | `src/pages/Manager/ManagerVehicle.jsx:112-226`; `src/services/vehicleService.js:192-244` |

### Xóa vehicle
| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Xóa vehicle | Bấm delete | `vehicleService.deleteVehicle` | `DELETE /vehicles/{id}` | Reload list | `src/services/vehicleService.js:246-272` |

### Đổi trạng thái vehicle
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Đổi trạng thái | Mở ChangeStatusModal rồi save | `ChangeStatusModal` | `PUT /vehicles/{id}/status` | `{ status }` | Reload list / badge đổi trạng thái | `src/pages/Manager/ManagerVehicle.jsx:356-420`; `src/services/vehicleService.js:274-302` |

---

## 5. Quản lý kho hàng / tồn kho

| Mục | Nội dung |
|---|---|
| Flow | Load warehouse + active catalog items |
| UI Trigger | Vào page inventory |
| File / Function | `ManagerInventory.jsx` → `fetchInitialData` |
| API Call | `GET /warehouses`, `GET /admin/catalog/items/active` |
| Payload | Không có |
| UI Effect | Set warehouse list, chọn warehouse mặc định, chuẩn bị form data | `src/pages/Manager/ManagerInventory.jsx:186-209` |
| Code Ref | `src/pages/Manager/ManagerInventory.jsx:186-209` |

### Xem inventory của kho
| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Load inventory theo warehouse | Đổi warehouse hoặc vào page | `fetchInventory` | `GET /warehouses/{id}/inventory` | Hiển thị inventoryData | `src/pages/Manager/ManagerInventory.jsx:211-222` |

### Nhập kho
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Inventory in | Submit modal nhập kho | `handleInventoryIn` | `POST /warehouses/{id}/inventory/in` | `{ itemId, quantity }` | Update inventoryData, toast success | `src/pages/Manager/ManagerInventory.jsx:284-304`; `src/services/warehouseService.js:64-78` |

### Xuất kho
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Inventory out | Submit modal xuất kho | `handleInventoryOut` | `POST /warehouses/{id}/inventory/out` | `{ itemId, quantity }` | Update inventoryData, toast success | `src/pages/Manager/ManagerInventory.jsx:306-326`; `src/services/warehouseService.js:80-94` |

### Tạo warehouse
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Tạo kho mới | Submit modal create warehouse | `handleCreateWarehouse` | `POST /warehouses` | `{ userId, resourceId, supplyId, status, latitude, longitude, address }` | Thêm warehouse vào list, toast success | `src/pages/Manager/ManagerInventory.jsx:328-357`; `src/services/warehouseService.js:19-32` |

### Ghi nhận phân phối cứu trợ
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Relief distribution | Submit modal phân phối | `handleReliefDistribution` | `POST /relief-distributions` | `{ missionId, inventoryId, quantity, householdIdentifier, isConfirmed }` | Refresh inventory, toast success | `src/pages/Manager/ManagerInventory.jsx:359-390`; `src/services/warehouseService.js:127-140` |

---

## 6. Báo cáo Manager

| Mục | Nội dung |
|---|---|
| Flow | Tổng hợp báo cáo vận hành |
| UI Trigger | Vào page reports / đổi timeframe |
| File / Function | `ManagerReports.jsx` → `loadReports` |
| API Call | `GET /reports/summary`, `GET /vehicles`, `GET /rescue-teams`, `GET /rescue-teams/available`, `GET /warehouses`, `GET /feedbacks`, inventory từng kho |
| Payload | Không có body |
| UI Effect | KPI cards, composition data, progress bars, support cards |
| Code Ref | `src/pages/Manager/ManagerReports.jsx:62-128`, `134-400` |

---

## 7. Service map nhanh cho Manager

| Service | Function | API | Code Ref |
|---|---|---|---|
| `reportService` | `getDashboardSummary` | `GET /reports/summary` | `src/services/reportService.js:75-114` |
| `vehicleService` | `getAllVehicles` | `GET /vehicles` | `src/services/vehicleService.js:90-117` |
| `vehicleService` | `createVehicle` | `POST /vehicles` | `src/services/vehicleService.js:138-190` |
| `vehicleService` | `updateVehicle` | `PUT /vehicles/{id}` | `src/services/vehicleService.js:192-244` |
| `vehicleService` | `deleteVehicle` | `DELETE /vehicles/{id}` | `src/services/vehicleService.js:246-272` |
| `vehicleService` | `updateVehicleStatus` | `PUT /vehicles/{id}/status` | `src/services/vehicleService.js:274-302` |
| `warehouseService` | `getAllWarehouses` | `GET /warehouses` | `src/services/warehouseService.js:9-17` |
| `warehouseService` | `getWarehouseInventory` | `GET /warehouses/{id}/inventory` | `src/services/warehouseService.js:49-62` |
| `warehouseService` | `inventoryIn` | `POST /warehouses/{id}/inventory/in` | `src/services/warehouseService.js:64-78` |
| `warehouseService` | `inventoryOut` | `POST /warehouses/{id}/inventory/out` | `src/services/warehouseService.js:80-94` |
| `warehouseService` | `createWarehouse` | `POST /warehouses` | `src/services/warehouseService.js:19-32` |
| `warehouseService` | `createReliefDistribution` | `POST /relief-distributions` | `src/services/warehouseService.js:127-140` |
| `adminCatalogService` | `getActiveVehicleTypes` | `GET /admin/catalog/vehicle-types/active` | `src/services/adminCatalogService.js:74-86` |
| `adminCatalogService` | `getActiveItems` | `GET /admin/catalog/items/active` | `src/services/adminCatalogService.js:165-177` |

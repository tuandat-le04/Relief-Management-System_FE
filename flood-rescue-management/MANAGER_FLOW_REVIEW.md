# Manager FE Flow Review

Tài liệu này mô tả luồng FE của role **Manager** để bạn review code nhanh hơn.

---

## 1. File chính liên quan

### Routes
- `src/routes/ManagerRoutes.jsx`
  - Route manager chính:
    - `/manager/teams`
    - `/manager/dashboard` (alias về `ManagerTeamManagement`)
    - `/manager/vehicles`
    - `/manager/inventory`
    - `/manager/reports`
  - Code ref: `src/routes/ManagerRoutes.jsx:1-93`

### Sidebar / layout
- `src/components/manager/Sidebar.jsx`
  - Menu điều hướng giữa các màn manager
  - Code ref: `src/components/manager/Sidebar.jsx:1-247`

### Pages chính
- `src/pages/Manager/ManagerDashboard.jsx`
  - Dashboard KPI, cảnh báo, overview xe/đội/kho
  - Code ref: `src/pages/Manager/ManagerDashboard.jsx:1-978`
- `src/pages/Manager/ManagerTeamManagement.jsx`
  - Quản lý danh sách đội cứu hộ
  - Code ref: `src/pages/Manager/ManagerTeamManagement.jsx:1-470`
- `src/pages/Manager/ManagerVehicle.jsx`
  - Quản lý phương tiện vận hành
  - Code ref: `src/pages/Manager/ManagerVehicle.jsx:1-1178`
- `src/pages/Manager/ManagerInventory.jsx`
  - Quản lý kho, nhập/xuất kho, phân phối cứu trợ
  - Code ref: `src/pages/Manager/ManagerInventory.jsx:1-1359`
- `src/pages/Manager/ManagerReports.jsx`
  - Màn báo cáo tổng hợp
  - Code ref: `src/pages/Manager/ManagerReports.jsx:1-801`

### Components phụ
- `src/components/manager/Notification.jsx`
  - popup/modal thông báo cho manager

### Services chính
- `src/services/rescueTeamService.js`
- `src/services/notificationService.js`
- `src/services/vehicleService.js`
- `src/services/warehouseService.js`
- `src/services/reportService.js`
- `src/services/feedbackService.js`
- `src/services/adminCatalogService.js`

---

## 2. Mục tiêu nghiệp vụ của Manager

Role Manager hiện tại tập trung vào 4 nhóm nghiệp vụ chính:

1. Theo dõi dashboard vận hành
2. Quản lý đội cứu hộ
3. Quản lý phương tiện
4. Quản lý kho hàng / tồn kho / phân phối cứu trợ
5. Xem báo cáo tổng hợp

---

## 3. Route và quyền truy cập

## File: `src/routes/ManagerRoutes.jsx`

### Điều đáng chú ý
- Route đang dùng `React.lazy + Suspense`
- `ManagerDashboard.jsx` hiện **không được expose** trực tiếp trong route
- `/manager/dashboard` đang alias sang `ManagerTeamManagement`

### Code ref
- khai báo route: `src/routes/ManagerRoutes.jsx:23-91`

### Nhận xét review
- Nếu bạn kỳ vọng `/manager/dashboard` là dashboard overview thật, hiện tại code chưa làm vậy.

---

## 4. Sidebar Manager

## File: `src/components/manager/Sidebar.jsx`

### Menu hiện có
- Quản lý đội nhóm → `/manager/teams`
- Quản lý phương tiện → `/manager/vehicles`
- Quản lý kho hàng → `/manager/inventory`
- Báo cáo thống kê → `/manager/reports`

### Logout
- Xóa `token`, `user` trong localStorage rồi navigate `/login`

### Code ref
- menu nav: `src/components/manager/Sidebar.jsx:35-131`
- user menu + logout: `src/components/manager/Sidebar.jsx:135-239`

---

## 5. ManagerDashboard.jsx

## File: `src/pages/Manager/ManagerDashboard.jsx`

### Vai trò
- Dashboard overview của manager
- Tải dữ liệu tổng hợp từ nhiều nguồn rồi build ra:
  - stats cards
  - alerts
  - vehicles snapshot
  - inventory snapshot

### Quyền truy cập
- dùng `usePermission()`
- check:
  - `Role.MANAGER` hoặc `Role.ADMIN`
  - permissions:
    - `MANAGE_VEHICLES`
    - `MANAGE_INVENTORY`
    - `VIEW_RESOURCE_REPORTS`

### Code ref
- permission guard: `src/pages/Manager/ManagerDashboard.jsx:65-121`

### API chính
Trong `loadDashboardData()` gọi song song:

```js
Promise.all([
  reportService.getDashboardSummary(),
  vehicleService.getAllVehicles(),
  rescueTeamService.getAllTeams(),
  rescueTeamService.getAvailableTeams(),
  getAllWarehouses(),
  notificationService.getUnreadCount(),
])
```

### Code ref
- load dashboard: `src/pages/Manager/ManagerDashboard.jsx:131-389`

### API dùng
- `GET /reports/summary`
- `GET /vehicles`
- `GET /rescue-teams`
- `GET /rescue-teams/available`
- `GET /warehouses`
- `GET /notifications/unread-count` (tùy service implementation)
- sau đó lặp thêm `GET /warehouses/{id}/inventory`

### UI output
- cards tổng quan
- danh sách alert
- quick view vehicle
- quick view inventory low stock

### Nhận xét review
- Page này khá nặng vì combine nhiều API và còn lặp inventory theo từng warehouse.

---

## 6. ManagerTeamManagement.jsx

## File: `src/pages/Manager/ManagerTeamManagement.jsx`

### Vai trò
- Hiển thị danh sách đội cứu hộ
- Search / filter theo trạng thái
- Hiển thị alert nhanh từ dữ liệu team + thông báo chưa đọc

### Permission guard
- chỉ cho `MANAGER`, `ADMIN`
- nếu không auth → `/login`
- nếu sai role → `/unauthorized`

### Code ref
- guard: `src/pages/Manager/ManagerTeamManagement.jsx:68-90`

### Data loading
Trong `loadTeamData()` gọi song song:

```js
Promise.all([
  rescueTeamService.getAllTeams(),
  rescueTeamService.getAvailableTeams(),
  notificationService.getUnreadNotifications(),
])
```

### Code ref
- loadTeamData: `src/pages/Manager/ManagerTeamManagement.jsx:92-182`

### API dùng
- `GET /rescue-teams`
- `GET /rescue-teams/available`
- `GET /notifications/unread`

### UI chính
- cards thống kê:
  - tổng số đội
  - đội sẵn sàng
  - đội đang làm nhiệm vụ
  - đội tạm ngưng
- ô search
- select filter trạng thái
- table danh sách đội

### Search/filter
- search theo tên đội, đội trưởng, mã kho, vùng
- filter theo status: `ALL`, `ACTIVE`, `BUSY`, `INACTIVE`

### Code ref
- filter teams: `src/pages/Manager/ManagerTeamManagement.jsx:188-207`
- stats: `src/pages/Manager/ManagerTeamManagement.jsx:209-216`
- render table: `src/pages/Manager/ManagerTeamManagement.jsx:243-470`

---

## 7. ManagerVehicle.jsx

## File: `src/pages/Manager/ManagerVehicle.jsx`

### Vai trò
- Quản lý danh sách phương tiện thực tế đang vận hành
- Thêm / sửa / xóa phương tiện
- Đổi trạng thái phương tiện

### Data source chính
- `vehicleService`
- `adminCatalogService.getActiveVehicleTypes()`

### API quan trọng
- `GET /vehicles`
- `POST /vehicles`
- `PUT /vehicles/{id}`
- `DELETE /vehicles/{id}`
- `PUT /vehicles/{id}/status`
- `GET /vehicles/status/{status}`
- `GET /admin/catalog/vehicle-types/active`

### Các khối logic chính
- helper map type/status: `src/pages/Manager/ManagerVehicle.jsx:25-107`
- modal thêm/sửa: `src/pages/Manager/ManagerVehicle.jsx:112-351`
- modal đổi trạng thái: `src/pages/Manager/ManagerVehicle.jsx:356-...`
- main page: phần còn lại của file

### Payload tạo/sửa vehicle
Thông qua `vehicleService.createVehicle/updateVehicle`:

```json
{
  "vehicleTypeId": 1,
  "type": "BOAT",
  "licensePlate": "79-A1 12345",
  "capacityPerson": 6,
  "status": "AVAILABLE",
  "model": "...",
  "depotId": 10
}
```

### Nhận xét review
- Manager page này dùng admin catalog như dependency để manager chọn loại phương tiện đã được admin cấu hình.

---

## 8. ManagerInventory.jsx

## File: `src/pages/Manager/ManagerInventory.jsx`

### Vai trò
- Quản lý kho hàng và tồn kho
- Nhập kho
- Xuất kho
- Tạo kho mới
- Ghi nhận phân phối cứu trợ

### Data loading ban đầu
Trong `fetchInitialData()`:

```js
Promise.all([
  getAllWarehouses(),
  getActiveItems(),
])
```

### Code ref
- fetchInitialData: `src/pages/Manager/ManagerInventory.jsx:186-209`
- fetchInventory: `src/pages/Manager/ManagerInventory.jsx:211-222`

### API dùng
- `GET /warehouses`
- `POST /warehouses`
- `GET /warehouses/{id}/inventory`
- `POST /warehouses/{id}/inventory/in`
- `POST /warehouses/{id}/inventory/out`
- `POST /relief-distributions`
- `GET /admin/catalog/items/active`

### Action handlers
- `handleInventoryIn`: `src/pages/Manager/ManagerInventory.jsx:284-304`
- `handleInventoryOut`: `src/pages/Manager/ManagerInventory.jsx:306-326`
- `handleCreateWarehouse`: `src/pages/Manager/ManagerInventory.jsx:328-357`
- `handleReliefDistribution`: `src/pages/Manager/ManagerInventory.jsx:359-390`

### Payload nhập kho / xuất kho
```json
{
  "itemId": 1,
  "quantity": 100
}
```

### Payload tạo warehouse
```json
{
  "userId": 2,
  "resourceId": "...",
  "supplyId": "...",
  "status": "ACTIVE",
  "latitude": 10.7,
  "longitude": 106.6,
  "address": "..."
}
```

### Payload relief distribution
```json
{
  "missionId": 100,
  "inventoryId": 200,
  "quantity": 50,
  "householdIdentifier": "HH-001",
  "isConfirmed": false
}
```

### UI chính
- chọn warehouse
- xem summary inventory
- search vật tư
- low stock items
- các modal thao tác nghiệp vụ

---

## 9. ManagerReports.jsx

## File: `src/pages/Manager/ManagerReports.jsx`

### Vai trò
- Màn báo cáo tổng hợp tài nguyên và hiệu suất
- Ghép dữ liệu từ report summary, vehicle, teams, warehouses, feedback

### API gọi trong `loadReports()`

```js
Promise.all([
  reportService.getDashboardSummary(),
  vehicleService.getAllVehicles(),
  rescueTeamService.getAllTeams(),
  rescueTeamService.getAvailableTeams(),
  getAllWarehouses(),
  feedbackService.getAllFeedbacks(),
])
```

### Sau đó gọi thêm
- `GET /warehouses/{id}/inventory` cho từng warehouse

### Code ref
- loadReports: `src/pages/Manager/ManagerReports.jsx:62-128`

### API dùng
- `GET /reports/summary`
- `GET /vehicles`
- `GET /rescue-teams`
- `GET /rescue-teams/available`
- `GET /warehouses`
- `GET /feedbacks`
- `GET /warehouses/{id}/inventory`

### Output UI
- KPI cards
- biểu đồ tỷ lệ request/mission/vehicle
- support cards về kho, đội, feedback, xe bảo trì

### Nhận xét review
- Đây là page read-only tổng hợp dữ liệu, không có mutation chính.

---

## 10. Service quan trọng cho Manager

### `reportService.js`
- `getDashboardSummary()` → `GET /reports/summary`
- Code ref: `src/services/reportService.js:75-114`

### `vehicleService.js`
- transform dữ liệu vehicle sang UI
- CRUD phương tiện
- update status vehicle
- Code ref: `src/services/vehicleService.js:42-365`

### `warehouseService.js`
- CRUD warehouse
- inventory in/out
- relief distribution
- helper cho coordinator modal cũng nằm chung file
- Code ref: `src/services/warehouseService.js:9-212`

### `adminCatalogService.js`
- manager dùng catalog ACTIVE của admin:
  - `getActiveVehicleTypes()`
  - `getActiveItems()`
- Code ref: `src/services/adminCatalogService.js:78-86`, `169-177`

---

## 11. Điểm cần chú ý khi review Manager

1. `/manager/dashboard` hiện alias về `ManagerTeamManagement`, không phải `ManagerDashboard`
2. `ManagerDashboard` và `ManagerReports` đều khá nặng vì ghép nhiều API và còn lặp inventory theo từng kho
3. `Sidebar` logout trực tiếp bằng localStorage
4. `ManagerVehicle` vẫn có mention `MAINTENANCE` trong UI/status dù comment đầu file nói BE đã loại trạng thái này khỏi vòng đời chuẩn
5. `ManagerInventory` đang là page mutation quan trọng nhất của manager vì tác động trực tiếp kho và distribution

---

## 12. Thứ tự đọc file nên review

1. `src/routes/ManagerRoutes.jsx`
2. `src/components/manager/Sidebar.jsx`
3. `src/pages/Manager/ManagerTeamManagement.jsx`
4. `src/pages/Manager/ManagerVehicle.jsx`
5. `src/pages/Manager/ManagerInventory.jsx`
6. `src/pages/Manager/ManagerReports.jsx`
7. `src/pages/Manager/ManagerDashboard.jsx`
8. `src/services/vehicleService.js`
9. `src/services/warehouseService.js`
10. `src/services/reportService.js`

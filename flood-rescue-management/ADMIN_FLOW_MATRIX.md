# Admin Flow Matrix

File này là bản rút gọn để review nhanh role **Admin**.

---

## 1. Route Admin

| Flow | File / Function | UI Effect | Code Ref |
|---|---|---|---|
| `/admin/dashboard` | `AdminRoutes.jsx` | Mở AdminDashboard | `src/routes/AdminRoutes.jsx:19-27` |
| `/admin/configuration` | `AdminRoutes.jsx` | Mở AdminConfiguration | `src/routes/AdminRoutes.jsx:29-36` |

---

## 2. Sidebar Admin

| Flow | UI Trigger | File / Function | UI Effect | Code Ref |
|---|---|---|---|---|
| Điều hướng user dashboard | Click menu | `Sidebar.jsx` | Sang `/admin/dashboard` | `src/components/admin/Sidebar.jsx:49-71` |
| Điều hướng system config | Click menu | `Sidebar.jsx` | Sang `/admin/configuration` | `src/components/admin/Sidebar.jsx:73-97` |
| Logout | Click dropdown → Đăng xuất | `handleLogout` | Xóa localStorage, về login | `src/components/admin/Sidebar.jsx:24-29`, `199-218` |

---

## 3. Quản lý người dùng

| Mục | Nội dung |
|---|---|
| Flow | Load danh sách user toàn hệ thống |
| UI Trigger | Mở `/admin/dashboard` |
| File / Function | `AdminDashboard.jsx` → `useEffect(fetchUsers)` |
| API Call | `GET /admin/users` |
| Payload | Không có body |
| UI Effect | Set users, tính stats, render table/grid |
| Code Ref | `src/pages/Admin/AdminDashboard.jsx:33-51`, `92-157`, `219-625`; `src/services/userService.js:11-19` |

### Transform dữ liệu user
| Flow | File / Function | UI Effect | Code Ref |
|---|---|---|---|
| Map API user -> UI row | `transformedUsers` | Hiển thị role label tiếng Việt, joinDate, status | `src/pages/Admin/AdminDashboard.jsx:53-104` |

### Search / filter / view
| Flow | File / Function | UI Effect | Code Ref |
|---|---|---|---|
| Search user | `searchQuery` | Lọc theo tên/email/phone | `src/pages/Admin/AdminDashboard.jsx:25-31`, `293-322` |
| Filter role | `roleFilter` | Lọc theo vai trò | `src/pages/Admin/AdminDashboard.jsx:26`, `324-342` |
| Filter status | `statusFilter` | Lọc theo trạng thái | `src/pages/Admin/AdminDashboard.jsx:27`, `344-359` |
| Toggle view | `viewMode` | table / grid | `src/pages/Admin/AdminDashboard.jsx:28`, `361-385` |

### Mutation user đang có trong service
| Function | API | Payload | Code Ref |
|---|---|---|---|
| `createUser` | `POST /admin/users` | `userData` | `src/services/userService.js:41-49` |
| `updateUser` | `PUT /admin/users/{id}` | `userData` | `src/services/userService.js:57-65` |
| `deleteUser` | `DELETE /admin/users/{id}` | none | `src/services/userService.js:72-80` |
| `toggleUserStatus` | `PATCH /admin/users/{id}/status` | `{ isActive }` | `src/services/userService.js:88-98` |

> Ghi chú: service có mutation, nhưng dashboard hiện chưa nối đầy đủ các flow đó vào UI chính.

---

## 4. Cấu hình hệ thống Admin

| Mục | Nội dung |
|---|---|
| Flow | Chuyển giữa tab cấu hình vehicle catalog và supply catalog |
| UI Trigger | Mở `/admin/configuration` và click tab |
| File / Function | `AdminConfiguration.jsx` |
| API Call | Không call trực tiếp ở wrapper page |
| Payload | Không có |
| UI Effect | Render `VehiclesManagement` hoặc `InventoryManagement` |
| Code Ref | `src/pages/Admin/AdminConfiguration.jsx:12-105` |

---

## 5. Quản lý danh mục loại phương tiện

| Mục | Nội dung |
|---|---|
| Flow | Load danh sách vehicle types |
| UI Trigger | Mở tab vehicles |
| File / Function | `VehiclesManagement.jsx` → `fetchVehicleTypes` |
| API Call | `GET /admin/catalog/vehicle-types` |
| Payload | Không có |
| UI Effect | Render table danh mục phương tiện | `src/components/admin/VehiclesManagement.jsx:45-86` |
| Code Ref | `src/services/adminCatalogService.js:12-20` |

### Tạo / sửa vehicle type
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Create vehicle type | Modal submit | `handleSaveVehicle` | `POST /admin/catalog/vehicle-types` | `{ name, status }` | Reload list, đóng modal | `src/components/admin/VehiclesManagement.jsx:126-158`; `src/services/adminCatalogService.js:27-38` |
| Update vehicle type | Modal submit edit | `handleSaveVehicle` | `PUT /admin/catalog/vehicle-types/{id}` | `{ name, status }` | Reload list, đóng modal | `src/components/admin/VehiclesManagement.jsx:126-158`; `src/services/adminCatalogService.js:46-57` |

### Xóa vehicle type
| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Delete vehicle type | Click delete | `handleDeleteVehicle` | `DELETE /admin/catalog/vehicle-types/{id}` | Reload list | `src/components/admin/VehiclesManagement.jsx:88-98`; `src/services/adminCatalogService.js:64-72` |

---

## 6. Quản lý danh mục nhu yếu phẩm

| Mục | Nội dung |
|---|---|
| Flow | Load danh sách items catalog |
| UI Trigger | Mở tab supplies |
| File / Function | `InventoryManagement.jsx` → `fetchItems` |
| API Call | `GET /admin/catalog/items` |
| Payload | Không có |
| UI Effect | Render bảng nhu yếu phẩm | `src/components/admin/InventoryManagement.jsx:190-211` |
| Code Ref | `src/services/adminCatalogService.js:94-102` |

### Tạo / sửa item
| Flow | UI Trigger | File / Function | API Call | Payload | UI Effect | Code Ref |
|---|---|---|---|---|---|---|
| Create item | Submit modal | `SupplyModal.handleSubmit` | `POST /admin/catalog/items` | `{ name, itemType, capacity, status }` | Reload list, đóng modal | `src/components/admin/InventoryManagement.jsx:47-74`; `src/services/adminCatalogService.js:124-132` |
| Update item | Submit modal edit | `SupplyModal.handleSubmit` | `PUT /admin/catalog/items/{id}` | `{ name, itemType, capacity, status }` | Reload list, đóng modal | `src/components/admin/InventoryManagement.jsx:47-74`; `src/services/adminCatalogService.js:140-148` |

### Xóa item
| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Delete item | Click delete | `handleDeleteSupply` | `DELETE /admin/catalog/items/{id}` | Reload list | `src/components/admin/InventoryManagement.jsx:213-229`; `src/services/adminCatalogService.js:155-163` |

---

## 7. Service map nhanh cho Admin

| Service | Function | API | Code Ref |
|---|---|---|---|
| `userService` | `getAllUsers` | `GET /admin/users` | `src/services/userService.js:11-19` |
| `userService` | `getUserById` | `GET /admin/users/{id}` | `src/services/userService.js:26-34` |
| `userService` | `createUser` | `POST /admin/users` | `src/services/userService.js:41-49` |
| `userService` | `updateUser` | `PUT /admin/users/{id}` | `src/services/userService.js:57-65` |
| `userService` | `deleteUser` | `DELETE /admin/users/{id}` | `src/services/userService.js:72-80` |
| `userService` | `toggleUserStatus` | `PATCH /admin/users/{id}/status` | `src/services/userService.js:88-98` |
| `adminCatalogService` | `getAllVehicleTypes` | `GET /admin/catalog/vehicle-types` | `src/services/adminCatalogService.js:12-20` |
| `adminCatalogService` | `createVehicleType` | `POST /admin/catalog/vehicle-types` | `src/services/adminCatalogService.js:27-38` |
| `adminCatalogService` | `updateVehicleType` | `PUT /admin/catalog/vehicle-types/{id}` | `src/services/adminCatalogService.js:46-57` |
| `adminCatalogService` | `deleteVehicleType` | `DELETE /admin/catalog/vehicle-types/{id}` | `src/services/adminCatalogService.js:64-72` |
| `adminCatalogService` | `getAllItems` | `GET /admin/catalog/items` | `src/services/adminCatalogService.js:94-102` |
| `adminCatalogService` | `createItem` | `POST /admin/catalog/items` | `src/services/adminCatalogService.js:124-132` |
| `adminCatalogService` | `updateItem` | `PUT /admin/catalog/items/{id}` | `src/services/adminCatalogService.js:140-148` |
| `adminCatalogService` | `deleteItem` | `DELETE /admin/catalog/items/{id}` | `src/services/adminCatalogService.js:155-163` |

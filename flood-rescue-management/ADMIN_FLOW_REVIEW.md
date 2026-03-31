# Admin FE Flow Review

Tài liệu này mô tả luồng FE của role **Admin** để bạn review nhanh.

---

## 1. File chính liên quan

### Routes
- `src/routes/AdminRoutes.jsx`
  - `/admin/dashboard`
  - `/admin/configuration`
  - Code ref: `src/routes/AdminRoutes.jsx:1-39`

### Sidebar
- `src/components/admin/Sidebar.jsx`
  - menu điều hướng admin
  - user dropdown / logout
  - Code ref: `src/components/admin/Sidebar.jsx:1-413`

### Pages chính
- `src/pages/Admin/AdminDashboard.jsx`
  - quản lý người dùng hệ thống
  - Code ref: `src/pages/Admin/AdminDashboard.jsx:1-625`
- `src/pages/Admin/AdminConfiguration.jsx`
  - host 2 tab cấu hình danh mục
  - Code ref: `src/pages/Admin/AdminConfiguration.jsx:1-112`

### Components chính trong configuration
- `src/components/admin/VehiclesManagement.jsx`
  - CRUD danh mục loại phương tiện
  - Code ref: `src/components/admin/VehiclesManagement.jsx:1-378`
- `src/components/admin/InventoryManagement.jsx`
  - CRUD danh mục nhu yếu phẩm
  - Code ref: `src/components/admin/InventoryManagement.jsx:1-374`

### Services chính
- `src/services/userService.js`
- `src/services/adminCatalogService.js`

---

## 2. Mục tiêu nghiệp vụ của Admin

Role Admin hiện tại tập trung vào 2 nhóm chính:

1. Quản lý người dùng toàn hệ thống
2. Quản lý danh mục hệ thống
   - loại phương tiện
   - nhu yếu phẩm

---

## 3. Route Admin

## File: `src/routes/AdminRoutes.jsx`

### Route hiện có
- `/admin/dashboard` → `AdminDashboard`
- `/admin/configuration` → `AdminConfiguration`

### Code ref
- route definitions: `src/routes/AdminRoutes.jsx:19-37`

---

## 4. Sidebar Admin

## File: `src/components/admin/Sidebar.jsx`

### Menu
- Quản lý người dùng → `/admin/dashboard`
- Cấu hình hệ thống → `/admin/configuration`

### Logout
- clear localStorage `token`, `user`
- navigate `/login`

### Code ref
- navigation: `src/components/admin/Sidebar.jsx:49-104`
- logout/user menu: `src/components/admin/Sidebar.jsx:107-220`

### Nhận xét review
- Có modal/profile UI nhưng chưa thấy connect API cập nhật profile thực sự.

---

## 5. AdminDashboard.jsx

## File: `src/pages/Admin/AdminDashboard.jsx`

### Vai trò
- load danh sách toàn bộ user
- transform dữ liệu user sang UI display
- hiển thị stat cards
- search/filter role/status
- đổi view table/grid

### API chính
Trong `useEffect`:

```js
const response = await getAllUsers();
```

### API dùng
- `GET /admin/users`

### Code ref
- fetch users: `src/pages/Admin/AdminDashboard.jsx:33-51`
- transform users: `src/pages/Admin/AdminDashboard.jsx:53-104`
- stats: `src/pages/Admin/AdminDashboard.jsx:106-157`
- render page/table: `src/pages/Admin/AdminDashboard.jsx:219-625`

### Điều UI đang làm
- thống kê:
  - tổng người dùng
  - đang hoạt động
  - chờ duyệt (hiện hardcode 0)
  - đã khóa
- search theo tên/email/phone
- filter theo role/status
- toggle table/grid

### Điều chưa gắn API đầy đủ
- nút “Thêm người dùng” hiện là UI button
- export button hiện là UI button
- grid/table/filter cần kiểm tra thêm ở phần render cuối file nếu muốn verify chính xác mức độ hoạt động

### Nhận xét review
- Đây là page read-heavy, nhưng các mutation user chưa thấy nối đủ vào UI chính.

---

## 6. AdminConfiguration.jsx

## File: `src/pages/Admin/AdminConfiguration.jsx`

### Vai trò
- page wrapper cho cấu hình hệ thống
- có 2 tab:
  - `vehicles`
  - `supplies`

### Render component theo tab

```jsx
{activeTab === "vehicles" && <VehiclesManagement />}
{activeTab === "supplies" && <InventoryManagement />}
```

### Code ref
- tabs + render: `src/pages/Admin/AdminConfiguration.jsx:13-105`

---

## 7. VehiclesManagement.jsx

## File: `src/components/admin/VehiclesManagement.jsx`

### Vai trò
- quản lý **danh mục loại phương tiện**
- không phải phương tiện vận hành thực tế

### API dùng
- `GET /admin/catalog/vehicle-types`
- `POST /admin/catalog/vehicle-types`
- `PUT /admin/catalog/vehicle-types/{id}`
- `DELETE /admin/catalog/vehicle-types/{id}`

### Flow chính

#### Load list
- `fetchVehicleTypes()`
- Code ref: `src/components/admin/VehiclesManagement.jsx:45-86`

#### Create / update
- mở modal qua `handleOpenVehicleModal`
- submit qua `handleSaveVehicle`
- Code ref: `src/components/admin/VehiclesManagement.jsx:100-158`

#### Delete
- `handleDeleteVehicle`
- Code ref: `src/components/admin/VehiclesManagement.jsx:88-98`

### Payload create/update
```json
{
  "name": "Boat",
  "status": "ACTIVE"
}
```

### UI effect
- save/delete xong sẽ `fetchVehicleTypes()` lại

---

## 8. InventoryManagement.jsx

## File: `src/components/admin/InventoryManagement.jsx`

### Vai trò
- quản lý **danh mục nhu yếu phẩm**
- không phải tồn kho warehouse thực tế

### API dùng
- `GET /admin/catalog/items`
- `POST /admin/catalog/items`
- `PUT /admin/catalog/items/{id}`
- `DELETE /admin/catalog/items/{id}`

### Flow chính

#### Load list
- `fetchItems()`
- Code ref: `src/components/admin/InventoryManagement.jsx:190-211`

#### Create / update
- modal `SupplyModal`
- submit qua `handleSubmit`
- Code ref: `src/components/admin/InventoryManagement.jsx:19-181`

#### Delete
- `handleDeleteSupply`
- Code ref: `src/components/admin/InventoryManagement.jsx:213-229`

### Payload create/update
```json
{
  "name": "Nước suối 500ml",
  "itemType": "FOOD",
  "capacity": "500ml",
  "status": "ACTIVE"
}
```

### UI effect
- save/delete xong sẽ refresh lại list items

---

## 9. Service chính cho Admin

### `userService.js`

Functions hiện có:
- `getAllUsers()` → `GET /admin/users`
- `getUserById()` → `GET /admin/users/{id}`
- `createUser()` → `POST /admin/users`
- `updateUser()` → `PUT /admin/users/{id}`
- `deleteUser()` → `DELETE /admin/users/{id}`
- `toggleUserStatus()` → `PATCH /admin/users/{id}/status`

### Code ref
- `src/services/userService.js:11-107`

### `adminCatalogService.js`

Functions chính:
- vehicle types:
  - get all / create / update / delete / get active
- items:
  - get all / create / update / delete / get active

### Code ref
- vehicle type APIs: `src/services/adminCatalogService.js:12-86`
- item APIs: `src/services/adminCatalogService.js:94-177`

---

## 10. Điểm cần chú ý khi review Admin

1. `AdminDashboard` hiện mới chắc chắn dùng `GET /admin/users`
2. Các mutation user có trong `userService.js` nhưng chưa thấy nối hoàn chỉnh vào dashboard UI chính
3. `toggleUserStatus()` đang dùng `PATCH`, trong khi BE trước đó mình đã note có khả năng contract là `PUT /admin/users/{id}/status`
4. `VehiclesManagement` và `InventoryManagement` là cấu hình catalog, không phải dữ liệu vận hành thực tế
5. Sidebar admin có profile/password modal UI nhưng chưa thấy nối service tương ứng

---

## 11. Thứ tự đọc file nên review

1. `src/routes/AdminRoutes.jsx`
2. `src/components/admin/Sidebar.jsx`
3. `src/pages/Admin/AdminDashboard.jsx`
4. `src/pages/Admin/AdminConfiguration.jsx`
5. `src/components/admin/VehiclesManagement.jsx`
6. `src/components/admin/InventoryManagement.jsx`
7. `src/services/userService.js`
8. `src/services/adminCatalogService.js`

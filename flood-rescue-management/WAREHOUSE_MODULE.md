# 📦 Tài liệu Phân Hệ Kho (Warehouse Module)

> **Dự án:** Flood Rescue Backend  
> **Ngày cập nhật:** 08/03/2026  
> **Phiên bản:** v1

---

## 📌 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Các Role liên quan](#2-các-role-liên-quan)
3. [Các Entity (Model) liên quan](#3-các-entity-model-liên-quan)
4. [API & Endpoints](#4-api--endpoints)
   - 4.1 [Quản lý Kho (Warehouse)](#41-quản-lý-kho-warehouse)
   - 4.2 [Quản lý Tồn kho (Inventory)](#42-quản-lý-tồn-kho-inventory)
   - 4.3 [Phân phối Cứu trợ (Relief Distribution)](#43-phân-phối-cứu-trợ-relief-distribution)
   - 4.4 [Danh mục Hàng hóa (Item Catalog)](#44-danh-mục-hàng-hóa-item-catalog)
5. [Luồng hoạt động](#5-luồng-hoạt-động)
   - 5.1 [Luồng Tạo Kho](#51-luồng-tạo-kho)
   - 5.2 [Luồng Nhập Kho](#52-luồng-nhập-kho)
   - 5.3 [Luồng Xuất Kho](#53-luồng-xuất-kho)
   - 5.4 [Luồng Phân phối Hàng Cứu trợ](#54-luồng-phân-phối-hàng-cứu-trợ)
   - 5.5 [Luồng Quản lý Danh mục Item (Admin)](#55-luồng-quản-lý-danh-mục-item-admin)
6. [Quan hệ giữa các Entity](#6-quan-hệ-giữa-các-entity)
7. [Xử lý lỗi](#7-xử-lý-lỗi)

---

## 1. Tổng quan

Phân hệ Kho là thành phần quản lý toàn bộ vòng đời của hàng hóa cứu trợ trong hệ thống Flood Rescue, bao gồm:

- **Quản lý kho vật lý** (tạo mới, xem thông tin, trạng thái kho)
- **Quản lý tồn kho** (nhập hàng, xuất hàng, xem số lượng hiện tại)
- **Ghi nhận lịch sử giao dịch** (mọi thao tác nhập/xuất đều được log lại)
- **Phân phối hàng cứu trợ** đến hộ dân dựa trên nhiệm vụ cứu hộ
- **Quản lý danh mục hàng hóa** (loại nhu yếu phẩm)

---

## 2. Các Role liên quan

| Role | Tên hiển thị | Quyền hạn trong phân hệ Kho |
|------|-------------|------------------------------|
| `MANAGER` | Quản lý kho | Toàn quyền: tạo kho, xem kho, nhập kho, xuất kho, phân phối cứu trợ |
| `ADMIN` | Quản trị viên | Phân phối cứu trợ; quản lý danh mục hàng hóa (CRUD Items) |
| `RESCUE_COORDINATOR` | Điều phối cứu hộ | Tạo và quản lý nhiệm vụ (Mission) — gián tiếp ảnh hưởng đến kho qua MissionSupply |
| `isAuthenticated()` | Mọi user đã đăng nhập | Chỉ đọc danh mục hàng hóa (Items, VehicleTypes) |

> **Lưu ý bảo mật:** Toàn bộ các endpoint kho đều yêu cầu JWT token hợp lệ. Phân quyền thực hiện qua Spring Security `@PreAuthorize`.

---

## 3. Các Entity (Model) liên quan

### 3.1 `Warehouse` — Kho hàng

**Bảng DB:** `warehouses`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `user` | FK → `users` | Manager phụ trách kho |
| `resourceId` | String | Mã tài nguyên liên kết |
| `supplyId` | String | Mã nguồn cung liên kết |
| `status` | Enum | Trạng thái kho |
| `latitude` | BigDecimal | Vĩ độ vị trí kho |
| `longitude` | BigDecimal | Kinh độ vị trí kho |
| `address` | String | Địa chỉ kho |

**Trạng thái kho (`WarehouseStatus`):**
- `ACTIVE` — Đang hoạt động
- `INACTIVE` — Tạm ngưng
- `LOCKED` — Bị khóa

---

### 3.2 `Item` — Danh mục hàng hóa

**Bảng DB:** `items`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `name` | String | Tên hàng hóa |
| `itemType` | Enum | Phân loại hàng hóa |
| `capacity` | String | Đơn vị / dung tích |
| `status` | Enum | Trạng thái item |

**Phân loại hàng hóa (`ItemType`):**
- `FOOD` — Thực phẩm
- `DRINK` — Nước uống
- `MEDICAL_SUPPLIES` — Vật tư y tế

**Trạng thái (`ItemStatus`):**
- `ACTIVE` — Đang sử dụng
- `INACTIVE` — Ngừng sử dụng

---

### 3.3 `Inventory` — Tồn kho

**Bảng DB:** `inventories`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `item` | FK → `items` | Loại hàng hóa |
| `warehouse` | FK → `warehouses` | Kho chứa |
| `quantity` | Integer | Số lượng hiện tại |
| `lastUpdate` | LocalDateTime | Lần cập nhật cuối |
| `version` | Long | Optimistic locking (tránh race condition) |

> **Ghi chú:** Mỗi bản ghi `Inventory` đại diện cho số lượng của **một loại hàng hóa** tại **một kho cụ thể** (quan hệ warehouse × item là unique).

---

### 3.4 `InventoryTransaction` — Lịch sử giao dịch kho

**Bảng DB:** `inventory_transactions`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `inventory` | FK → `inventories` | Tồn kho liên quan |
| `transactionType` | Enum | Loại giao dịch (`IN` / `OUT`) |
| `quantity` | Integer | Số lượng giao dịch |
| `beforeQuantity` | Integer | Số lượng trước giao dịch |
| `afterQuantity` | Integer | Số lượng sau giao dịch |
| `user` | FK → `users` | Người thực hiện |
| `createdAt` | LocalDateTime | Thời điểm giao dịch |

---

### 3.5 `ReliefDistribution` — Phân phối cứu trợ

**Bảng DB:** `relief_distributions`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `mission` | FK → `missions` | Nhiệm vụ cứu hộ liên quan |
| `inventory` | FK → `inventories` | Tồn kho sử dụng |
| `quantityDistributed` | Integer | Số lượng đã phân phối |
| `householdIdentifier` | String | CCCD / Định danh hộ gia đình nhận hàng |
| `recordedBy` | FK → `users` | Manager/Admin ghi nhận |
| `distributedAt` | LocalDateTime | Thời điểm phân phối |
| `isConfirmed` | Boolean | Xác nhận hộ dân đã nhận (`false` mặc định) |

---

### 3.6 `MissionSupply` — Vật tư theo nhiệm vụ

**Bảng DB:** `mission_supplies`

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `id` | Integer (PK) | ID tự tăng |
| `mission` | FK → `missions` | Nhiệm vụ cứu hộ |
| `inventory` | FK → `inventories` | Tồn kho được phân bổ |
| `quantity` | Integer | Số lượng phân bổ |

---

## 4. API & Endpoints

### 4.1 Quản lý Kho (Warehouse)

**Base URL:** `/api/v1/warehouses`  
**Phân quyền:** `MANAGER`

#### `POST /api/v1/warehouses` — Tạo kho mới

**Request Body:**
```json
{
  "userId": 1,
  "resourceId": "RES-001",
  "supplyId": "SUP-001",
  "status": "ACTIVE",
  "latitude": 10.12345678,
  "longitude": 106.12345678,
  "address": "123 Đường Lê Lợi, TP.HCM"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kho hàng đã được tạo thành công",
  "data": {
    "id": 1,
    "userId": 1,
    "resourceId": "RES-001",
    "supplyId": "SUP-001",
    "status": "ACTIVE",
    "latitude": 10.12345678,
    "longitude": 106.12345678,
    "address": "123 Đường Lê Lợi, TP.HCM"
  }
}
```

---

#### `GET /api/v1/warehouses` — Lấy danh sách tất cả kho

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "status": "ACTIVE",
      "address": "123 Đường Lê Lợi, TP.HCM",
      "latitude": 10.12345678,
      "longitude": 106.12345678
    }
  ]
}
```

---

#### `GET /api/v1/warehouses/{id}` — Lấy chi tiết kho theo ID

**Path Variable:** `id` — ID của kho

**Response (200 OK):** Trả về `WarehouseDetailResponse` của kho tương ứng.

---

### 4.2 Quản lý Tồn kho (Inventory)

**Base URL:** `/api/v1/warehouses/{id}/inventory`  
**Phân quyền:** `MANAGER`

#### `GET /api/v1/warehouses/{id}/inventory` — Xem tồn kho của kho

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "warehouseId": 1,
    "items": [
      {
        "itemId": 1,
        "itemName": "Mì gói",
        "quantity": 500
      },
      {
        "itemId": 2,
        "itemName": "Nước uống 500ml",
        "quantity": 1000
      }
    ]
  }
}
```

---

#### `POST /api/v1/warehouses/{id}/inventory/in` — Nhập hàng vào kho

**Request Body:**
```json
{
  "itemId": 1,
  "quantity": 200
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Nhập kho thành công",
  "data": {
    "warehouseId": 1,
    "items": [
      {
        "itemId": 1,
        "itemName": "Mì gói",
        "quantity": 700
      }
    ]
  }
}
```

**Validation:**
- `quantity` phải > 0
- `itemId` phải tồn tại trong DB
- Nếu chưa có bản ghi Inventory (item chưa từng có trong kho này), hệ thống tự tạo mới với số lượng ban đầu = 0

---

#### `POST /api/v1/warehouses/{id}/inventory/out` — Xuất hàng khỏi kho

**Request Body:**
```json
{
  "itemId": 1,
  "quantity": 100
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xuất kho thành công",
  "data": {
    "warehouseId": 1,
    "items": [
      {
        "itemId": 1,
        "itemName": "Mì gói",
        "quantity": 600
      }
    ]
  }
}
```

**Validation:**
- `quantity` phải > 0
- Tồn kho hiện tại phải ≥ số lượng yêu cầu xuất (kiểm tra `Insufficient storage space`)
- Bản ghi Inventory phải tồn tại cho cặp (warehouseId, itemId)

---

### 4.3 Phân phối Cứu trợ (Relief Distribution)

**Base URL:** `/api/v1/relief-distributions`  
**Phân quyền:** `MANAGER` hoặc `ADMIN`

#### `POST /api/v1/relief-distributions` — Ghi nhận phân phối hàng cứu trợ

**Request Body:**
```json
{
  "missionId": 5,
  "inventoryId": 3,
  "quantity": 10,
  "householdIdentifier": "079201012345",
  "isConfirmed": false
}
```

**Validation:**
- `missionId` — bắt buộc, nhiệm vụ phải tồn tại
- `inventoryId` — bắt buộc, tồn kho phải tồn tại
- `quantity` — bắt buộc, ≥ 0
- `householdIdentifier` — bắt buộc (CCCD hoặc mã định danh hộ dân)
- `isConfirmed` — tùy chọn, mặc định `false`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ghi nhận phân phối thành công",
  "data": {
    "id": 10,
    "missionId": 5,
    "inventoryId": 3,
    "itemName": "Mì gói",
    "itemType": "FOOD",
    "quantityDistributed": 10,
    "householdIdentifier": "079201012345",
    "isConfirmed": false,
    "recordedById": 2,
    "recordedByName": "Nguyễn Văn A",
    "distributedAt": "2026-03-08T10:30:00"
  }
}
```

---

### 4.4 Danh mục Hàng hóa (Item Catalog)

**Base URL:** `/api/v1/admin/catalog`  
**Phân quyền:** Đọc — mọi user đã xác thực; Ghi (POST/PUT/DELETE) — `ADMIN`

| Method | Endpoint | Phân quyền | Mô tả |
|--------|----------|-----------|-------|
| `GET` | `/api/v1/admin/catalog/items` | Authenticated | Lấy tất cả items |
| `GET` | `/api/v1/admin/catalog/items/active` | Authenticated | Lấy items đang hoạt động |
| `GET` | `/api/v1/admin/catalog/items/{id}` | Authenticated | Lấy item theo ID |
| `POST` | `/api/v1/admin/catalog/items` | `ADMIN` | Tạo item mới |
| `PUT` | `/api/v1/admin/catalog/items/{id}` | `ADMIN` | Cập nhật item |
| `DELETE` | `/api/v1/admin/catalog/items/{id}` | `ADMIN` | Xóa item |

**Request Body (POST/PUT):**
```json
{
  "name": "Mì gói",
  "itemType": "FOOD",
  "capacity": "75g/gói",
  "status": "ACTIVE"
}
```

---

## 5. Luồng hoạt động

### 5.1 Luồng Tạo Kho

```
MANAGER
  │
  ├─ POST /api/v1/warehouses
  │   └─ Body: { userId, address, latitude, longitude, status, ... }
  │
  ├─ [Hệ thống] Kiểm tra userId tồn tại → Nếu không: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tạo bản ghi Warehouse mới trong DB
  │
  └─ Trả về: WarehouseDetailResponse (200 OK)
```

---

### 5.2 Luồng Nhập Kho

```
MANAGER
  │
  ├─ POST /api/v1/warehouses/{id}/inventory/in
  │   └─ Body: { itemId, quantity }
  │
  ├─ [Validate] quantity > 0 → Nếu không: BadRequestException
  │
  ├─ [Hệ thống] Tìm Warehouse theo {id} → Nếu không tồn tại: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tìm Item theo itemId → Nếu không tồn tại: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tìm bản ghi Inventory (warehouseId × itemId):
  │   ├─ Đã tồn tại → Cộng thêm quantity
  │   └─ Chưa tồn tại → Tạo mới với quantity = 0, rồi cộng thêm
  │
  ├─ [Hệ thống] Lưu Inventory đã cập nhật
  │
  ├─ [Hệ thống] Tạo InventoryTransaction:
  │   ├─ transactionType = IN
  │   ├─ beforeQuantity = số lượng trước
  │   └─ afterQuantity = số lượng sau
  │
  └─ Trả về: WarehouseInventoryResponse (200 OK) — Danh sách tồn kho hiện tại
```

---

### 5.3 Luồng Xuất Kho

```
MANAGER
  │
  ├─ POST /api/v1/warehouses/{id}/inventory/out
  │   └─ Body: { itemId, quantity }
  │
  ├─ [Validate] quantity > 0 → Nếu không: BadRequestException
  │
  ├─ [Hệ thống] Tìm Warehouse theo {id} → Nếu không tồn tại: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tìm Item theo itemId → Nếu không tồn tại: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tìm Inventory (warehouseId × itemId):
  │   └─ Không tìm thấy HOẶC quantity hiện tại < quantity yêu cầu
  │       → BadRequestException ("Insufficient storage space to export")
  │
  ├─ [Hệ thống] Cập nhật Inventory: quantity -= request.quantity
  │
  ├─ [Hệ thống] Tạo InventoryTransaction:
  │   ├─ transactionType = OUT
  │   ├─ beforeQuantity = số lượng trước
  │   └─ afterQuantity = số lượng sau
  │
  └─ Trả về: WarehouseInventoryResponse (200 OK) — Danh sách tồn kho hiện tại
```

---

### 5.4 Luồng Phân phối Hàng Cứu trợ

```
MANAGER / ADMIN
  │
  ├─ POST /api/v1/relief-distributions
  │   └─ Body: { missionId, inventoryId, quantity, householdIdentifier, isConfirmed }
  │
  ├─ [Hệ thống] Xác thực người dùng từ JWT (SecurityContextHolder)
  │   └─ Không xác thực được → BadRequestException
  │
  ├─ [Hệ thống] Tìm Mission theo missionId → Nếu không: ResourceNotFoundException
  │
  ├─ [Hệ thống] Tìm Inventory theo inventoryId → Nếu không: ResourceNotFoundException
  │
  ├─ [Validate] inventory.quantity >= request.quantity
  │   └─ Không đủ → InsufficientInventoryException
  │
  ├─ [Hệ thống] Giảm tồn kho: inventory.quantity -= request.quantity
  │   └─ Cập nhật lastUpdate = now()
  │
  ├─ [Hệ thống] Tạo bản ghi ReliefDistribution:
  │   ├─ mission, inventory, quantityDistributed
  │   ├─ householdIdentifier (CCCD hộ dân)
  │   ├─ isConfirmed = false (mặc định)
  │   ├─ recordedBy = user hiện tại (từ JWT)
  │   └─ distributedAt = now()
  │
  └─ Trả về: ReliefDistributionResponse (200 OK)
```

> **Lưu ý:** Thao tác này có `@Transactional` — nếu bất kỳ bước nào thất bại, toàn bộ thao tác bị rollback.

---

### 5.5 Luồng Quản lý Danh mục Item (Admin)

```
[Đọc - Mọi user đã xác thực]
  ├─ GET /api/v1/admin/catalog/items         → Tất cả items
  ├─ GET /api/v1/admin/catalog/items/active  → Items đang active
  └─ GET /api/v1/admin/catalog/items/{id}    → Chi tiết 1 item

[Ghi - Chỉ ADMIN]
  │
  ├─ POST /api/v1/admin/catalog/items
  │   └─ Tạo item mới (name, itemType, capacity, status)
  │
  ├─ PUT /api/v1/admin/catalog/items/{id}
  │   └─ Cập nhật thông tin item
  │
  └─ DELETE /api/v1/admin/catalog/items/{id}
      └─ Xóa item khỏi danh mục
```

---

## 6. Quan hệ giữa các Entity

```
users (User)
  │
  ├──[1:N]── warehouses (Warehouse)          ← Manager phụ trách kho
  │
  └──[1:N]── inventory_transactions          ← Người thực hiện giao dịch
             └──[N:1]── relief_distributions ← Người ghi nhận phân phối

items (Item)
  └──[1:N]── inventories (Inventory)
               ├──[N:1]── warehouses (Warehouse)
               ├──[1:N]── inventory_transactions (InventoryTransaction)
               ├──[1:N]── relief_distributions (ReliefDistribution)
               └──[1:N]── mission_supplies (MissionSupply)

missions (Mission)
  ├──[1:N]── relief_distributions (ReliefDistribution)
  └──[1:N]── mission_supplies (MissionSupply)
```

### Sơ đồ quan hệ rút gọn

```
Warehouse ──< Inventory >── Item
                  │
                  ├──< InventoryTransaction
                  ├──< ReliefDistribution >── Mission
                  └──< MissionSupply      >── Mission
```

---

## 7. Xử lý lỗi

| Ngoại lệ | HTTP Status | Trường hợp xảy ra |
|-----------|------------|-------------------|
| `ResourceNotFoundException` | 404 Not Found | Không tìm thấy Warehouse, Item, Inventory, Mission, User theo ID |
| `BadRequestException` | 400 Bad Request | Số lượng ≤ 0; User chưa xác thực; Tồn kho không đủ khi xuất |
| `InsufficientInventoryException` | 400 Bad Request | Tồn kho không đủ khi phân phối cứu trợ |
| `AccessDeniedException` | 403 Forbidden | Không đủ quyền truy cập endpoint |
| `MethodArgumentNotValidException` | 400 Bad Request | Vi phạm validation (`@NotNull`, `@NotBlank`, `@Min`) |

---

## 8. Tóm tắt nhanh các Endpoint Kho

| Method | Endpoint | Role | Chức năng |
|--------|----------|------|-----------|
| `POST` | `/api/v1/warehouses` | MANAGER | Tạo kho mới |
| `GET` | `/api/v1/warehouses` | MANAGER | Xem tất cả kho |
| `GET` | `/api/v1/warehouses/{id}` | MANAGER | Chi tiết kho |
| `GET` | `/api/v1/warehouses/{id}/inventory` | MANAGER | Xem tồn kho |
| `POST` | `/api/v1/warehouses/{id}/inventory/in` | MANAGER | Nhập hàng |
| `POST` | `/api/v1/warehouses/{id}/inventory/out` | MANAGER | Xuất hàng |
| `POST` | `/api/v1/relief-distributions` | MANAGER, ADMIN | Phân phối cứu trợ |
| `GET` | `/api/v1/admin/catalog/items` | Authenticated | Xem danh mục hàng hóa |
| `GET` | `/api/v1/admin/catalog/items/active` | Authenticated | Xem hàng hóa đang active |
| `GET` | `/api/v1/admin/catalog/items/{id}` | Authenticated | Chi tiết hàng hóa |
| `POST` | `/api/v1/admin/catalog/items` | ADMIN | Tạo hàng hóa mới |
| `PUT` | `/api/v1/admin/catalog/items/{id}` | ADMIN | Cập nhật hàng hóa |
| `DELETE` | `/api/v1/admin/catalog/items/{id}` | ADMIN | Xóa hàng hóa |

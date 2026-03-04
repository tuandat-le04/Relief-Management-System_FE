# Rescue Requests API – Coordinator

**Base URL:** `http://localhost:8080`
**Base path:** `/api/v1/rescue-requests`

Tất cả response đều theo cấu trúc:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## Danh sách endpoint

| # | Method | URL | Mô tả |
|---|--------|-----|-------|
| 1 | `GET` | `/api/v1/rescue-requests` | Lấy tất cả yêu cầu |
| 2 | `GET` | `/api/v1/rescue-requests/{id}` | Lấy yêu cầu theo ID |
| 3 | `GET` | `/api/v1/rescue-requests/user/{userId}` | Lấy yêu cầu theo User ID |
| 4 | `PUT` | `/api/v1/rescue-requests/{id}/status` | Cập nhật trạng thái yêu cầu |
| 5 | `PUT` | `/api/v1/rescue-requests/{id}/approve` | Duyệt yêu cầu |
| 6 | `PUT` | `/api/v1/rescue-requests/{id}/cancel` | Hủy yêu cầu |
| 7 | `PATCH` | `/api/v1/rescue-requests/{id}/classify` | Phân loại yêu cầu |

---

## Luồng xử lý (Flow)

### Luồng 1 – Xem và phân loại yêu cầu mới

```
1. GET  /api/v1/rescue-requests
       → Lấy danh sách toàn bộ yêu cầu (status = CREATED)

2. GET  /api/v1/rescue-requests/{id}
       → Xem chi tiết yêu cầu cụ thể

3. PATCH /api/v1/rescue-requests/{id}/classify
       → Phân loại: cập nhật priority và requestType cho yêu cầu
```

---

### Luồng 2 – Duyệt hoặc hủy yêu cầu

```
1. GET  /api/v1/rescue-requests
       → Lấy danh sách, lọc những yêu cầu cần xử lý

2. PUT  /api/v1/rescue-requests/{id}/approve   ← Duyệt yêu cầu
   HOẶC
   PUT  /api/v1/rescue-requests/{id}/cancel    ← Hủy yêu cầu
```

---

### Luồng 3 – Cập nhật tiến trình xử lý

```
1. PUT  /api/v1/rescue-requests/{id}/status
       body: "IN_PROGRESS"   → Đánh dấu đang xử lý

2. PUT  /api/v1/rescue-requests/{id}/status
       body: "COMPLETED"     → Đánh dấu hoàn thành
```

---

### Vòng đời trạng thái (Status Lifecycle)

```
CREATED
   │
   ├──[classify]──► CREATED (priority & type được cập nhật)
   │
   ├──[approve]───► IN_PROGRESS
   │                    │
   │                    └──[status = COMPLETED]──► COMPLETED
   │
   └──[cancel]────► CANCELLED
```

---

## Chi tiết

---

### 1. Lấy tất cả yêu cầu

```
GET /api/v1/rescue-requests
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 10,
      "userId": 1,
      "phone": "0901234567",
      "requestType": "RESCUE",
      "latitude": 10.76372,
      "longitude": 106.68228,
      "description": "Bị mắc kẹt trên mái nhà",
      "priority": "HIGH",
      "status": "CREATED",
      "requestSupplies": "Áo phao, thuyền",
      "requestMedia": "https://...",
      "createdAt": "2026-03-04T10:00:00"
    }
  ]
}
```

---

### 2. Lấy yêu cầu theo ID

```
GET /api/v1/rescue-requests/{id}
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của yêu cầu |

**Response `200 OK`:** Trả về 1 object `RequestDetailResponse` (cấu trúc như trên).

---

### 3. Lấy yêu cầu theo User ID

```
GET /api/v1/rescue-requests/user/{userId}
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `userId` | integer | ID của người dùng |

**Response `200 OK`:** Trả về mảng `RequestDetailResponse[]`.

---

### 4. Cập nhật trạng thái yêu cầu

```
PUT /api/v1/rescue-requests/{id}/status
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của yêu cầu |

**Request Body** (`Content-Type: text/plain`):
```
"IN_PROGRESS"
```

Giá trị hợp lệ: `CREATED` · `IN_PROGRESS` · `COMPLETED` · `CANCELLED`

**Response `200 OK`:** Trả về `RequestDetailResponse`.

---

### 5. Duyệt yêu cầu

```
PUT /api/v1/rescue-requests/{id}/approve
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của yêu cầu |

Không cần request body.

**Response `200 OK`:** Trả về `RequestDetailResponse`.

---

### 6. Hủy yêu cầu

```
PUT /api/v1/rescue-requests/{id}/cancel
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của yêu cầu |

Không cần request body.

**Response `200 OK`:** Trả về `RequestDetailResponse`.

---

### 7. Phân loại yêu cầu

```
PATCH /api/v1/rescue-requests/{id}/classify
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của yêu cầu |

**Request Body:**
```json
{
  "priority": "CRITICAL",
  "requestType": "RESCUE"
}
```

| Trường | Giá trị hợp lệ |
|--------|----------------|
| `priority` | `CRITICAL` · `HIGH` · `MEDIUM` · `NORMAL` · `LOW` |
| `requestType` | `RESCUE` · `RELIEF` · `OTHER` |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Phân loại yêu cầu thành công",
  "data": { "...RequestDetailResponse..." }
}
```

---

## RequestDetailResponse – Cấu trúc đầy đủ

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | integer | ID yêu cầu |
| `userId` | integer | ID người gửi yêu cầu |
| `phone` | string | Số điện thoại liên lạc |
| `requestType` | string | `RESCUE` / `RELIEF` / `OTHER` |
| `latitude` | decimal | Vĩ độ GPS |
| `longitude` | decimal | Kinh độ GPS |
| `description` | string | Mô tả tình huống |
| `priority` | string | `CRITICAL` / `HIGH` / `MEDIUM` / `NORMAL` / `LOW` |
| `status` | string | `CREATED` / `IN_PROGRESS` / `COMPLETED` / `CANCELLED` |
| `requestSupplies` | string | Vật tư yêu cầu |
| `requestMedia` | string | URL ảnh/video đính kèm |
| `createdAt` | datetime | Thời gian tạo (ISO 8601) |

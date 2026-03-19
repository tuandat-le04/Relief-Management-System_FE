# Tài liệu API cho FE (Manager)

## 1) Mục tiêu
Tài liệu này mô tả các API cần thiết để FE triển khai:
- Trang **Tổng quan dự án** cho role `MANAGER`
- Trang **Báo cáo tổng hợp** cho role `MANAGER`

---

## 2) Chuẩn tích hợp chung

### Base URL
- `http://<host>:8080`

### Xác thực
- Đăng nhập lấy token: `POST /api/v1/auth/login`
- Gửi token cho các API cần auth:
  - `Authorization: Bearer <token>`

### Format response chung
Hầu hết API trả theo format:
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## 3) API cần cho Trang 1: Tổng quan dự án (Manager)

### 3.1 API KPI tổng quan (quan trọng nhất)

### `GET /api/v1/reports/summary`
- **Role**: `ADMIN`, `MANAGER`
- **Mục đích**: Lấy nhanh toàn bộ số liệu card/chart tổng quan.
- **Response `data`** (`DashboardSummaryResponse`):

```json
{
  "totalRequests": 0,
  "requestsCreated": 0,
  "requestsInProgress": 0,
  "requestsCompleted": 0,
  "requestsCancelled": 0,
  "totalMissions": 0,
  "missionsPending": 0,
  "missionsAssigned": 0,
  "missionsInProgress": 0,
  "missionsCompleted": 0,
  "missionsCancelled": 0,
  "totalPeopleRescued": 0,
  "totalVehicles": 0,
  "vehiclesAvailable": 0,
  "vehiclesInUse": 0,
  "vehiclesMaintenance": 0
}
```

> FE có thể dùng endpoint này cho toàn bộ block KPI chính của trang Dashboard Manager.

---

### 3.2 API chi tiết Manager có thể gọi

### A. Kho hàng
1. `GET /api/v1/warehouses`
- **Role**: `MANAGER`, `RESCUE_COORDINATOR`
- **Dùng cho**: bảng danh sách kho.

2. `GET /api/v1/warehouses/{id}`
- **Role**: `MANAGER`, `RESCUE_COORDINATOR`
- **Dùng cho**: chi tiết kho.

3. `GET /api/v1/warehouses/{id}/inventory`
- **Role**: `MANAGER`, `RESCUE_COORDINATOR`
- **Dùng cho**: widget tồn kho theo kho.

### B. Phương tiện
1. `GET /api/v1/vehicles`
- **Role**: `MANAGER`, `ADMIN`
- **Dùng cho**: bảng phương tiện, biểu đồ theo trạng thái.

2. `GET /api/v1/vehicles/status/{status}`
- **Role**: `MANAGER`, `RESCUE_COORDINATOR`
- **Dùng cho**: lọc nhanh theo trạng thái (`AVAILABLE`, `IN_USE`, `MAINTENANCE`).

3. `GET /api/v1/vehicles/any-available`
- **Role**: `MANAGER`, `RESCUE_COORDINATOR`
- **Dùng cho**: cảnh báo còn/không còn phương tiện khả dụng.

### C. Đội cứu hộ
1. `GET /api/v1/rescue-teams`
- **Role**: `RESCUE_COORDINATOR`, `ADMIN`, `MANAGER`
- **Dùng cho**: danh sách đội cứu hộ.

2. `GET /api/v1/rescue-teams/available`
- **Role**: `RESCUE_COORDINATOR`, `ADMIN`, `MANAGER`
- **Dùng cho**: số đội sẵn sàng.

### D. Phản hồi và thông báo
1. `GET /api/v1/feedbacks`
- **Role**: `MANAGER`, `ADMIN`
- **Dùng cho**: thống kê phản hồi người dân.

2. `GET /api/v1/notifications/unread`
- **Role**: có `MANAGER`
- **Dùng cho**: badge số thông báo chưa đọc.

---

## 4) API cần cho Trang 2: Báo cáo tổng hợp (Manager)

### 4.1 Nguồn dữ liệu chính

1. `GET /api/v1/reports/summary`
- Dùng cho phần **tổng hợp số liệu đầu trang**.

2. `GET /api/v1/vehicles`
- Dùng để FE tổng hợp theo trạng thái phương tiện.

3. `GET /api/v1/warehouses`
- Dùng để FE tổng hợp số kho/phân bố kho.

4. `GET /api/v1/warehouses/{id}/inventory`
- Dùng để FE tổng hợp tồn kho theo từng kho, item, số lượng.

5. `GET /api/v1/rescue-teams`
- Dùng để FE tổng hợp theo trạng thái đội cứu hộ.

6. `GET /api/v1/feedbacks`
- Dùng cho báo cáo phản hồi người dân.

---

## 5) API phụ trợ có thể dùng thêm

1. `GET /api/v1/feedbacks/user/{userId}`
- Lọc feedback theo user.

2. `GET /api/v1/admin/catalog/items/active`
- Danh mục nhu yếu phẩm đang hoạt động (hữu ích khi render tồn kho dễ hiểu).

3. `GET /api/v1/admin/catalog/vehicle-types/active`
- Danh mục loại phương tiện đang hoạt động.

4. `GET /api/v1/notifications`
- Danh sách toàn bộ thông báo của user đăng nhập.

---

## 6) Đăng nhập cho Manager (tham chiếu nhanh)

### `POST /api/v1/auth/login`
Request:
```json
{
  "email": "manager@example.com",
  "password": "123456"
}
```

Response `data`:
```json
{
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "userId": 10,
  "email": "manager@example.com",
  "role": "MANAGER"
}
```

---

## 7) Mapping nhanh giữa UI và API

### Trang Tổng quan dự án (Manager)
- KPI cards: `GET /api/v1/reports/summary`
- Widget kho hàng: `GET /api/v1/warehouses`, `GET /api/v1/warehouses/{id}/inventory`
- Widget phương tiện: `GET /api/v1/vehicles`, `GET /api/v1/vehicles/any-available`
- Widget đội cứu hộ: `GET /api/v1/rescue-teams/available`
- Badge thông báo: `GET /api/v1/notifications/unread`

### Trang Báo cáo tổng hợp (Manager)
- Tóm tắt số liệu: `GET /api/v1/reports/summary`
- Báo cáo tồn kho: `GET /api/v1/warehouses`, `GET /api/v1/warehouses/{id}/inventory`
- Báo cáo phương tiện: `GET /api/v1/vehicles`, `GET /api/v1/vehicles/status/{status}`
- Báo cáo đội cứu hộ: `GET /api/v1/rescue-teams`
- Báo cáo phản hồi: `GET /api/v1/feedbacks`

---

## 8) Lưu ý quan trọng về phân quyền
- Role `MANAGER` **không có quyền** gọi các API Admin-only như:
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/users/pending`
- Role `MANAGER` cũng **không có quyền** gọi danh sách tổng request/mission:
  - `GET /api/v1/rescue-requests`
  - `GET /api/v1/missions`
- Để làm báo cáo cho Manager, nên ưu tiên nguồn dữ liệu đã liệt kê ở mục 4.

---

## 9) Lưu ý cho FE
- Hiện tại một số API chưa có phân trang/filter theo ngày ở query param cho trang report.
- FE có thể xử lý lọc/sắp xếp tạm thời ở client.
- Nếu dữ liệu lớn, nên bổ sung API backend theo hướng:
  - `fromDate`, `toDate`
  - `status`, `type`
  - `page`, `size`, `sort`

# Tài liệu review role Coordinator

## 1) Mục tiêu nghiệp vụ của màn Coordinator
Coordinator xử lý toàn bộ vòng đời yêu cầu cứu hộ/cứu trợ:

1. Nhận yêu cầu mới (`pending`)
2. Phân loại mức ưu tiên + loại yêu cầu
3. Tiếp nhận yêu cầu
4. Phân công team, phương tiện, vật tư
5. Theo dõi team thực thi
6. Xác nhận hoàn thành hoặc từ chối

---

## 2) File chính cần review

### Dashboard & UI chính
- `src/pages/coordinator/CoordinatorDashboard.jsx`
- `src/components/coordinator/RequestCard.jsx`
- `src/components/coordinator/TabBar.jsx`
- `src/components/coordinator/StatsCards.jsx`
- `src/components/coordinator/SearchAndFilter.jsx`
- `src/components/coordinator/MapSection.jsx`
- `src/hooks/useMap.js`

### Modal nghiệp vụ
- `src/components/coordinator/ClassifyRequestModal.jsx`
- `src/components/coordinator/CancelRequestModal.jsx`
- `src/components/coordinator/AssignMissionModal.jsx`
- `src/components/coordinator/RequestDetailModal.jsx`

### Theo dõi team
- `src/components/coordinator/TeamStatusPanel.jsx`

### Service data layer
- `src/services/rescueRequestService.js`
- `src/services/missionService.js`
- `src/services/rescueTeamService.js`
- `src/services/vehicleService.js`
- `src/services/warehouseService.js`

---

## 3) Luồng dữ liệu tổng quát

## 3.1 Load dashboard
`CoordinatorDashboard.jsx` gọi song song 3 API:

- `rescueRequestService.getAllRequests()`
- `missionService.getAllMissions()`
- `missionService.getActiveTeamMissions()`

Sau đó chuẩn hoá thành 3 state:

- `requests`: danh sách yêu cầu
- `missionByRequestId`: map requestId -> mission mới nhất
- `activeTeamRequestIds`: tập request đang có team active

> Đã tối ưu: gom logic này vào helper `fetchCoordinatorSnapshot()` để dễ review và tái sử dụng cho cả `fetchRequests()` và `refreshRequests()`.

## 3.2 Xác định stage hiển thị
`getRequestStage()` quyết định request nằm tab nào (`pending`, `accepted`, `inprogress`, `completed`, `cancelled`) dựa trên:

- `request.status`
- `mission.status` (ưu tiên hơn request khi đã có mission)
- request có team active thực sự hay chưa

Mục tiêu: tránh hiển thị sai tab khi backend cập nhật chậm giữa request và mission.

## 3.3 Render list + filter
- Lọc theo tab hiện tại
- Lọc theo tìm kiếm (`name`, `location`)
- Lọc theo loại (`all`, `rescue`, `relief`)

> Đã tối ưu: dùng trực tiếp `requestsWithMission` để filter, không tính lại `stage` nhiều lần.

---

## 4) Nghiệp vụ từng action

## 4.1 Phân loại yêu cầu
File: `ClassifyRequestModal.jsx`

- User chọn `priority` và `requestType`
- Submit gọi `rescueRequestService.classifyRequest(id, { priority, requestType })`

## 4.2 Tiếp nhận yêu cầu
File: `CoordinatorDashboard.jsx` -> `handleApproveRequest()`

- Gọi `rescueRequestService.approveRequest(requestId)`
- Thành công thì refresh dữ liệu và chuyển tab `accepted`

## 4.3 Từ chối yêu cầu
File: `CancelRequestModal.jsx` + `handleCancelRequest()`

- Modal thu `reason` (hiện API cancel chưa dùng reason)
- Gọi `rescueRequestService.cancelRequest(requestId, reason)`
- Thành công thì chuyển tab `cancelled`

## 4.4 Phân công nhiệm vụ
File: `AssignMissionModal.jsx`

Luồng tuần tự:

1. Bắt buộc chọn team -> `missionService.assignTeam()`
2. Tuỳ chọn chọn vehicle -> `missionService.assignVehicle()`
3. Tuỳ chọn chọn supplies -> `missionService.assignSupplies()` (mỗi item một lần gọi)

Thiết kế tuần tự để dễ bắt lỗi theo từng bước.

## 4.5 Xác nhận hoàn thành
File: `CoordinatorDashboard.jsx` -> `handleCompleteRequest()`

- Chỉ cho hoàn thành khi `mission.status === COMPLETED` (team đã báo cáo xong)
- Sau đó gọi `missionService.updateMissionStatus(mission.id, { status: "COMPLETED" })`

---

## 5) Bản đồ và marker

File: `useMap.js`

- Tạo marker cho từng request
- Màu/icon marker phụ thuộc `status` và `priority`
- Có popup mô tả nhanh
- Có lớp heatmap nhẹ cho request mới (`CREATED`)
- `flyToRequest(request)` dùng khi bấm nút map từ card

---

## 6) TeamStatusPanel hoạt động thế nào

File: `TeamStatusPanel.jsx`

- Load song song:
  - `rescueTeamService.getAllTeams()`
  - `missionService.getActiveTeamMissions()`
- Build map `teamMissionMap` để biết team nào đang làm mission nào
- Flatten vehicle từ mission để hiển thị xe đang dùng theo team
- Chia nhóm team theo `status`: `BUSY`, `ACTIVE`, `INACTIVE`

---

## 7) Các tối ưu đã thực hiện trong đợt này

1. **Tách helper snapshot data** trong dashboard để tránh trùng lặp logic fetch.
2. **Giảm tính toán lặp**: filter trực tiếp trên `requestsWithMission`.
3. **Dọn debug log** trong `rescueRequestService` để log sạch, dễ đọc khi review.
4. **Fix import route theo đúng case** ở `CoordinatorRoutes.jsx` để không lỗi trên môi trường Linux/CI.
5. **Bổ sung comment workflow** trong `AssignMissionModal.jsx` để dễ nắm luồng nghiệp vụ.

---

## 8) Điểm cần lưu ý khi review tiếp

1. `MapSection.jsx` đang có nút zoom/layer/location ở UI nhưng chưa gắn handler thực.
2. `CancelRequestModal` có truyền `reason` nhưng API `cancel` hiện chưa dùng lý do.
3. `AssignMissionModal.jsx` khá dài (~1200+ dòng), có thể tách nhỏ theo component con:
   - `TeamAssignmentSection`
   - `VehicleAssignmentSection`
   - `SupplyAssignmentSection`
4. Một số text hiển thị vẫn phụ thuộc mapping tạm thời từ backend (ví dụ `name`, `location` transform từ dữ liệu chưa đủ chuẩn).

---

## 9) Gợi ý thứ tự review nhanh (15-20 phút)

1. `CoordinatorDashboard.jsx` (luồng chính)
2. `rescueRequestService.js` + `missionService.js` (API call)
3. `RequestCard.jsx` (hành vi theo stage)
4. `AssignMissionModal.jsx` (luồng phân công)
5. `TeamStatusPanel.jsx` (theo dõi team/vehicle)
6. `useMap.js` (trải nghiệm bản đồ)

---

## 10) Tóm tắt ngắn

Role Coordinator hiện đã có đầy đủ flow nghiệp vụ từ tiếp nhận -> phân công -> theo dõi -> hoàn thành.
Các phần đã được tối ưu để code dễ review hơn ở tầng dashboard và service log. Nếu cần tối ưu sâu hơn, ưu tiên tách nhỏ `AssignMissionModal.jsx` vì đây là điểm phức tạp nhất hiện tại.

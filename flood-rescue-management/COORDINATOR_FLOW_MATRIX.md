# Coordinator Flow Matrix

File này là bản rút gọn, dễ review hơn theo format:

- **Flow**: luồng nghiệp vụ
- **UI Trigger**: user bấm ở đâu
- **File / Function**: code chính nằm ở đâu
- **API Call**: endpoint nào được gọi
- **Payload**: FE gửi gì lên
- **UI Effect**: sau khi thành công UI thay đổi thế nào
- **Code Ref**: dòng để mở code nhanh

> Dùng file này để review nhanh.
> Dùng `COORDINATOR_FLOW_REVIEW.md` để đọc giải thích chi tiết hơn.

---

## 1. Điều hướng vào màn Coordinator

| Mục | Nội dung |
|---|---|
| Flow | Vào dashboard của Coordinator |
| UI Trigger | User được điều hướng tới `/coordinator/dashboard` sau login/route guard |
| File / Function | `src/routes/CoordinatorRoutes.jsx` |
| API Call | Không có |
| Payload | Không có |
| UI Effect | Lazy-load `CoordinatorDashboard` với fallback `Loading...` |
| Code Ref | `src/routes/CoordinatorRoutes.jsx:1-32` |

---

## 2. Load dữ liệu ban đầu của Coordinator

| Mục | Nội dung |
|---|---|
| Flow | Tải snapshot dữ liệu cho toàn dashboard |
| UI Trigger | Page mount / polling 30s / refresh logic nội bộ |
| File / Function | `CoordinatorDashboard.jsx` → `fetchCoordinatorSnapshot`, `fetchRequests`, `refreshRequests` |
| API Call | `GET /rescue-requests`, `GET /missions`, `GET /missions/active-teams` |
| Payload | Không có body |
| UI Effect | Sidebar request được đổ dữ liệu, stats cập nhật, map render marker |
| Code Ref | `src/pages/coordinator/CoordinatorDashboard.jsx:133-186`, `248-285` |

### Ghi chú review
- `fetchRequests()` dùng cho load chính, có loading full sidebar
- `refreshRequests()` dùng sau action, không bật loading nặng
- `getAllMissions()` có cache/timeout riêng ở `missionService.js`

**Code Ref service:** `src/services/missionService.js:46-108`

---

## 3. Phân stage request vào từng tab

| Mục | Nội dung |
|---|---|
| Flow | Quyết định request nằm ở tab nào |
| UI Trigger | Xảy ra trong quá trình dựng `requestsWithMission` |
| File / Function | `CoordinatorDashboard.jsx` → `getRequestStage` |
| API Call | Không có |
| Payload | Không có |
| UI Effect | Request xuất hiện trong `pending`, `accepted`, `inprogress`, `completed`, `cancelled` |
| Code Ref | `src/pages/coordinator/CoordinatorDashboard.jsx:98-125`, `215-226` |

### Rule quan trọng
- `request COMPLETED` → tab `completed`
- `request CANCELLED` → tab `cancelled`
- `mission ASSIGNED / IN_PROGRESS / ARRIVED / COMPLETED` → tab `inprogress`
- `request IN_PROGRESS` nhưng chưa có mission rõ → tab `accepted`

---

## 4. Header, tab, stats, search

| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Mở panel theo dõi đội | Bấm nút `Theo dõi đội` | `Header.jsx` | tùy logic trong `TeamStatusPanel` | Mở panel phụ | `src/components/coordinator/Header.jsx:53-64`, `145-149` |
| Logout | Bấm avatar → `Đăng xuất` | `Header.jsx` → `handleLogout` | Không gọi API | Xóa localStorage và về `/login` | `src/components/coordinator/Header.jsx:11-15`, `127-136` |
| Đổi tab | Bấm tab | `TabBar.jsx` | Không có | Đổi `activeTab`, reset filter | `src/components/coordinator/TabBar.jsx:46-84` |
| Xem stats | Tự render theo state | `StatsCards.jsx` | Không có | Hiện số lượng từng nhóm | `src/components/coordinator/StatsCards.jsx:46-64` |
| Search/filter | Gõ text / bấm chip | `SearchAndFilter.jsx` | Không có | Lọc request list | `src/components/coordinator/SearchAndFilter.jsx:26-62`, `src/pages/coordinator/CoordinatorDashboard.jsx:407-430` |

---

## 5. Xem request mới trong list

| Mục | Nội dung |
|---|---|
| Flow | Render request card theo stage |
| UI Trigger | Tự render sau khi dữ liệu load xong |
| File / Function | `CoordinatorDashboard.jsx` render list, `RequestCard.jsx` render từng card |
| API Call | Không gọi mới ở bước render |
| Payload | Không có |
| UI Effect | Card hiển thị status, priority, time, media, actions tương ứng stage |
| Code Ref | `src/pages/coordinator/CoordinatorDashboard.jsx:455-513`, `src/components/coordinator/RequestCard.jsx:100-453` |

---

## 6. Xem chi tiết request

| Mục | Nội dung |
|---|---|
| Flow | Coordinator mở chi tiết request để xem thông tin đầy đủ |
| UI Trigger | Bấm `Xem chi tiết yêu cầu` hoặc `Xem lại chi tiết` hoặc `+N` ảnh |
| File / Function | `RequestCard.jsx` → `onDetail(request)`; `CoordinatorDashboard.jsx` → `openDetailModal`; `RequestDetailModal.jsx` |
| API Call | Không có call mới ở luồng này |
| Payload | Không có |
| UI Effect | Mở modal có phone, mô tả, vật tư, media, lightbox |
| Code Ref | `src/components/coordinator/RequestCard.jsx:250-277`, `425-446`; `src/pages/coordinator/CoordinatorDashboard.jsx:398-400`, `533-537`; `src/components/coordinator/RequestDetailModal.jsx:164-554` |

### Dữ liệu dùng để render
- `selectedRequest`
- media đã nằm sẵn trong response list request

---

## 7. Phân loại request

| Mục | Nội dung |
|---|---|
| Flow | Coordinator gán priority + requestType trước hoặc trong quá trình xử lý |
| UI Trigger | Bấm `Phân loại yêu cầu` ở card pending |
| File / Function | `RequestCard.jsx` → trigger; `CoordinatorDashboard.jsx` → `openClassifyModal`, `handleClassifyRequest`; `ClassifyRequestModal.jsx` |
| API Call | `PATCH /rescue-requests/{id}/classify` |
| Payload | `{ priority, requestType }` |
| UI Effect | Đóng modal, refresh requests, card đổi nhãn/priority nếu BE trả mới |
| Code Ref | `src/components/coordinator/RequestCard.jsx:278-284`; `src/pages/coordinator/CoordinatorDashboard.jsx:372-397`; `src/components/coordinator/ClassifyRequestModal.jsx:60-252`; `src/services/rescueRequestService.js:289-319` |

### Payload mẫu
```json
{
  "priority": "CRITICAL",
  "requestType": "RESCUE"
}
```

---

## 8. Tiếp nhận request

| Mục | Nội dung |
|---|---|
| Flow | Chuyển request từ chờ xử lý sang đã tiếp nhận |
| UI Trigger | Bấm `Tiếp nhận` ở card pending |
| File / Function | `RequestCard.jsx` → trigger; `CoordinatorDashboard.jsx` → `handleApproveRequest`; `rescueRequestService.js` → `approveRequest` |
| API Call | `PUT /rescue-requests/{id}/approve` |
| Payload | Không có body |
| UI Effect | Alert success, refresh requests, chuyển tab `accepted` |
| Code Ref | `src/components/coordinator/RequestCard.jsx:285-294`; `src/pages/coordinator/CoordinatorDashboard.jsx:287-301`; `src/services/rescueRequestService.js:351-378` |

---

## 9. Từ chối request

| Mục | Nội dung |
|---|---|
| Flow | Từ chối yêu cầu đang pending |
| UI Trigger | Bấm `Từ chối` ở card pending |
| File / Function | `RequestCard.jsx` → trigger; `CoordinatorDashboard.jsx` → `openCancelModal`, `handleCancelRequest`; `CancelRequestModal.jsx`; `rescueRequestService.js` |
| API Call | `PUT /rescue-requests/{id}/cancel` |
| Payload | FE hiện không gửi body reason |
| UI Effect | Alert success, refresh requests, chuyển tab `cancelled` |
| Code Ref | `src/components/coordinator/RequestCard.jsx:295-303`; `src/pages/coordinator/CoordinatorDashboard.jsx:353-393`; `src/components/coordinator/CancelRequestModal.jsx:3-178`; `src/services/rescueRequestService.js:380-407` |

### Ghi chú review
- Modal có textarea nhập reason
- Nhưng service hiện chưa gửi `reason` lên backend

---

## 10. Phân công nhiệm vụ tổng

| Mục | Nội dung |
|---|---|
| Flow | Coordinator gán team, vehicle, supplies cho request đã tiếp nhận |
| UI Trigger | Bấm `Phân công đội & phương tiện` ở card accepted |
| File / Function | `RequestCard.jsx` → trigger; `CoordinatorDashboard.jsx` → `openAssignModal`; `AssignMissionModal.jsx` |
| API Call | Nhiều API con, chạy tuần tự |
| Payload | Xem từng sub-flow bên dưới |
| UI Effect | Sau khi success, request được refresh và tiến dần sang `inprogress` |
| Code Ref | `src/components/coordinator/RequestCard.jsx:316-349`; `src/pages/coordinator/CoordinatorDashboard.jsx:402-405`, `538-543`; `src/components/coordinator/AssignMissionModal.jsx:47-1373` |

---

## 11. Load dữ liệu trong AssignMissionModal

| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Reset state modal | Mở modal | `AssignMissionModal.jsx` → `resetAll` | Không có | Xóa dữ liệu cũ trước khi load mới | `src/components/coordinator/AssignMissionModal.jsx:88-123` |
| Load mission hiện tại | Mở modal | `loadMission` | `GET /missions?requestId={requestId}` (+ fallback trong service) | Lấy `mission.id` thật | `src/components/coordinator/AssignMissionModal.jsx:125-130`; `src/services/missionService.js:229-288` |
| Load team available | Mở modal | `loadTeams` | `GET /rescue-teams/available` | Đổ list team | `src/components/coordinator/AssignMissionModal.jsx:132-143` |
| Load vị trí team | Sau khi load teams | `rescueTeamService.getTeamPositions` | `GET /team-positions/team/{teamId}` nhiều lần | Tính khoảng cách team tới request | `src/components/coordinator/AssignMissionModal.jsx:138-140`, `185-213` |
| Load vehicles | Mở modal | `loadVehicles` | `GET /vehicles/status/AVAILABLE` | Đổ list xe available | `src/components/coordinator/AssignMissionModal.jsx:145-156` |
| Load warehouses | Mở modal | `loadWarehouses` | `GET /warehouses` | Đổ list kho | `src/components/coordinator/AssignMissionModal.jsx:157-168` |
| Load inventory | Chọn kho | `loadInventory` | `GET /warehouses/{id}/inventory` | Đổ vật tư của kho đó | `src/components/coordinator/AssignMissionModal.jsx:170-184` |

---

## 12. Search trong AssignMissionModal

| Flow | UI Trigger | File / Function | API Call | UI Effect | Code Ref |
|---|---|---|---|---|---|
| Search team | Gõ vào ô tìm team | `filteredTeams` | Không có | Lọc team theo tên, vẫn giữ sort khoảng cách | `src/components/coordinator/AssignMissionModal.jsx:208-213` |
| Search warehouse | Gõ ô tìm kho | `filteredWarehouses` | Không có | Lọc theo địa chỉ / tên / id | `src/components/coordinator/AssignMissionModal.jsx:214-228` |
| Search vehicle | Gõ ô tìm xe | `filteredVehicles` | Không có | Lọc theo biển số / model / loại / id | `src/components/coordinator/AssignMissionModal.jsx:230-246` |
| Search inventory | Gõ ô tìm vật tư | `filteredInventory` | Không có | Lọc theo tên / loại / inventoryId | `src/components/coordinator/AssignMissionModal.jsx:248-258` |

---

## 13. Gán team

| Mục | Nội dung |
|---|---|
| Flow | Chọn một team bắt buộc để thực hiện mission |
| UI Trigger | Bấm xác nhận trong modal assign |
| File / Function | `AssignMissionModal.jsx` → `handleAssignTeam`; `missionService.js` → `assignTeam` |
| API Call | `PUT /missions/{missionId}/assign-team` |
| Payload | `{ rescueTeamId, missionRole, notes }` |
| UI Effect | Nếu success, refetch mission detail, đánh dấu `teamAssigned=true` |
| Code Ref | `src/components/coordinator/AssignMissionModal.jsx:286-334`; `src/services/missionService.js:307-335` |

### Payload mẫu
```json
{
  "rescueTeamId": 12,
  "missionRole": "PRIMARY",
  "notes": "Tiếp cận từ hướng Đông"
}
```

---

## 14. Gán vehicle

| Mục | Nội dung |
|---|---|
| Flow | Gán xe cho mission, bước tùy chọn |
| UI Trigger | Có selectedVehicle và bấm submit modal |
| File / Function | `AssignMissionModal.jsx` → `handleAssignVehicle`; `missionService.js` → `assignVehicle` |
| API Call | `POST /missions/{missionId}/assign-vehicle` |
| Payload | `{ vehicleId }` |
| UI Effect | Nếu success, `vehicleAssigned=true`; nếu fail hiện lỗi xe bận/maintenance/not found |
| Code Ref | `src/components/coordinator/AssignMissionModal.jsx:336-364`; `src/services/missionService.js:337-363` |

### Payload mẫu
```json
{
  "vehicleId": 25
}
```

---

## 15. Gán supplies

| Mục | Nội dung |
|---|---|
| Flow | Gán vật tư cho mission, bước tùy chọn |
| UI Trigger | Chọn item + quantity rồi submit modal |
| File / Function | `AssignMissionModal.jsx` → `handleAssignSupplies`; `missionService.js` → `assignSupplies` |
| API Call | `POST /missions/{missionId}/supplies` (1 call / item) |
| Payload | `{ inventoryId, quantity }` |
| UI Effect | Nếu success toàn bộ → `suppliesAssigned=true`; nếu lỗi → gom message lỗi theo item |
| Code Ref | `src/components/coordinator/AssignMissionModal.jsx:366-402`; `src/services/missionService.js:365-403` |

### Payload mẫu
```json
{
  "inventoryId": 101,
  "quantity": 4
}
```

---

## 16. Submit assign tổng

| Mục | Nội dung |
|---|---|
| Flow | Chạy tuần tự team → vehicle → supplies |
| UI Trigger | Bấm nút xác nhận cuối modal assign |
| File / Function | `AssignMissionModal.jsx` → `handleSubmit` |
| API Call | Nối tiếp các call assign ở trên |
| Payload | Phụ thuộc dữ liệu user chọn |
| UI Effect | Bước nào fail thì dừng, bước thành công trước đó vẫn giữ; thành công xong gọi `onSuccess` để dashboard refresh |
| Code Ref | `src/components/coordinator/AssignMissionModal.jsx:404-420` |

### Ý nghĩa review
- Dễ trace bug vì flow chạy tuần tự
- Đảm bảo lỗi step nào hiện đúng step đó

---

## 17. Theo dõi trạng thái team trên card

| Mục | Nội dung |
|---|---|
| Flow | Coordinator xem team đang ở bước nào |
| UI Trigger | Tự render khi request ở stage `inprogress` |
| File / Function | `RequestCard.jsx` |
| API Call | Không có call riêng tại bước render |
| Payload | Không có |
| UI Effect | Hiện badge mission status, note mô tả, report ngắn nếu team đã completed |
| Code Ref | `src/components/coordinator/RequestCard.jsx:43-79`, `353-410` |

### Trạng thái hiển thị
- `ASSIGNED` → Đã phân công
- `IN_PROGRESS` → Đang di chuyển
- `ARRIVED` → Đã đến nơi
- `COMPLETED` → Team đã hoàn thành

---

## 18. Mở modal xem báo cáo team

| Mục | Nội dung |
|---|---|
| Flow | Chỉ khi team đã hoàn thành, coordinator mới được xem report và chốt request |
| UI Trigger | Bấm `Team đã hoàn thành • Bấm hoàn thành` |
| File / Function | `RequestCard.jsx` → trigger; `CoordinatorDashboard.jsx` → `handleOpenCompleteModal` |
| API Call | `GET /missions/{missionId}` |
| Payload | Không có body |
| UI Effect | Mở `CompleteRequestModal`, load mission detail mới nhất |
| Code Ref | `src/components/coordinator/RequestCard.jsx:383-399`; `src/pages/coordinator/CoordinatorDashboard.jsx:303-326`; `src/services/missionService.js:110-126` |

### Rule quan trọng
- Nếu `mission.status !== COMPLETED` thì không cho mở flow complete

---

## 19. Xem report trong CompleteRequestModal

| Mục | Nội dung |
|---|---|
| Flow | Coordinator xem dữ liệu report team trước khi xác nhận hoàn thành |
| UI Trigger | Modal mở sau khi gọi `handleOpenCompleteModal` |
| File / Function | `CompleteRequestModal.jsx` |
| API Call | Không tự gọi thêm trong modal |
| Payload | Không có |
| UI Effect | Hiện mission id, status, updatedAt, số người cứu, báo cáo từ team |
| Code Ref | `src/components/coordinator/CompleteRequestModal.jsx:32-150` |

### Fallback field đang hỗ trợ
- số người cứu: `peopleRescued`, `rescuedCount`, `rescueCount`, `numberOfPeopleRescued`
- báo cáo: `summary`, `reportSummary`, `report`, `description`, `note`, `missionNote`

---

## 20. Xác nhận hoàn thành request

| Mục | Nội dung |
|---|---|
| Flow | Coordinator chốt request sau khi team đã hoàn thành mission |
| UI Trigger | Bấm `Xác nhận hoàn thành` trong complete modal |
| File / Function | `CoordinatorDashboard.jsx` → `handleConfirmCompleteRequest`; `rescueRequestService.js` → `updateRequestStatus` |
| API Call | `PUT /rescue-requests/{id}/status` |
| Payload | text/plain: `COMPLETED` |
| UI Effect | Đóng modal, refresh requests, chuyển tab `completed` |
| Code Ref | `src/pages/coordinator/CoordinatorDashboard.jsx:328-351`; `src/services/rescueRequestService.js:257-287` |

### Điểm nghiệp vụ cực quan trọng
- Team complete = complete **mission**
- Coordinator complete = complete **request**
- FE hiện đang đúng theo mô hình này

---

## 21. Bản đồ và fly-to-request

| Mục | Nội dung |
|---|---|
| Flow | Coordinator xem vị trí request trên bản đồ |
| UI Trigger | Bấm icon map / my_location trên card |
| File / Function | `useMap.js` → `flyToRequest`; `MapSection.jsx` chứa map container |
| API Call | Không gọi backend ở bước fly-to |
| Payload | Không có |
| UI Effect | Map zoom tới request, mở popup marker |
| Code Ref | `src/hooks/useMap.js:137-258`; `src/components/coordinator/MapSection.jsx:3-48`; trigger ở `src/components/coordinator/RequestCard.jsx:304-310`, `340-348`, `400-408`, `437-445` |

### Ghi chú review
- `useMap.js` import Goong top-level nên dashboard coordinator khá nặng lúc load đầu

---

## 22. Service map nhanh để review

## 22.1 `rescueRequestService.js`

| Function | API | Code Ref |
|---|---|---|
| `getAllRequests` | `GET /rescue-requests` | `src/services/rescueRequestService.js:80-124` |
| `getRequestById` | `GET /rescue-requests/{id}` | `src/services/rescueRequestService.js:229-255` |
| `updateRequestStatus` | `PUT /rescue-requests/{id}/status` | `src/services/rescueRequestService.js:257-287` |
| `classifyRequest` | `PATCH /rescue-requests/{id}/classify` | `src/services/rescueRequestService.js:289-319` |
| `approveRequest` | `PUT /rescue-requests/{id}/approve` | `src/services/rescueRequestService.js:351-378` |
| `cancelRequest` | `PUT /rescue-requests/{id}/cancel` | `src/services/rescueRequestService.js:380-407` |

## 22.2 `missionService.js`

| Function | API | Code Ref |
|---|---|---|
| `getActiveTeamMissions` | `GET /missions/active-teams` | `src/services/missionService.js:17-44` |
| `getAllMissions` | `GET /missions` | `src/services/missionService.js:46-108` |
| `getMissionById` | `GET /missions/{id}` | `src/services/missionService.js:110-126` |
| `getMissionByRequestId` | `GET /missions?requestId=...` + fallback | `src/services/missionService.js:229-288` |
| `assignTeam` | `PUT /missions/{id}/assign-team` | `src/services/missionService.js:307-335` |
| `assignVehicle` | `POST /missions/{id}/assign-vehicle` | `src/services/missionService.js:337-363` |
| `assignSupplies` | `POST /missions/{id}/supplies` | `src/services/missionService.js:365-403` |

---

## 23. Điểm review cần để ý nhanh

| Điểm | Ý nghĩa | Code Ref |
|---|---|---|
| `getRequestStage` | Quyết định tab hiển thị request | `src/pages/coordinator/CoordinatorDashboard.jsx:98-125` |
| `pickBetterMission` | Tránh mất report khi merge 2 nguồn mission | `src/pages/coordinator/CoordinatorDashboard.jsx:69-96` |
| `Cancel reason` | UI có reason nhưng service chưa gửi lên BE | `src/components/coordinator/CancelRequestModal.jsx:123-140`, `src/services/rescueRequestService.js:380-407` |
| `Complete flow` | Coordinator complete request, không complete mission lần nữa | `src/pages/coordinator/CoordinatorDashboard.jsx:303-351` |
| `Goong map import` | Một nguồn làm màn coordinator load nặng | `src/hooks/useMap.js:1-3`, `205-240` |
| `transformRescueRequest` | `name/location` đang fallback chưa thật semantic | `src/services/rescueRequestService.js:51-76` |

---

## 24. Gợi ý cách review nhanh nhất

Đọc theo thứ tự này:

1. `src/pages/coordinator/CoordinatorDashboard.jsx`
2. `src/components/coordinator/RequestCard.jsx`
3. `src/components/coordinator/AssignMissionModal.jsx`
4. `src/components/coordinator/CompleteRequestModal.jsx`
5. `src/services/rescueRequestService.js`
6. `src/services/missionService.js`
7. `src/hooks/useMap.js`

Nếu cần đọc đầy đủ giải thích, mở thêm file:

- `COORDINATOR_FLOW_REVIEW.md`

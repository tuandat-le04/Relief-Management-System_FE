# Coordinator FE Flow Review

Tài liệu này giải thích chi tiết luồng hoạt động của màn hình **Coordinator** trong FE để dễ review code.

---

## 1. Các file chính liên quan

### 1.1 Route
- `src/routes/CoordinatorRoutes.jsx`
  - Khai báo route `/coordinator/dashboard`
  - Dùng `React.lazy` + `Suspense` để lazy-load page CoordinatorDashboard
  - Code ref: `src/routes/CoordinatorRoutes.jsx:1-32`

### 1.2 Page chính
- `src/pages/coordinator/CoordinatorDashboard.jsx`
  - Đây là file trung tâm của toàn bộ luồng coordinator
  - Quản lý:
    - load dữ liệu request + mission
    - phân stage cho từng request
    - state tab/filter/search
    - mở/đóng modal
    - xử lý approve / classify / cancel / assign / complete
  - Code ref tổng:
    - helper + snapshot: `src/pages/coordinator/CoordinatorDashboard.jsx:18-186`
    - state + requestsWithMission + stats: `src/pages/coordinator/CoordinatorDashboard.jsx:188-246`
    - fetch + polling + refresh: `src/pages/coordinator/CoordinatorDashboard.jsx:248-285`
    - handlers nghiệp vụ: `src/pages/coordinator/CoordinatorDashboard.jsx:287-405`
    - filter + render list + modal: `src/pages/coordinator/CoordinatorDashboard.jsx:407-556`

### 1.3 Components UI chính
- `src/components/coordinator/Header.jsx`
- `src/components/coordinator/TabBar.jsx`
- `src/components/coordinator/StatsCards.jsx`
- `src/components/coordinator/SearchAndFilter.jsx`
- `src/components/coordinator/RequestCard.jsx`
- `src/components/coordinator/MapSection.jsx`
- `src/components/coordinator/RequestDetailModal.jsx`
- `src/components/coordinator/ClassifyRequestModal.jsx`
- `src/components/coordinator/CancelRequestModal.jsx`
- `src/components/coordinator/AssignMissionModal.jsx`
- `src/components/coordinator/CompleteRequestModal.jsx`
- `src/components/coordinator/TeamStatusPanel.jsx`

Code ref nhanh:
- `Header.jsx:1-154`
- `TabBar.jsx:1-86`
- `StatsCards.jsx:1-66`
- `SearchAndFilter.jsx:1-64`
- `RequestCard.jsx:1-453`
- `MapSection.jsx:1-48`
- `RequestDetailModal.jsx:1-554`
- `ClassifyRequestModal.jsx:1-252`
- `CancelRequestModal.jsx:1-178`
- `AssignMissionModal.jsx:1-1373`
- `CompleteRequestModal.jsx:1-150`

### 1.4 Services/API chính
- `src/services/rescueRequestService.js`
- `src/services/missionService.js`
- `src/services/rescueTeamService.js`
- `src/services/vehicleService.js`
- `src/services/warehouseService.js`

Code ref nhanh:
- `rescueRequestService.js:79-409`
- `missionService.js:16-404`

### 1.5 Hook hỗ trợ map
- `src/hooks/useMap.js`
  - Code ref: `src/hooks/useMap.js:1-261`

---

## 2. Mục tiêu nghiệp vụ của Coordinator

Coordinator đang quản lý một pipeline chính:

1. Nhìn thấy request mới từ citizen
2. Xem chi tiết request
3. Phân loại request (priority + requestType)
4. Tiếp nhận request
5. Phân công team / phương tiện / vật tư cho mission
6. Theo dõi team cập nhật trạng thái
7. Xem report từ team
8. Xác nhận hoàn thành request
9. Hoặc từ chối request

---

## 3. Route và entry của Coordinator

## File: `src/routes/CoordinatorRoutes.jsx`

**Code ref:** `src/routes/CoordinatorRoutes.jsx:1-32`

```jsx
const CoordinatorDashboard = lazy(() =>
  import("../pages/coordinator/CoordinatorDashboard")
);
```

### Ý nghĩa
- Dashboard của Coordinator được lazy-load
- Lợi ích: giảm tải bundle ban đầu khi user chưa vào role coordinator

### Route hiện có
- `/coordinator/dashboard`

---

## 4. Kiến trúc tổng thể của `CoordinatorDashboard.jsx`

**Code ref tổng:** `src/pages/coordinator/CoordinatorDashboard.jsx:18-589`

Đây là file quan trọng nhất để review.

Nó có 5 nhóm logic lớn:

1. **Helper functions xử lý dữ liệu mission/request**
2. **State điều khiển UI + modal**
3. **Load snapshot từ API**
4. **Handlers cho các action nghiệp vụ**
5. **Render layout: sidebar trái + bản đồ phải + modal**

---

## 5. Các helper quan trọng trong `CoordinatorDashboard.jsx`

## 5.1 `getMissionRequestId(mission)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:18-19`

```jsx
const getMissionRequestId = (mission) =>
  mission?.requestId ?? mission?.requestID ?? mission?.request?.id ?? null;
```

### Mục đích
- Chuẩn hóa requestId từ mission
- Vì BE có thể trả field theo nhiều kiểu (`requestId`, `requestID`, nested `request.id`)

### Ý nghĩa review
- Đây là defensive code để FE chịu được dữ liệu không đồng nhất

---

## 5.2 `getMissionUpdatedTime(mission)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:21-30`

```jsx
const raw = mission?.updatedAt ?? mission?.endTime ?? mission?.startTime ?? mission?.createdAt;
```

### Mục đích
- Lấy mốc thời gian đại diện cho mission
- Dùng để chọn mission mới nhất nếu có nhiều mission liên quan một request

---

## 5.3 `buildLatestMissionMap(missions)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:32-52`

### Output
Trả về object dạng:

```js
{
  [requestId]: latestMission
}
```

### Ý nghĩa
- Coordinator list request, nhưng cần biết mission mới nhất của từng request
- Hàm này giúp gắn mission tương ứng vào mỗi request card

---

## 5.4 `buildActiveRequestIdSet(activeRows)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:54-67`

### Output
`Set<string>` chứa các `requestId` đang có active team

### Dùng để làm gì
- Nếu request đang `IN_PROGRESS` nhưng mission chưa map rõ ràng, vẫn có thể đẩy request vào tab `inprogress`

---

## 5.5 `pickBetterMission(primary, secondary)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:69-96`

### Mục đích
- Merge mission lấy từ 2 nguồn API:
  - `/missions`
  - `/missions/active-teams`

### Tại sao cần merge
- `/missions` thường đầy đủ dữ liệu hơn
- `/missions/active-teams` thường realtime hơn
- Có trường hợp một nguồn thiếu `peopleRescued`, `summary`

### Logic chính
- ưu tiên mission có `updatedAt` mới hơn
- backfill các field report:
  - `peopleRescued`
  - `summary`
  - `obstacles`

### Ý nghĩa review
- Đây là chỗ xử lý bug rất quan trọng để coordinator không bị mất report team

---

## 5.6 `getRequestStage(request, mission, isActiveTeamAssigned)`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:98-125`

Hàm này quyết định request sẽ nằm ở tab nào trong UI.

### Rule hiện tại
- `request.status === CANCELLED` -> `cancelled`
- `request.status === COMPLETED` -> `completed`
- `mission.status === COMPLETED` -> vẫn là `inprogress`
- `mission.status === IN_PROGRESS | ARRIVED | ASSIGNED` -> `inprogress`
- `request.status === PENDING` -> `pending`
- `request.status === IN_PROGRESS`:
  - nếu có active team -> `inprogress`
  - nếu chưa -> `accepted`

### Ý nghĩa nghiệp vụ
- Team hoàn thành mission chưa đồng nghĩa request hoàn thành
- Coordinator còn phải xác nhận bước cuối

### Đây là một rule rất quan trọng
- `mission COMPLETED` nhưng `request chưa COMPLETED` => UI vẫn giữ ở tab `Đang xử lý`

---

## 6. Luồng load dữ liệu của Coordinator

## 6.1 `fetchCoordinatorSnapshot()`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:133-186`

### API được gọi song song

```js
Promise.all([
  rescueRequestService.getAllRequests(),
  missionService.getAllMissions(),
  missionService.getActiveTeamMissions(),
])
```

### 3 nguồn dữ liệu
1. **Request list**
   - `GET /rescue-requests`
2. **Toàn bộ mission**
   - `GET /missions`
3. **Team đang active**
   - `GET /missions/active-teams`

### Output chuẩn hóa

```js
{
  success,
  error,
  requests,
  missionMap,
  activeRequestIds,
}
```

### Ý nghĩa
- Coordinator chỉ cần gọi 1 helper để lấy đủ snapshot cho toàn màn hình

---

## 6.2 `fetchRequests()`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:248-269`

### Vai trò
- Load dữ liệu chính khi vào màn hình
- bật loading full màn hình sidebar

### Flow
1. `setLoading(true)`
2. gọi `fetchCoordinatorSnapshot()`
3. nếu success:
   - `setRequests(...)`
   - `setMissionByRequestId(...)`
   - `setActiveTeamRequestIds(...)`
4. nếu lỗi: `setError(...)`
5. `setLoading(false)`

---

## 6.3 Polling

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:271-275`

```jsx
useEffect(() => {
  fetchRequests();
  const interval = setInterval(fetchRequests, 30000);
  return () => clearInterval(interval);
}, []);
```

### Ý nghĩa
- vào màn hình: load ngay
- sau đó 30 giây tự refresh 1 lần

### Tác động UI
- giúp coordinator thấy team/status update tương đối realtime

---

## 6.4 `refreshRequests()`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:277-285`

### Khác gì với `fetchRequests()`
- `refreshRequests()` không bật loading full màn hình
- chỉ refresh dữ liệu nhẹ sau một action thành công

### Các chỗ đang dùng
- approve request
- cancel request
- classify request
- complete request
- assign mission modal success

---

## 7. State chính trong CoordinatorDashboard

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:188-210`

## 7.1 State điều khiển UI chung
- `activeTab`
- `activeFilter`
- `searchQuery`

### Vai trò
- điều khiển tab hiện tại
- filter cứu hộ / cứu trợ
- search theo tên / vị trí

---

## 7.2 State dữ liệu
- `requests`
- `missionByRequestId`
- `activeTeamRequestIds`
- `loading`
- `error`

### Vai trò
- `requests`: toàn bộ request đã transform từ API
- `missionByRequestId`: map request -> mission mới nhất
- `activeTeamRequestIds`: request nào đang có team active

---

## 7.3 State modal
- `cancelModalOpen`
- `classifyModalOpen`
- `detailModalOpen`
- `assignModalOpen`
- `completeModalOpen`
- `selectedMissionForComplete`
- `loadingCompleteMission`
- `confirmingComplete`
- `selectedRequest`

### Ý nghĩa
- dashboard dùng nhiều modal nhưng chỉ có một `selectedRequest` dùng chung
- khi mở modal nào thì gán request hiện tại vào `selectedRequest`

---

## 8. Dữ liệu tính toán cho list

## 8.1 `requestsWithMission`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:215-226`

```jsx
const requestsWithMission = useMemo(() =>
  requests.map((request) => {
    const mission = missionByRequestId[String(request.id)] ?? null;
    const isActiveTeamAssigned = activeTeamRequestIds.has(String(request.id));
    const stage = getRequestStage(request, mission, isActiveTeamAssigned);
    return { ...request, mission, stage };
  }),
...
)
```

### Mục đích
- mỗi request được enrich thêm:
  - mission
  - stage

### Ý nghĩa review
- Từ đây trở đi UI list không cần tự tính lại stage nhiều lần

---

## 8.2 `stats`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:228-246`

### Dùng cho component `StatsCards`
- `emergency`
- `rescue`
- `relief`
- `accepted`
- `inProgress`
- `completed`
- `cancelled`

### Lưu ý
- `accepted` và `inProgress` dùng `requestsWithMission`
- `completed/cancelled` đọc trực tiếp từ request.status

---

## 8.3 `filteredRequests`

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:407-430`

### Điều kiện lọc
1. Lọc theo tab (`pending/accepted/inprogress/completed/cancelled`)
2. Lọc theo search:
   - `request.name`
   - `request.location`
3. Lọc theo filter:
   - all
   - rescue
   - relief

### Ý nghĩa
- UI sidebar chỉ render request khớp tab + filter + search

---

## 9. Luồng nghiệp vụ 1: Xem request mới

**Code ref chính:**
- render list: `src/pages/coordinator/CoordinatorDashboard.jsx:432-513`
- card UI chung: `src/components/coordinator/RequestCard.jsx:100-266`
- tab + filter: `src/components/coordinator/TabBar.jsx:46-84`, `src/components/coordinator/SearchAndFilter.jsx:26-62`

### UI liên quan
- `TabBar.jsx`
- `StatsCards.jsx`
- `SearchAndFilter.jsx`
- `RequestCard.jsx`

### Cách hoạt động
1. Dashboard load requests
2. `getRequestStage()` đưa request mới vào tab `pending`
3. `TabBar` hiển thị số lượng từng nhóm
4. `SearchAndFilter` cho phép search + lọc rescue/relief
5. `RequestCard` render card theo stage

---

## 10. Luồng nghiệp vụ 2: Xem chi tiết request

**Code ref chính:**
- opener: `src/pages/coordinator/CoordinatorDashboard.jsx:398-400`
- modal mount: `src/pages/coordinator/CoordinatorDashboard.jsx:533-537`
- modal detail: `src/components/coordinator/RequestDetailModal.jsx:164-554`

## 10.1 Trigger UI
Trong `RequestCard.jsx`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:268-277`, `425-446`

```jsx
onClick={() => onDetail(request)}
```

### Khi nào xuất hiện
- tab pending
- tab completed
- thumbnail `+N` cũng mở detail modal

## 10.2 Dashboard mở modal

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:398-400`

```jsx
const openDetailModal = (request) => {
  setSelectedRequest(request);
  setDetailModalOpen(true);
};
```

## 10.3 Modal chi tiết
File: `RequestDetailModal.jsx`

**Code ref:**
- setup/lightbox: `src/components/coordinator/RequestDetailModal.jsx:164-320`
- body thông tin request: `src/components/coordinator/RequestDetailModal.jsx:322-487`

### Hiển thị gì
- thông tin người gửi
- phone
- loại yêu cầu
- mức ưu tiên
- mô tả tình huống
- vật tư yêu cầu (đã format tiếng Việt)
- media ảnh/video
- lightbox để xem media lớn

### Không call API thêm
- Modal đang dùng luôn dữ liệu `selectedRequest`
- Media đã đi kèm sẵn từ list request

---

## 11. Luồng nghiệp vụ 3: Phân loại request

**Code ref chính:**
- trigger ở card: `src/components/coordinator/RequestCard.jsx:278-284`
- handler dashboard: `src/pages/coordinator/CoordinatorDashboard.jsx:372-387`
- modal opener: `src/pages/coordinator/CoordinatorDashboard.jsx:394-397`
- modal classify: `src/components/coordinator/ClassifyRequestModal.jsx:60-252`
- service API: `src/services/rescueRequestService.js:289-319`

## 11.1 Trigger UI
Trong `RequestCard.jsx` tab `pending`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:278-284`

```jsx
onClick={() => onClassify(request)}
```

## 11.2 Dashboard mở modal

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:394-397`

```jsx
const openClassifyModal = (request) => {
  setSelectedRequest(request);
  setClassifyModalOpen(true);
};
```

## 11.3 Modal classify
File: `ClassifyRequestModal.jsx`

**Code ref:** `src/components/coordinator/ClassifyRequestModal.jsx:60-252`

### State trong modal
- `priority`
- `requestType`
- `isSubmitting`

### Khi mở modal
`useEffect` lấy giá trị mặc định từ `requestInfo`

### API call khi bấm lưu
Dashboard gọi:

```jsx
rescueRequestService.classifyRequest(selectedRequest.id, {
  priority,
  requestType,
})
```

### API thực tế
- `PATCH /rescue-requests/{id}/classify`

### Body gửi lên

```json
{
  "priority": "CRITICAL | HIGH | MEDIUM | NORMAL | LOW",
  "requestType": "RESCUE | RELIEF | OTHER"
}
```

### Sau khi thành công
- `refreshRequests()`

---

## 12. Luồng nghiệp vụ 4: Tiếp nhận request

**Code ref chính:**
- trigger ở card: `src/components/coordinator/RequestCard.jsx:285-311`
- handler dashboard: `src/pages/coordinator/CoordinatorDashboard.jsx:287-301`
- service API: `src/services/rescueRequestService.js:351-378`

## 12.1 Trigger UI
Trong `RequestCard.jsx` tab `pending`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:285-294`

```jsx
onClick={() => onApprove(request.id)}
```

## 12.2 Handler

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:287-301`

```jsx
const result = await rescueRequestService.approveRequest(requestId);
```

### API thực tế
- `PUT /rescue-requests/{id}/approve`

### Sau khi success
- hiện alert success
- `refreshRequests()`
- chuyển tab sang `accepted`

### Ý nghĩa nghiệp vụ
- request được nhận xử lý
- chưa chắc đã có team
- vẫn cần bước assign mission/team/vehicle/supplies

---

## 13. Luồng nghiệp vụ 5: Từ chối request

**Code ref chính:**
- trigger ở card: `src/components/coordinator/RequestCard.jsx:295-303`
- opener dashboard: `src/pages/coordinator/CoordinatorDashboard.jsx:390-393`
- handler dashboard: `src/pages/coordinator/CoordinatorDashboard.jsx:353-370`
- modal cancel: `src/components/coordinator/CancelRequestModal.jsx:3-178`
- service API: `src/services/rescueRequestService.js:380-407`

## 13.1 Trigger UI
Trong `RequestCard.jsx` tab `pending`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:295-303`

```jsx
onClick={() => onCancel(request)}
```

## 13.2 Modal
File: `CancelRequestModal.jsx`

**Code ref:**
- submit/close: `src/components/coordinator/CancelRequestModal.jsx:7-22`
- UI modal: `src/components/coordinator/CancelRequestModal.jsx:24-175`

### UI
- hiển thị request info
- warning không thể hoàn tác
- textarea nhập lý do từ chối

### Lưu ý code
- hiện tại `reason` chỉ truyền vào callback FE
- nhưng API BE đang được gọi **không gửi reason**

## 13.3 API call thực tế

**Code ref:**
- dashboard handler: `src/pages/coordinator/CoordinatorDashboard.jsx:353-370`
- service: `src/services/rescueRequestService.js:380-407`

```jsx
rescueRequestService.cancelRequest(selectedRequest.id, reason)
```

Trong service:

```jsx
api.put(`/rescue-requests/${requestId}/cancel`)
```

### API thực tế
- `PUT /rescue-requests/{id}/cancel`

### Sau khi success
- alert success
- `refreshRequests()`
- chuyển tab `cancelled`

### Nhận xét review
- UI có lý do từ chối nhưng service chưa gửi lý do đó vào BE
- đây là điểm cần ghi nhớ khi review nghiệp vụ

---

## 14. Luồng nghiệp vụ 6: Phân công nhiệm vụ

**Code ref chính:**
- trigger ở card accepted: `src/components/coordinator/RequestCard.jsx:316-349`
- opener dashboard: `src/pages/coordinator/CoordinatorDashboard.jsx:402-405`
- modal assign: `src/components/coordinator/AssignMissionModal.jsx:47-1373`
- mission service assign APIs: `src/services/missionService.js:307-403`

Đây là luồng phức tạp nhất của Coordinator.

## 14.1 Trigger UI
Trong `RequestCard.jsx`, stage `accepted`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:316-349`

```jsx
onClick={() => onAssign && onAssign(request)}
```

## 14.2 Dashboard mở modal

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:402-405`

```jsx
const openAssignModal = (request) => {
  setSelectedRequest(request);
  setAssignModalOpen(true);
};
```

## 14.3 Modal chính
File: `AssignMissionModal.jsx`

**Code ref:**
- state + load on open: `src/components/coordinator/AssignMissionModal.jsx:47-184`
- tính khoảng cách + search team/warehouse/vehicle/inventory: `src/components/coordinator/AssignMissionModal.jsx:185-258`
- assign handlers team/vehicle/supplies: `src/components/coordinator/AssignMissionModal.jsx:281-402`
- submit tổng: `src/components/coordinator/AssignMissionModal.jsx:404-420`

### Mục tiêu modal
Thực hiện tuần tự 3 phần:
1. Chọn đội cứu hộ
2. Gán phương tiện
3. Gán vật tư

### Khi mở modal

```jsx
if (isOpen && request) {
  resetAll();
  loadMission();
  loadTeams();
  loadVehicles();
  loadWarehouses();
}
```

### Nghĩa là modal sẽ gọi 4 nhóm dữ liệu:
1. mission theo request
2. danh sách team available + vị trí team
3. danh sách xe AVAILABLE
4. danh sách kho

---

## 14.4 Load mission hiện tại

**Code ref:** `src/components/coordinator/AssignMissionModal.jsx:125-130`

```jsx
const result = await missionService.getMissionByRequestId(request.id);
```

### API dùng
- `GET /missions?requestId={requestId}`
- nếu BE không filter đúng, service fallback về `GET /missions` rồi filter client-side

### Mục đích
- lấy mission.id thật
- tránh nhầm giữa `request.id` và `mission.id`

---

## 14.5 Load team

**Code ref:** `src/components/coordinator/AssignMissionModal.jsx:132-143`, `185-213`

```jsx
const result = await rescueTeamService.getAvailableTeams();
const positions = await rescueTeamService.getTeamPositions(result.data);
```

### API dùng
- `GET /rescue-teams/available`
- `GET /team-positions/team/{rescueTeamId}` lặp cho từng team

### UI logic
- tính khoảng cách từ request đến team bằng `haversineDistance`
- sort team gần nhất lên trước
- có ô search team

### Trường chọn thêm
- `missionRole` (`PRIMARY`, `SUPPORT`, `BACKUP`)
- `teamNotes`

---

## 14.6 Load vehicle

**Code ref:** `src/components/coordinator/AssignMissionModal.jsx:145-156`, `230-246`

```jsx
const result = await vehicleService.getVehiclesByStatus("AVAILABLE");
```

### API dùng
- `GET /vehicles/status/AVAILABLE`

### UI logic
- có search theo biển số, model, type, id
- vehicle là optional

---

## 14.7 Load warehouse và inventory

**Code ref:** `src/components/coordinator/AssignMissionModal.jsx:157-184`, `214-258`

### API dùng
- `GET /warehouses`
- `GET /warehouses/{id}/inventory`

### UI logic
- search kho theo tên / địa chỉ / id
- search inventory theo tên / loại / id
- chọn số lượng cho từng item

---

## 14.8 Submit assign tổng

**Code ref:** `src/components/coordinator/AssignMissionModal.jsx:404-420`

Trong `AssignMissionModal.jsx`:

```jsx
const handleSubmit = async () => {
  const teamOk = await handleAssignTeam();
  if (!teamOk) return;
  if (selectedVehicle) {
    const vehicleOk = await handleAssignVehicle();
    if (!vehicleOk) return;
  }
  if (Object.keys(selectedItems).length > 0) {
    await handleAssignSupplies();
  }
}
```

### Ý nghĩa
- chạy tuần tự
- step nào fail thì dừng luôn
- dễ biết lỗi nằm ở team / vehicle / supplies

---

## 14.9 API: gán team

**Code ref:**
- modal handler: `src/components/coordinator/AssignMissionModal.jsx:286-334`
- service: `src/services/missionService.js:307-335`

```jsx
missionService.assignTeam(missionId, {
  rescueTeamId: selectedTeam.id,
  missionRole,
  notes: teamNotes || undefined,
})
```

### API thực tế
- `PUT /missions/{missionId}/assign-team`

### Body gửi

```json
{
  "rescueTeamId": 123,
  "missionRole": "PRIMARY",
  "notes": "..."
}
```

### Sau khi thành công
- gọi lại `GET /missions/{missionId}` để lấy mission mới
- `setTeamAssigned(true)`

---

## 14.10 API: gán vehicle

**Code ref:**
- modal handler: `src/components/coordinator/AssignMissionModal.jsx:336-364`
- service: `src/services/missionService.js:337-363`

```jsx
missionService.assignVehicle(missionId, selectedVehicle.id)
```

### API thực tế
- `POST /missions/{missionId}/assign-vehicle`

### Body gửi

```json
{
  "vehicleId": 456
}
```

### Lưu ý
- backend tự đổi trạng thái xe sang `IN_USE`

---

## 14.11 API: gán supplies

**Code ref:**
- modal handler: `src/components/coordinator/AssignMissionModal.jsx:366-402`
- service: `src/services/missionService.js:365-403`

Với mỗi item được chọn:

```jsx
missionService.assignSupplies(missionId, {
  inventoryId: item.inventoryId,
  quantity: item.qty,
})
```

### API thực tế
- `POST /missions/{missionId}/supplies`

### Body gửi

```json
{
  "inventoryId": 789,
  "quantity": 5
}
```

### Lưu ý
- FE loop từng item một request riêng
- nếu một item fail thì gom message lỗi hiển thị lại cho user
- backend sẽ trừ tồn kho thật

---

## 14.12 Sau khi assign xong
- modal sẽ gọi `onSuccess`
- dashboard `refreshRequests()`
- request sẽ dần chuyển sang stage `inprogress` khi mission ở trạng thái `ASSIGNED/IN_PROGRESS/...`

---

## 15. Luồng nghiệp vụ 7: Theo dõi team đang xử lý

**Code ref chính:**
- stage inprogress card: `src/components/coordinator/RequestCard.jsx:353-410`
- mission status mapping: `src/components/coordinator/RequestCard.jsx:43-79`
- mission snapshot merge: `src/pages/coordinator/CoordinatorDashboard.jsx:133-186`

## 15.1 UI hiển thị ở đâu
Trong `RequestCard.jsx`, khi stage = `inprogress`

**Code ref:** `src/components/coordinator/RequestCard.jsx:353-410`

### Hiển thị
- badge trạng thái mission
- note giải thích trạng thái
- nếu teamDone (`mission.status === COMPLETED`) thì hiện:
  - số người cứu được
  - ghi chú team (`mission.summary`)

### Mapping trạng thái mission
Trong `MISSION_STATUS_UI`:
- `PENDING` -> Chờ khởi động
- `ASSIGNED` -> Đã phân công
- `IN_PROGRESS` -> Đang di chuyển
- `ARRIVED` -> Đã đến nơi
- `COMPLETED` -> Team đã hoàn thành
- `CANCELLED` -> Đã hủy

### Ý nghĩa
- RequestCard chính là nơi coordinator theo dõi nhanh trạng thái từng nhiệm vụ

---

## 16. Luồng nghiệp vụ 8: Xem report team và hoàn thành request

**Code ref chính:**
- complete trigger ở card: `src/components/coordinator/RequestCard.jsx:383-399`
- open modal handler: `src/pages/coordinator/CoordinatorDashboard.jsx:303-326`
- confirm complete handler: `src/pages/coordinator/CoordinatorDashboard.jsx:328-351`
- modal complete: `src/components/coordinator/CompleteRequestModal.jsx:32-150`
- service update request status: `src/services/rescueRequestService.js:257-287`
- service get mission detail: `src/services/missionService.js:110-126`

## 16.1 Trigger UI
Trong `RequestCard.jsx` stage `inprogress`:

**Code ref:** `src/components/coordinator/RequestCard.jsx:383-399`

```jsx
onClick={() => onComplete && onComplete(request.id)}
disabled={!teamDone}
```

### Rule
- chỉ cho bấm khi `mission.status === COMPLETED`

---

## 16.2 Dashboard mở complete modal

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:303-326`

```jsx
const handleOpenCompleteModal = async (requestId) => {
  const mission = missionByRequestId[String(requestId)] ?? null;
  if (!mission || mission.status !== "COMPLETED") return;

  setSelectedRequest(req || null);
  setSelectedMissionForComplete(mission);
  setCompleteModalOpen(true);
  setLoadingCompleteMission(true);

  const detailRes = await missionService.getMissionById(mission.id);
  if (detailRes.success && detailRes.data) {
    setSelectedMissionForComplete(detailRes.data);
  }
}
```

### API dùng
- `GET /missions/{missionId}`

### Mục đích
- lấy mission detail mới nhất để xem report team

---

## 16.3 Modal report
File: `CompleteRequestModal.jsx`

**Code ref:** `src/components/coordinator/CompleteRequestModal.jsx:32-150`

### Hiển thị
- mission id
- mission status
- thời gian cập nhật
- số người đã cứu
- báo cáo từ team

### Cách modal đọc field
- số người cứu:
  - `peopleRescued`
  - `rescuedCount`
  - `rescueCount`
  - `numberOfPeopleRescued`
- báo cáo:
  - `summary`
  - `reportSummary`
  - `report`
  - `description`
  - `note`
  - `missionNote`

### Ý nghĩa
- modal này đang cố chịu được nhiều kiểu response field từ backend

---

## 16.4 Xác nhận hoàn thành

**Code ref:** `src/pages/coordinator/CoordinatorDashboard.jsx:328-351`

```jsx
const result = await rescueRequestService.updateRequestStatus(
  selectedRequest.id,
  "COMPLETED",
);
```

### API thực tế
- `PUT /rescue-requests/{id}/status`

### Body gửi
Text/plain:

```text
COMPLETED
```

### Điểm nghiệp vụ quan trọng
- Coordinator **không** patch mission sang COMPLETED lần nữa
- Team là bên hoàn thành mission
- Coordinator là bên chốt **request nghiệp vụ**

### Sau khi success
- đóng modal
- refresh data
- chuyển tab `completed`

---

## 17. Map và tương tác bản đồ

## File: `src/hooks/useMap.js`

**Code ref:**
- marker/popup builders: `src/hooks/useMap.js:5-135`
- hook chính + init map: `src/hooks/useMap.js:137-240`
- flyToRequest: `src/hooks/useMap.js:242-258`

### Vai trò
- khởi tạo map Goong
- tạo marker cho từng request
- popup thông tin request
- heatmap nhẹ cho request mới
- hỗ trợ `flyToRequest(request)`

### Cách dùng ở Dashboard

```jsx
const { mapRef, flyToRequest } = useMap(requests);
```

### UI liên quan
- `MapSection.jsx` chỉ là container chứa `mapRef`
- logic map thực sự nằm ở `useMap.js`

### Khi user bấm nút map trên card
- Dashboard truyền `flyToRequest` xuống `RequestCard`
- `RequestCard` gọi `onFlyTo(request)`
- map zoom tới `request.coordinates` và mở popup tương ứng

---

## 18. Header và panel phụ

## File: `Header.jsx`

**Code ref:** `src/components/coordinator/Header.jsx:6-152`

### Chức năng
- branding
- nút mở `TeamStatusPanel`
- menu user
- logout

### Lưu ý review
- logout hiện xóa localStorage trực tiếp (`token`, `user`)
- chưa dùng `authService.logout()` chung

---

## 19. Component UI phụ nhưng quan trọng

## 19.1 `TabBar.jsx`
- Code ref: `src/components/coordinator/TabBar.jsx:3-84`
- hiển thị 5 tab:
  - pending
  - accepted
  - inprogress
  - completed
  - cancelled
- mỗi tab có count từ `stats`
- khi đổi tab sẽ reset `activeFilter = all`

## 19.2 `StatsCards.jsx`
- Code ref: `src/components/coordinator/StatsCards.jsx:3-64`
- hiển thị quick metrics dưới tab bar

## 19.3 `SearchAndFilter.jsx`
- Code ref: `src/components/coordinator/SearchAndFilter.jsx:3-62`
- search text
- filter chip `all/rescue/relief`

## 19.4 `MapSection.jsx`
- Code ref: `src/components/coordinator/MapSection.jsx:3-48`
- khung chứa map bên phải
- có legend tĩnh

---

## 20. Tổng hợp API Coordinator đang dùng

**Code ref service:**
- request service: `src/services/rescueRequestService.js:79-409`
- mission service: `src/services/missionService.js:16-404`

## 20.1 Request APIs
- `GET /rescue-requests`
- `GET /rescue-requests/{id}` (ít dùng ở coordinator flow hiện tại)
- `PUT /rescue-requests/{id}/approve`
- `PUT /rescue-requests/{id}/cancel`
- `PATCH /rescue-requests/{id}/classify`
- `PUT /rescue-requests/{id}/status`

## 20.2 Mission APIs
- `GET /missions`
- `GET /missions/{id}`
- `GET /missions/active-teams`
- `GET /missions?requestId={requestId}`
- `PUT /missions/{id}/assign-team`
- `POST /missions/{id}/assign-vehicle`
- `POST /missions/{id}/supplies`

## 20.3 Team / Vehicle / Warehouse APIs
- `GET /rescue-teams/available`
- `GET /team-positions/team/{teamId}`
- `GET /vehicles/status/AVAILABLE`
- `GET /warehouses`
- `GET /warehouses/{id}/inventory`

---

## 21. Coordinator UI theo từng stage

## 21.1 Pending
Hiện các action:
- Xem chi tiết
- Phân loại
- Tiếp nhận
- Từ chối
- Xem trên bản đồ

## 21.2 Accepted
Hiện các action:
- Phân công đội & phương tiện
- Xem trên bản đồ

## 21.3 In Progress
Hiện các action:
- xem trạng thái team
- nếu team complete -> nút hoàn thành bật
- xem trên bản đồ

## 21.4 Completed
Hiện các action:
- xem lại chi tiết
- xem trên bản đồ

## 21.5 Cancelled
Hiện message thông báo request đã bị từ chối

---

## 22. Những điểm cần chú ý khi review code

**Code ref quan trọng:**
- stage logic: `src/pages/coordinator/CoordinatorDashboard.jsx:98-125`
- snapshot merge: `src/pages/coordinator/CoordinatorDashboard.jsx:133-186`
- cancel modal reason nhưng service không gửi: `src/components/coordinator/CancelRequestModal.jsx:123-140`, `src/services/rescueRequestService.js:380-407`
- map init nặng: `src/hooks/useMap.js:205-240`
- logout localStorage trực tiếp: `src/components/coordinator/Header.jsx:11-15`
- transform request data: `src/services/rescueRequestService.js:51-76`

## 22.1 `request.status` và `mission.status` là 2 lớp khác nhau
- `mission.status`: tiến độ team
- `request.status`: trạng thái nghiệp vụ cuối cùng

Coordinator flow hiện đang đi theo mô hình này.

## 22.2 `mission COMPLETED` chưa đẩy request sang completed ngay
- phải chờ coordinator xác nhận

## 22.3 `CancelRequestModal` có nhập lý do nhưng service chưa gửi reason lên backend

## 22.4 `useMap.js` import Goong top-level
- đây là một phần gây nặng khi load Coordinator dashboard

## 22.5 `Header.jsx` logout trực tiếp bằng localStorage
- logic chưa gom về service auth chung

## 22.6 `rescueRequestService.transformRescueRequest`
- `name` đang fallback từ `phone`
- `location` đang fallback từ `description`
- nghĩa là dữ liệu request hiện vẫn chưa thật sự “semantic” hoàn toàn

---

## 23. Cách review nhanh theo trình tự

Nếu muốn review Coordinator dễ nhất, đọc theo thứ tự này:

1. `src/routes/CoordinatorRoutes.jsx`
2. `src/pages/coordinator/CoordinatorDashboard.jsx`
3. `src/components/coordinator/RequestCard.jsx`
4. `src/components/coordinator/AssignMissionModal.jsx`
5. `src/components/coordinator/CompleteRequestModal.jsx`
6. `src/components/coordinator/RequestDetailModal.jsx`
7. `src/services/rescueRequestService.js`
8. `src/services/missionService.js`
9. `src/hooks/useMap.js`

---

## 24. Kết luận ngắn

Coordinator FE hiện tại được tổ chức theo mô hình khá rõ:
- Dashboard trung tâm điều phối state
- Card hiển thị action theo stage
- Modal xử lý nghiệp vụ cụ thể
- Service tách riêng API
- Mission và request được tách thành 2 tầng trạng thái

Nếu review để kiểm tra nghiệp vụ, nên tập trung nhất vào 4 điểm:

1. `getRequestStage()`
2. `fetchCoordinatorSnapshot()`
3. `AssignMissionModal.handleSubmit()`
4. `handleOpenCompleteModal()` + `handleConfirmCompleteRequest()`

-- Script SQL để insert roles vào database
-- Chạy script này trong MySQL/PostgreSQL trước khi đăng ký user

-- Xóa dữ liệu cũ nếu có (optional)
-- DELETE FROM roles;

-- Insert các roles cần thiết
INSERT INTO roles (id, name) VALUES 
(1, 'CITIZEN'),
(2, 'RESCUE_COORDINATOR'),
(3, 'MANAGER'),
(4, 'ADMIN'),
(5, 'RESCUE_TEAM_MEMBER');

-- Kiểm tra
SELECT * FROM roles;

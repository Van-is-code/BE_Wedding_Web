# BE Wedding Web API

Backend API cho hệ thống thiệp cưới, tổ chức theo mô hình MVC:
- `controllers`: chỉ nhận request/response và gọi service
- `services`: chứa logic CRUD
- `models`: map đúng theo `database.sql`
- `routes`: cung cấp endpoint REST CRUD

## Công nghệ
- Node.js + Express
- Sequelize + PostgreSQL
- CommonJS

## Chạy dự án
1. Cài package:
   - `npm install`
2. Cấu hình `.env` theo môi trường của bạn
3. Chạy server:
   - `npm run dev`
   - hoặc `npm start`

Server mặc định: `http://localhost:3000`

## API Docs (Admin only)
- Login page: `http://localhost:3000/api-docs`
- Swagger UI (sau khi login admin): `http://localhost:3000/api-docs/ui`

## API CRUD
Base URL: `http://localhost:3000/api`

Mỗi resource có đầy đủ endpoint:
- `GET /resource` (list)
- `GET /resource/:id` (detail)
- `POST /resource` (create)
- `PUT /resource/:id` (update toàn bộ)
- `PATCH /resource/:id` (update một phần)
- `DELETE /resource/:id` (delete)

### Danh sách resource
- Users: `/users`
- Invitation Templates: `/invitation-templates`
- Invitations: `/invitations`
- Invitation Images: `/invitation-images`
- Private Invitations: `/private-invitations`
- Guests: `/guests`
- Messages Checkins: `/messages-checkins`
- Grooms: `/grooms`
- Brides: `/brides`

### Alias theo tên bảng SQL
Ngoài endpoint chính phía trên, hệ thống cũng hỗ trợ alias theo snake_case/singular:
- `/user`, `/invitation`, `/invitation_templates`, `/private_invitation`, `/invitation_images`, `/guest`, `/messages_checkins`, `/groom`, `/bride`

## Mapping bảng SQL
- `users`
- `invitation_templates`
- `invitations`
- `invitation_images`
- `private_invitation`
- `guest`
- `messages_checkins`
- `groom`
- `bride`

## Postman
Collection mới nằm tại file: `postman.json`
- Import file này vào Postman
- Cập nhật biến `baseUrl` nếu cần
- Cập nhật các biến id (`userId`, `invitationId`, ...) theo dữ liệu thực tế trước khi gọi endpoint detail/update/delete



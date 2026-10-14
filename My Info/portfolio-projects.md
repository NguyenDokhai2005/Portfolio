# Portfolio Projects — Content cho Portfolio 3D

---

# 👤 Profile

- **Tên:** Nguyễn Đỗ Khải
- **Nickname:** Crust
- **Năm sinh:** 2005
- **Title:** Fullstack Web Developer
- **Education:** University of Transport Ho Chi Minh City (Đại học Giao thông Vận tải TP.HCM)
- **Major:** Công nghệ thông tin (Information Technology), Khóa 2023
- **Certifications:** Binance Academy × Open Campus — Introduction to EDU Chain & Open Campus (Certificate of Completion)
- **Email:** nguyendokhai.030105@gmail.com
- **Phone:** 0987291815
- **GitHub:** https://github.com/NguyenDokhai2005
- **LinkedIn:** https://www.linkedin.com/in/khải-nguyễn-đỗ-073821376/

---

## 1. 🏆 AI-WorkFlow — Workflow Automation Platform

**Vai trò:** Fullstack Developer

**Mô tả:**
Nền tảng automation workflow dạng visual builder, cho phép người dùng kéo thả các node AI (Research, Code, Marketing, Imagine, Video) lên canvas vô hạn và kết nối chúng thành pipeline xử lý tự động. Thiết kế theo phong cách Figma Weave với glassmorphism UI.

**Tech Stack:**
- Frontend: React 19, ReactFlow, Tailwind CSS, Framer Motion
- Backend: Supabase, Gmail OAuth
- Deploy: Vercel

**Điểm nổi bật:**
- Hệ thống dot grid 24px chuyên nghiệp, infinite canvas
- 5 Pillars Architecture: Research → Code → Marketing → Imagine → Video
- Glassmorphism nodes với animated neon edges
- Execution engine với DFS traversal
- Modular node registry — dễ mở rộng node mới

**Challenge & Giải pháp:**
- Canvas performance với nhiều nodes → Custom rendering pipeline, lazy load
- Workflow execution logic → DFS-based engine, sequential processing

**Links:**
- 🔗 [Live Demo](https://ai-work-flow-khaki.vercel.app/#/)
- 💻 [Frontend](https://github.com/NguyenDokhai2005/Font-end-Auto-Office)
- 💻 [Backend](https://github.com/NguyenDokhai2005/back_end_Auto_Office)

---

## 2. 🔗 Cedra-Pocket — Blockchain Telegram Mini App

**Vai trò:** **Team Leader** + Smart Contract Developer

**Team:** 3 thành viên — Crust là Leader, phụ trách viết Smart Contracts (Move language)

**Mô tả:**
Telegram Mini App tích hợp blockchain Cedra Network, bao gồm hệ thống pet ảo, quản lý năng lượng, quest system, và wallet không lưu ký (non-custodial). Người dùng tương tác qua Telegram, nhận thưởng on-chain từ các quest.

**Tech Stack:**
- Frontend: Next.js 16, React 19, Zustand, Tailwind CSS
- Backend: NestJS 10, PostgreSQL, Prisma ORM
- Blockchain: Move contracts trên Cedra Network
- Deploy: Vercel

**Điểm nổi bật:**
- Non-custodial wallet — người dùng giữ private key
- Ed25519 signature verification cho bảo mật
- 6-tier ranking system (Bronze → Leviathan)
- On-chain reward distribution
- Pet system với mining rewards

**Challenge & Giải pháp:**
- Blockchain integration với Telegram Mini App → Custom wallet flow, signature verification
- Team coordination (3 người) → Agile workflow, code review process

**Links:**
- 💻 [GitHub](https://github.com/Cedra-Pocket/Cedra-Pocket)

---

## 3. 📱 Expense Management — Ứng dụng Quản lý Chi tiêu Cá nhân

**Vai trò:** **Team Leader** + Frontend Developer (Dashboard)

**Team:** 5 thành viên — Crust là Leader, phụ trách Dashboard, đóng góp ~20%

**Mô tả:**
Ứng dụng Android giúp theo dõi thu chi, quản lý ngân sách và phân tích tài chính cá nhân. Điểm nổi bật là tính năng scan hóa đơn bằng camera, tự động trích xuất số tiền và tên cửa hàng bằng ML Kit OCR — hoạt động hoàn toàn offline.

**Tech Stack:**
- Ngôn ngữ: Kotlin
- UI: Jetpack Compose + Material 3
- Database: Room (SQLite)
- Camera: CameraX
- OCR: ML Kit Text Recognition
- Charts: MPAndroidChart
- Architecture: Clean Architecture (3 layer)

**Điểm nổi bật:**
- Scan hóa đơn bằng camera → tự động điền form (OCR offline)
- Dashboard với biểu đồ chi tiêu theo danh mục
- Ngân sách tháng với cảnh báo vượt budget
- Clean Architecture: Presentation → Domain ← Data
- Dark/Light mode

**Vai trò cụ thể:**
- Leader nhóm 5 người, phân công task, code review
- Xây dựng Dashboard (biểu đồ phân tích, thống kê)
- Đóng góp ~20% tổng dự án

**Challenge & Giải pháp:**
- OCR accuracy với nhiều loại hóa đơn → Pre-processing image, custom regex extraction
- Offline-first architecture → Room DB, không phụ thuộc server
- Team coordination (5 người) → Agile, phân task rõ ràng

**Links:**
- 💻 [GitHub](https://github.com/ExpenseManagement2026/MobileApp)

---

## 4. 🚗 DashBoard-Rental-Car — Quản lý Thuê Xe

**Vai trò:** Frontend Developer

**Mô tả:**
Dashboard quản lý hệ thống cho thuê xe, xây dựng hoàn toàn bằng vanilla JavaScript. Bao gồm quản lý danh sách xe (grid layout), quản lý khách hàng, lịch sử thuê xe, hệ thống filter/search, user profile với membership tiers (Bronze/Silver/Gold), và tính tổng chi tiêu tự động.

**Tech Stack:**
- Vanilla JavaScript (ES6+)
- HTML5, CSS3
- Responsive grid layout
- No framework, no backend — pure frontend

**Điểm nổi bật:**
- Quản lý khách hàng: rental history, profile, tổng chi tiêu
- Car listing: grid 4 cột, hover effects, filter theo type/transmission/capacity
- Membership system: Bronze → Silver → Gold dựa trên tổng chi tiêu
- Responsive design: grid collapse 4 → 1 cột trên mobile
- Pure CSS animations, no library

**Links:**
- 💻 [GitHub](https://github.com/NguyenDokhai2005/DashBoard-Rental-Car)

---

## 5. 🛒 SoftStore — Nền tảng E-commerce

**Vai trò:** Fullstack Developer

**Mô tả:**
Nền tảng e-commerce hoàn chỉnh với authentication, quản lý sản phẩm, đơn hàng, và hệ thống chat realtime bằng WebSocket. Frontend React kết nối backend NestJS + PostgreSQL, hỗ trợ thanh toán MoMo/banking.

**Tech Stack:**
- Frontend: React 18, Vite, Tailwind CSS, React Router, Socket.io-client, Lucide icons
- Backend: NestJS, TypeORM, PostgreSQL, JWT, WebSocket
- Database: PostgreSQL với UUID primary keys

**Điểm nổi bật:**
- Auth system: JWT, phân quyền user/admin
- CRUD products, orders với status tracking (pending → paid → processing → completed)
- **Chat realtime** qua WebSocket (Socket.io)
- Thống kê đơn hàng, báo cáo cho admin
- Payment integration: MoMo, banking
- Seed data script để demo nhanh

**API Endpoints:**
- Auth: register, login, profile
- Products: CRUD + seed + filter
- Orders: CRUD + statistics
- Chat: messages, unread count

**Links:**
- 💻 [GitHub](https://github.com/NguyenDokhai2005/SoftStore)

---

## 6. 🚙 AutoRent VN (Car-Rental) — Marketplace Cho Thuê Xe Tự Lái

**Vai trò:** Fullstack Developer + DevOps (dự án cá nhân, làm một mình)

**Mô tả:**
Nền tảng cho thuê xe tự lái theo mô hình marketplace: chủ xe đăng xe, khách tìm và đặt xe online, quản trị viên duyệt xe và giấy phép lái xe. Chạy trọn luồng thuê xe (giữ chỗ 15 phút → thanh toán tiền thuê + cọc → chủ xe duyệt trong 6 giờ → giao xe → trả xe), tiền được giữ hộ và chỉ ghi nhận cho chủ xe khi cả hai bên xác nhận. Thanh toán hiện là giả lập.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Backend: NestJS 11, Prisma 6, PostgreSQL 16
- Hạ tầng: Docker Compose, Nginx (reverse proxy, HTTPS), GitHub Actions với self-hosted runner
- Testing: Jest + Supertest (API), Vitest (web), Playwright (E2E)

**Điểm nổi bật:**
- Chống trùng lịch bằng exclusion constraint của PostgreSQL (`EXCLUDE USING gist`) — request đồng thời trả 409
- Chuyển trạng thái đơn an toàn khi tranh chấp bằng `UPDATE` có điều kiện, idempotent
- Giữ chỗ có thời hạn bằng cột `expires_at` + job mỗi phút, không cần Redis
- Ảnh giấy phép lái xe lưu riêng, chỉ trả qua API, mọi lần đọc đều ghi log
- Ảnh upload được vẽ lại thành WebP, loại bỏ EXIF/GPS
- Access token 15 phút trong bộ nhớ + refresh token httpOnly xoay vòng, mật khẩu argon2id
- Test tự liệt kê toàn bộ route để kiểm tra phân quyền
- CI mỗi PR, CD tự động deploy song song lên hai máy chủ (VMware + cloud)

**Giới hạn hiện tại:** thanh toán giả lập, chưa có đặt lại mật khẩu, đánh giá, chat, bản đồ.

**Links:**
- 💻 [GitHub](https://github.com/NguyenDokhai2005/Car-Rental)

---

# 📋 Gợi ý sắp xếp trên Portfolio

**Thứ tự đề xuất (từ mạnh nhất):**

| # | Dự án | Lý do |
|---|---|---|
| 1 | **AI-WorkFlow** | Dự án "Hero" — phức tạp nhất, có demo live, technical depth cao |
| 2 | **AutoRent VN** | Fullstack + DevOps trọn vẹn — CSDL, API, CI/CD, deploy 2 server |
| 3 | **Cedra-Pocket** | Blockchain + Team Leader — thể hiện leadership + emerging tech |
| 4 | **Expense Management** | Mobile + OCR — thể hiện versatility, giải quyết vấn đề thật |
| 5 | **SoftStore** | Fullstack proof — CRUD + database |
| 6 | **DashBoard-Rental-Car** | Bonus — UI/UX skill |

---

# ⚠️ Việc cần làm trước khi đưa lên portfolio

1. **Screenshot / video demo** cho từng project (đặc biệt AI-WorkFlow và Cedra-Pocket)
2. **Viết README** cho SoftStore và DashBoard-Rental-Car (hiện tại chưa có)
3. **Deploy Cedra-Pocket** nếu có thể (demo > mọi thứ)
4. **Chuẩn bị câu trả lời phỏng vấn** cho mỗi dự án:
   - "Khó nhất ở đâu?"
   - "Bạn đóng góp gì?"
   - "Nếu làm lại, bạn sẽ làm khác gì?"

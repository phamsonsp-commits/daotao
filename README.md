# Đào tạo nội bộ

Nền tảng web nội bộ để đào tạo nhân viên về quy chế, quy trình và tài liệu
công ty / sản phẩm. Xây dựng bằng Next.js (App Router) + TypeScript +
Prisma/SQLite + NextAuth.

## Tính năng chính

- **Thư viện tài liệu**: quản lý quy chế, quy trình, tài liệu công ty và tài
  liệu sản phẩm, phân loại theo cấp độ nhân sự (Thực tập sinh / Nhân viên /
  Chuyên viên / Quản lý). Nội dung hỗ trợ Markdown.
- **Tìm kiếm**: tìm theo từ khoá trên tài liệu, chương trình đào tạo và bài
  đánh giá.
- **Chương trình đào tạo**: admin ghép các tài liệu thành lộ trình học theo
  cấp độ, có thể xây dựng thủ công hoặc dùng **"Tự động tạo nội dung từ kho
  tài liệu"** — tự động gom các tài liệu phù hợp cấp độ (và loại tài liệu nếu
  chọn) vào chương trình. Nhân viên đăng ký học, đánh dấu tiến độ theo từng
  tài liệu.
- **Bài đánh giá theo cấp độ**: admin tạo bài trắc nghiệm (một hoặc nhiều đáp
  án đúng) gắn với cấp độ / chương trình đào tạo, có điểm đạt tối thiểu.
  Nhân viên làm bài, được chấm điểm tự động, xem lại đáp án đúng/sai, và có
  thể làm lại.
- **Quản lý người dùng**: admin tạo/sửa tài khoản, gán vai trò (Quản trị
  viên / Nhân viên) và cấp độ nhân sự.

## Công nghệ sử dụng

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- TypeScript, Tailwind CSS 4
- [Prisma](https://www.prisma.io/) + SQLite (dễ chạy nội bộ, không cần cài
  đặt máy chủ cơ sở dữ liệu riêng)
- [NextAuth v5](https://authjs.dev/) (đăng nhập bằng email/mật khẩu, phiên
  JWT, middleware bảo vệ route theo vai trò)

## Bắt đầu

```bash
npm install
cp .env.example .env   # chỉnh AUTH_SECRET nếu cần (khuyến nghị cho production)

npx prisma migrate deploy   # tạo cơ sở dữ liệu SQLite theo schema
npm run db:seed             # nạp dữ liệu mẫu (tài khoản demo + tài liệu mẫu)

npm run dev                 # chạy http://localhost:3000
```

### Tài khoản demo (sau khi seed)

| Vai trò | Email | Mật khẩu | Cấp độ |
| --- | --- | --- | --- |
| Quản trị viên | admin@congty.vn | admin123 | Quản lý |
| Nhân viên | nhanvien@congty.vn | nhanvien123 | Nhân viên |
| Nhân viên | thuctap@congty.vn | thuctap123 | Thực tập sinh |
| Nhân viên | chuyenvien@congty.vn | chuyenvien123 | Chuyên viên |
| Nhân viên | quanly@congty.vn | quanly123 | Quản lý |

Đổi mật khẩu các tài khoản này (hoặc tạo tài khoản admin mới rồi xoá các tài
khoản demo) trước khi đưa vào sử dụng thật.

## Cấu trúc dữ liệu

- `User`: tài khoản, vai trò (`ADMIN`/`EMPLOYEE`), cấp độ nhân sự.
- `Document`: tài liệu (quy chế / quy trình / công ty / sản phẩm), gắn cấp độ
  áp dụng.
- `TrainingProgram` + `ProgramItem`: chương trình đào tạo và danh sách tài
  liệu theo thứ tự.
- `Enrollment`: tiến độ học của từng nhân viên trong một chương trình.
- `Quiz` + `Question` + `QuizAttempt`: bài đánh giá, câu hỏi trắc nghiệm và
  lịch sử làm bài.

## Lệnh hữu ích

```bash
npm run dev       # chạy môi trường phát triển
npm run build     # build production
npm run start     # chạy bản build production
npm run lint      # kiểm tra lint
npm run db:seed   # nạp lại dữ liệu mẫu (sẽ xoá tài liệu/chương trình/bài đánh giá cũ)
npx prisma studio # xem/sửa dữ liệu trực quan
```

## Ghi chú triển khai

- Cơ sở dữ liệu mặc định là SQLite (file `prisma/dev.db`), phù hợp để chạy
  nội bộ trên một máy chủ. Nếu cần nhiều người dùng truy cập đồng thời ở quy
  mô lớn hơn, đổi `datasource` trong `prisma/schema.prisma` sang PostgreSQL/
  MySQL rồi chạy lại `prisma migrate`.
- Đặt biến môi trường `AUTH_SECRET` là một chuỗi ngẫu nhiên đủ mạnh khi triển
  khai thật (`openssl rand -base64 32`).

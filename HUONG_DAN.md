# Hướng dẫn: Mã giới thiệu bạn bè & Combo sản phẩm

Tài liệu này hướng dẫn dùng 2 tính năng mới trên **kenios.store**.

---

## 1. 🎁 Mã giới thiệu bạn bè

Mỗi tài khoản có **1 mã giới thiệu riêng**. Khi người mới đăng ký bằng mã của bạn
**và nạp tiền lần đầu**, thì **cả hai** (người mời + người mới) đều được cộng
một khoản thưởng do admin cấu hình.

### Cài đặt (Admin)
1. Vào **Quản trị → Cấu hình**.
2. Kéo tới mục **"Giới thiệu bạn bè"**:
   - ✅ Tick **"Bật chương trình giới thiệu"** để bật/tắt.
   - Nhập **"Tiền thưởng mỗi bên (đồng)"** — ví dụ `20000` (mỗi bên nhận 20.000đ).
3. Bấm **Lưu cấu hình**, rồi **Đồng bộ lên máy chủ** để áp dụng cho mọi khách.

### Người dùng lấy mã & chia sẻ
1. Đăng nhập → bấm **avatar** (góc phải) mở **Thông Tin Cá Nhân**.
2. Ở thẻ **"Giới thiệu bạn bè"** có **mã của bạn** (VD `KEN12AB`) và nút **Sao chép mã**.
3. Gửi mã cho bạn bè.

### Người mới dùng mã
1. Khi **Đăng ký**, nhập mã vào ô **"Mã giới thiệu"**.
2. Sau khi **nạp tiền lần đầu** → cả hai tự động được cộng thưởng.
3. Thưởng ghi trong **Lịch sử nạp tiền** và mục thống kê "Thưởng đã nhận" ở hồ sơ.

> ⚠️ Lưu ý: thưởng chỉ tính **1 lần** (lần nạp đầu tiên của người được mời).
> Số dư cộng thưởng được lưu trong hệ thống và **đồng bộ lên máy chủ** khi admin
> bấm "Đồng bộ". Để hoàn toàn tự động phía máy chủ cho mọi thiết bị, cần thêm hỗ
> trợ backend (không bắt buộc cho vận hành cơ bản).

---

## 2. 📦 Combo sản phẩm

Gộp nhiều sản phẩm vào **một combo giá ưu đãi**. Khách mua 1 lần, **trừ tiền 1 lần**
và **nhận key của tất cả sản phẩm** trong combo.

### Tạo combo (Admin)
1. Vào **Quản trị → Combo**.
2. Bấm **"+ Tạo combo mới"**.
3. Điền:
   - **Tên combo** (VD "Combo Gaming Pro").
   - **Giá combo** — đặt rẻ hơn tổng giá các sản phẩm để có mức "tiết kiệm".
   - **Mô tả**, **URL ảnh/video** (tuỳ chọn, lấy từ tab **Thư viện**).
   - **Sản phẩm trong combo**: mỗi dòng chọn **Sản phẩm → Gói**. Bấm **"+ Thêm sản phẩm"** để thêm dòng.
4. Bấm **Lưu combo**. Combo hiện ngay ở mục **"Combo Ưu Đãi"** trên trang chủ.
5. **Đồng bộ lên máy chủ** để mọi khách thấy.

- Sửa/Xoá combo: dùng nút **Sửa** / **Xoá** ở danh sách bên dưới.

### Khách mua combo
1. Ở trang chủ, kéo tới **"Combo Ưu Đãi"**.
2. Xem giá combo, giá gốc gạch ngang và mức **tiết kiệm**, danh sách sản phẩm.
3. Bấm **"Mua combo"** → xác nhận. Hệ thống trừ tiền 1 lần và tạo **key cho từng sản phẩm**.
4. Xem toàn bộ key trong **"Đơn hàng của tôi"** (mỗi sản phẩm 1 dòng, có nút sao chép key).

---

## Nhắc chung khi deploy
- Sau khi chỉnh trong Quản trị, luôn bấm **Đồng bộ lên máy chủ** để lưu vào `database.json`.
- Khi upload code mới lên hosting: **không ghi đè** `database.json` (dữ liệu người
  dùng/đơn hàng) và `secrets.php` (token ngân hàng) nếu bản trên server đang mới hơn.

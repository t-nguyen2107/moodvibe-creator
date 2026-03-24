# Contributing to MoodVibe Creator

Cảm ơn bạn muốn đóng góp cho dự án! 🎉

## 🚀 Cách đóng góp

### 1. Fork & Clone

```bash
# Fork repo trên GitHub, sau đó:
git clone https://github.com/YOUR_USERNAME/moodvibe-creator.git
cd moodvibe-creator
```

### 2. Tạo Branch

```bash
git checkout -b feature/your-feature-name
# hoặc
git checkout -b fix/your-bug-fix
```

### 3. Code & Test

```bash
# Backend
cd backend
pip install -r requirements.txt
pytest tests/

# Frontend
cd frontend
npm install
npm run build
npm run lint
```

### 4. Commit

```bash
git add .
git commit -m "feat: thêm tính năng X" hoặc "fix: sửa bug Y"
```

### 5. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Sau đó tạo Pull Request trên GitHub.

## 📋 Commit Convention

| Prefix | Mô tả |
|--------|-------|
| `feat:` | Tính năng mới |
| `fix:` | Sửa bug |
| `docs:` | Cập nhật documentation |
| `style:` | Format code, không thay đổi logic |
| `refactor:` | Refactor code |
| `test:` | Thêm/sửa tests |
| `chore:` | Maintenance, dependencies |

## ✅ CI/CD

Mọi PR sẽ tự động chạy:
- **Backend tests** - Python pytest
- **Frontend build** - Next.js build
- **Lint check** - ESLint

PR cần pass tất cả checks trước khi merge.

## 🐛 Report Bug / Request Feature

Mở issue tại: https://github.com/t-nguyen2107/moodvibe-creator/issues

## 📝 Code Style

### Python (Backend)
- Follow PEP 8
- Sử dụng type hints
- Docstrings cho functions

### TypeScript (Frontend)
- ESLint config có sẵn
- Prettier formatting
- Functional components với hooks

---

Cảm ơn bạn đã đóng góp! 💖

# Testing Guide - MoodVibe Creator

## Quick Start Testing

### Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg installed globally
- Internet connection

---

## 1. Backend Testing

### Install Test Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Run All Backend Tests
```bash
pytest tests/ -v
```

### Run Specific Test File
```bash
pytest tests/test_music_search.py -v
pytest tests/test_encryption.py -v
pytest tests/test_api.py -v
```

### Run with Coverage
```bash
pytest --cov=app tests/ --cov-report=html
```

### View Coverage Report
Open `htmlcov/index.html` in browser

---

## 2. Frontend Unit Testing

### Install Dependencies
```bash
cd frontend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- home.test.tsx
npm test -- button.test.tsx
npm test -- store.test.ts
```

---

## 3. E2E Testing (Playwright)

### Install Dependencies
```bash
cd frontend
npm install
npx playwright install
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

### Run Specific Test File
```bash
npx playwright test home.spec.ts
npx playwright test create.spec.ts
npx playwright test library.spec.ts
npx playwright test settings.spec.ts
```

### Run in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug E2E Tests
```bash
npx playwright test --debug
```

---

## 4. Manual Testing Checklist

### Home Page
- [ ] Page loads without errors
- [ ] All navigation links work
- [ ] Create button navigates to /create
- [ ] Library button navigates to /library
- [ ] Feature cards display correctly
- [ ] Responsive on mobile/tablet/desktop

### Create Playlist Wizard

#### Step 1: Mood & Genre
- [ ] Mood options display (10 moods)
- [ ] Genre options display (9 genres)
- [ ] Can select mood
- [ ] Can select genre
- [ ] Selected options show purple highlight
- [ ] Can proceed to step 2 with valid selection
- [ ] Cannot proceed without selection

#### Step 2: Search & Select Songs
- [ ] Search bar displays
- [ ] Can search by keyword
- [ ] Results display as song cards
- [ ] Each song shows: title, artist, source, duration
- [ ] Royalty free badge displays correctly
- [ ] Can select/deselect songs
- [ ] Selected count updates
- [ ] Cannot select more than 20 songs
- [ ] Can filter by royalty free
- [ ] Preview button works (if implemented)
- [ ] Can proceed with at least 1 song

#### Step 3: Customize
- [ ] Gap slider works (5-10 seconds)
- [ ] Shows current selection summary
- [ ] Can create playlist
- [ ] Success message displays

### Library Page
- [ ] Page loads without errors
- [ ] Empty state displays when no playlists
- [ ] Create button works
- [ ] Navigation works
- [ ] Responsive design

### Playlist Detail Page
- [ ] Page loads with playlist data
- [ ] Song list displays (if not special genre)
- [ ] Special genres hide song list
- [ ] Can generate audio
- [ ] Can generate video
- [ ] Download buttons work (after generation)
- [ ] Upload buttons display
- [ ] Copyright warning displays for non-royalty-free playlists
- [ ] Warning modal works

### Settings Page
- [ ] API key form displays
- [ ] Service dropdown works
- [ ] Can save API key
- [ ] Masked keys display
- [ ] Can delete API key
- [ ] Setup instructions display
- [ ] Navigation works

---

## 5. Integration Testing

### Test Complete Flow

1. **Create Playlist**
   ```bash
   # Start backend
   cd backend
   venv\Scripts\uvicorn app.main:app --reload

   # Start frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Manual Test Flow**
   - Open http://localhost:3000
   - Click "Tạo Playlist Mới"
   - Select mood: "chill"
   - Select genre: "vietnam"
   - Click "Tiếp tục"
   - Click "Tìm kiếm"
   - Select 5-10 songs
   - Click "Tiếp tục"
   - Adjust gap slider
   - Click "Tạo Playlist"
   - Verify success message

3. **Test Audio Generation**
   - Open playlist detail
   - Click "Tạo MP3"
   - Wait for completion
   - Download MP3
   - Verify file plays

4. **Test Video Generation**
   - Click "Tạo MP4"
   - Wait for completion
   - Download MP4
   - Verify video plays

---

## 6. Performance Testing

### Load Testing
```bash
# Install locust
pip install locust

# Run load test
cd backend
locust -f locustfile.py --host=http://localhost:8000
```

### Expected Performance
- Home page load: < 2s
- Search response: < 3s
- Audio merge (20 songs): < 2min
- Video generation: < 1min

---

## 7. Security Testing

### Check Security Headers
```bash
curl -I http://localhost:8000/
curl -I http://localhost:3000/
```

### Test CORS
```bash
curl -H "Origin: http://localhost:3000" http://localhost:8000/api/music/sources
```

### Test Input Validation
- Try XSS payloads in search
- Try SQL injection in forms
- Test file upload limits

---

## 8. Browser Compatibility

### Test In:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (WebKit)
- ✅ Mobile browsers

### Playwright E2E covers all 3:
```bash
npm run test:e2e
```

---

## 9. Common Issues & Fixes

### FFmpeg Not Found
```bash
# Windows: Download from https://ffmpeg.org/download.html
# Add to PATH

# Verify:
ffmpeg -version
```

### Port Already in Use
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Tests Failing
```bash
# Clear cache
rm -rf node_modules/.cache
rm -rf .next

# Reinstall
npm install

# Try again
npm test
```

---

## 10. CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
          pytest

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd frontend
          npm install
          npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd frontend
          npm install
          npx playwright install --with-deps
          npm run test:e2e
```

---

**Happy Testing! 🎉**

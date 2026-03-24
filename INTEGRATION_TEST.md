# MoodVibe Creator - Full Integration Test Guide

## 🚀 Servers Running

- ✅ **Backend API**: http://localhost:8899
- ✅ **Frontend UI**: http://localhost:3000

---

## 📋 Test Scenarios

### 1. Natural Language Search (English)

**Test URL**: http://localhost:3000/en/create

**Steps:**
1. Navigate to: http://localhost:3000/en/create
2. Wait for page to load (should see large search bar)
3. Observe rotating placeholder text (changes every 3 seconds)
4. Type in search bar: "chill lo-fi beats for studying"
5. Wait for AI parsing badge to appear (should show detected mood/genre)
6. Press Enter or click Search button
7. Verify:
   - [ ] Loading skeleton appears
   - [ ] Search results appear below
   - [ ] Each result card shows: title, artist, duration, source badge
   - [ ] Trending badges appear (if applicable)
   - [ ] Can click on a song to select it
   - [ ] Selected song shows gradient border + checkmark

**Expected Result:**
- AI parses: mood="chill", genre="lo-fi", activity="studying"
- Results show chill lo-fi songs
- Selected songs appear in floating playlist preview

---

### 2. Natural Language Search (Vietnamese)

**Test URL**: http://localhost:3000/vi/create

**Steps:**
1. Navigate to: http://localhost:3000/vi/create
2. Type: "nhạc K-pop tập gym"
3. Press Enter
4. Verify:
   - [ ] AI parses Vietnamese query correctly
   - [ ] Genre detected as "k-pop"
   - [ ] Activity detected as "workout" or "gym"
   - [ ] Results show K-pop songs
   - [ ] Can select multiple songs (max 20)

**Expected Result:**
- AI parses: genre="k-pop", activity="workout", language="korean"
- Results show K-pop workout songs
- Selected songs count updates in playlist preview

---

### 3. Advanced Filters

**Test URL**: http://localhost:3000/en/create

**Steps:**
1. Click "Advanced Filters" button below search bar
2. Verify:
   - [ ] Filters panel slides down smoothly
   - [ ] Mood chips appear (20 options)
   - [ ] Genre chips appear (30 options)
   - [ ] Era selector available (1950s - 2020s)
   - [ ] Language selector with flags
   - [ ] Source toggles (YouTube, Spotify, SoundCloud, Zing MP3)
   - [ ] "Royalty-free only" checkbox
   - [ ] "Trending this week" toggle

3. Test filters:
   - [ ] Click "chill" mood chip → becomes active
   - [ ] Click "pop" genre chip → becomes active
   - [ ] Select "2010s" era
   - [ ] Select "Vietnamese" language
   - [ ] Enable "Trending this week"
   - [ ] Click "Apply Filters"
   - [ ] Results update with filters applied
   - [ ] Active filters show indicator

**Expected Result:**
- Filters panel slides down with animation
- All filter options visible and interactive
- Applied filters update search results
- Can reset filters with button

---

### 4. Floating Playlist Preview

**Test URL**: http://localhost:3000/en/create

**Steps:**
1. Search for any song
2. Click on a song to select it
3. Verify:
   - [ ] Floating panel appears (right side on desktop, bottom on mobile)
   - [ ] Shows "1/20 songs selected"
   - [ ] Selected song appears in list
   - [ ] Shows total duration
   - [ ] "Create Playlist" button visible
   - [ ] Can remove song with X button

4. Select more songs (up to 20)
5. Verify:
   - [ ] Song count updates: "5/20 songs selected"
   - [ ] Total duration updates
   - [ ] All selected songs listed
   - [ ] Can preview songs with hover play

**Expected Result:**
- Floating playlist preview appears after first selection
- Updates in real-time as songs are selected/deselected
- Maximum 20 songs enforced
- Smooth slide-in animation

---

### 5. Responsive Design

**Test Different Screen Sizes:**

**Desktop (> 1024px):**
- [ ] Search bar: 60% width (max 800px), centered
- [ ] Filters: 3-column grid
- [ ] Song cards: 3-column grid
- [ ] Playlist preview: Fixed right sidebar (300px)

**Tablet (768px - 1024px):**
- [ ] Search bar: 80% width
- [ ] Filters: 2-column grid
- [ ] Song cards: 2-column grid
- [ ] Playlist preview: Collapsible sidebar

**Mobile (< 768px):**
- [ ] Search bar: Full-width with padding
- [ ] Filters: Full-width accordion
- [ ] Song cards: Single column
- [ ] Playlist preview: Bottom sheet (slideUp)

**Test Method:**
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test different device presets (iPhone 12, iPad, Desktop)

---

### 6. Dark Mode

**Steps:**
1. Open http://localhost:3000/en/create
2. Toggle dark mode (if available)
3. Verify:
   - [ ] Background changes to deep navy/slate (not pure black)
   - [ ] Text changes to light color
   - [ ] Cards have dark backgrounds
   - [ ] Glassmorphism effects work in dark mode
   - [ ] All components visible and readable
   - [ ] Color contrast meets WCAG standards

---

### 7. Keyboard Navigation

**Steps:**
1. Navigate to http://localhost:3000/en/create
2. Test keyboard:
   - [ ] Tab to navigate between elements
   - [ ] Enter to submit search
   - [ ] Escape to close suggestions dropdown
   - [ ] Arrow keys to navigate suggestions
   - [ ] Space to toggle checkboxes
   - [ ] Focus rings visible on all interactive elements

---

### 8. Loading States

**Steps:**
1. Type in search bar: "upbeat workout music"
2. Press Enter
3. Verify loading states:
   - [ ] Search bar shows loading indicator
   - [ ] Shimmer skeletons appear for results
   - [ ] Loading spinner shows AI parsing status
   - [ ] Results appear smoothly when loaded
   - [ ] No layout shifts during loading

---

### 9. Error Handling

**Steps:**
1. Disconnect internet (optional)
2. Try searching
3. Verify:
   - [ ] Error message appears (toast or inline)
   - [ ] "Retry" button available
   - [ ] Graceful fallback to keyword search if AI fails
   - [ ] Clear error message in user's language
   - [ ] App doesn't crash

---

### 10. Multi-Language Support

**Test Different Languages:**

**English:**
- URL: http://localhost:3000/en/create
- Query: "sad songs for breakup"
- Verify: Results in English

**Vietnamese:**
- URL: http://localhost:3000/vi/create
- Query: "nhạc vui đám cưới"
- Verify: Results in Vietnamese

**Korean:**
- URL: http://localhost:3000/ko/create
- Query: "신나는 운동 음악"
- Verify: Results in Korean (if available)

---

### 11. Performance

**Check:**
- [ ] Page loads in < 3 seconds (Time to Interactive)
- [ ] Search results appear in < 2 seconds (AI parsing)
- [ ] Smooth 60fps animations
- [ ] No janky scrolling
- [ ] Images load lazily (not all at once)
- [ ] Debounced API calls (300ms delay)

---

### 12. Accessibility (a11y)

**Test with Screen Reader (NVDA/JAWS):**
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Buttons have accessible names
- [ ] ARIA labels on interactive elements
- [ ] Focus order logical
- [ ] Color contrast minimum 4.5:1

**Keyboard-Only Navigation:**
- [ ] Can complete full flow without mouse
- [ ] Skip links available (if needed)
- [ ] Focus visible at all times

---

## 🐛 Known Issues to Watch For

1. **Spotify Results May Be Empty**
   - Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
   - Solution: Add credentials or use YouTube/Zing MP3

2. **Zing MP3 Scraping May Fail**
   - Anti-bot measures may block requests
   - Solution: Use VPN or rely on other sources

3. **AI Response Time**
   - First query: 4-6 seconds (cold start)
   - Subsequent queries: 1-3 seconds
   - Solution: Add Redis caching for production

4. **No Trending Badges**
   - Chart data not available without API keys
   - Solution: Configure Spotify or use alternative trending sources

---

## ✅ Success Criteria

**Passing Test:**
- All 12 test scenarios pass
- Natural language search works for EN, VI, KO
- Can select up to 20 songs
- Playlist preview updates correctly
- Responsive on mobile, tablet, desktop
- Dark mode works
- Keyboard navigation functional
- Performance acceptable (< 3s load time)

---

## 📝 Test Report Template

After testing, fill out:

**Date**: _______________________

**Tester**: _____________________

**Browser**: ___________________

**Passed Tests**: _____ / 12

**Failed Tests**: _____ / 12

**Issues Found**:
1.
2.
3.

**Overall Rating**: ⭐⭐⭐⭐⭐ (1-5)

**Notes**: _____________________

---

## 🚀 Next Steps After Testing

1. **Fix Critical Bugs** - If any blockers found
2. **Implement Intelligent Ranking** - Trending + relevance algorithm
3. **Add Infinite Scroll** - Load more results on scroll
4. **Implement Audio Preview** - Play/pause functionality
5. **Create Playlist Endpoint** - Finalize playlist creation
6. **Deploy to Production** - Vercel + Railway/Render

Good luck testing! 🎉

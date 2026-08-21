# 📱 Responsive Breakpoints - Arsip Digital

## 🎯 Tailwind CSS Breakpoints yang Digunakan

Aplikasi ini menggunakan **Tailwind CSS** default breakpoints:

| Prefix | Min Width | Device Type | Description |
|--------|-----------|-------------|-------------|
| **(default)** | 0px | **Mobile** | Smartphone portrait |
| `sm:` | 640px | Tablet Portrait | Small tablet |
| `md:` | 768px | Tablet Landscape | Medium tablet |
| **`lg:`** | **1024px** | **Desktop** | **⭐ MAIN BREAKPOINT** |
| `xl:` | 1280px | Large Desktop | Wide screen |
| `2xl:` | 1536px | Extra Large | Ultra-wide |

---

## ⭐ MAIN BREAKPOINT: `lg:` (1024px)

**Ini adalah breakpoint utama yang digunakan aplikasi!**

### **Kapan Layout Berubah?**

```
Layar < 1024px  →  MOBILE MODE
Layar ≥ 1024px  →  DESKTOP MODE
```

### **Contoh Perubahan:**

#### **1. Sidebar**
- **< 1024px (Mobile):** Hidden, diganti BottomNav
- **≥ 1024px (Desktop):** Visible di kiri (230px width)

#### **2. Header Icons**
- **< 1024px (Mobile):** 20px (kecil)
- **≥ 1024px (Desktop):** 24px (normal)

#### **3. Bottom Navigation**
- **< 1024px (Mobile):** Visible di bawah
- **≥ 1024px (Desktop):** Hidden (pakai Sidebar)

#### **4. Logo & Breadcrumb**
- **< 1024px (Mobile):** Logo + "Arsip Digital"
- **≥ 1024px (Desktop):** Full Breadcrumb navigation

#### **5. Profile Menu**
- **< 1024px (Mobile):** Dropdown menu (klik → show menu)
- **≥ 1024px (Desktop):** Direct navigation ke profile page

---

## 📐 Ukuran Layar Device Umum

### **Mobile Devices** (< 1024px)

| Device | Width | Mode |
|--------|-------|------|
| iPhone SE | 375px | Mobile |
| iPhone 12/13/14 | 390px | Mobile |
| iPhone 14 Pro Max | 430px | Mobile |
| Galaxy S20 | 360px | Mobile |
| Galaxy S21 Ultra | 384px | Mobile |
| Pixel 5 | 393px | Mobile |
| Pixel 7 | 412px | Mobile |

### **Tablets** (768px - 1023px)

| Device | Width | Mode |
|--------|-------|------|
| iPad Mini | 768px | Mobile (masih) |
| iPad Air | 820px | Mobile (masih) |
| iPad Pro 11" | 834px | Mobile (masih) |
| iPad Pro 12.9" | 1024px | **Desktop** ✅ |

### **Desktop** (≥ 1024px)

| Device | Width | Mode |
|--------|-------|------|
| Laptop 13" | 1280px | Desktop |
| Laptop 15" | 1366px | Desktop |
| Desktop 1080p | 1920px | Desktop |
| Desktop 1440p | 2560px | Desktop |
| Desktop 4K | 3840px | Desktop |

---

## 🎨 Component Responsiveness

### **Header Component**

```jsx
// Mobile Logo
<div className="lg:hidden">  // Show when < 1024px
  Logo + "Arsip Digital"
</div>

// Desktop Breadcrumb
<nav className="hidden lg:flex">  // Show when ≥ 1024px
  Home → Arsip Digital → Current Page
</nav>

// Icon Sizes
<button className="p-1.5 lg:p-2">  // Smaller padding on mobile
  <span style={{ fontSize: '20px' }}>  // 20px on mobile
    // Desktop akan override ke 24px via lg: class
```

### **BottomNav Component**

```jsx
<nav className="lg:hidden">  // Hidden when ≥ 1024px
  Dashboard | File Saya | Profile | etc
</nav>
```

### **Sidebar Component**

```jsx
<aside className="hidden lg:block">  // Hidden when < 1024px
  // Desktop sidebar with 230px width
</aside>
```

### **Main Content**

```jsx
// Mobile: No left margin
// Desktop: 230px left margin for sidebar
<div className="ml-0 lg:ml-[230px]">
  Main Content
</div>
```

---

## 🔍 Cara Cek Breakpoint di Browser

### **Method 1: Resize Browser**

1. Buka app di browser
2. Open DevTools (F12)
3. Toggle Device Toolbar (Ctrl+Shift+M)
4. Resize width dan lihat perubahan di **1024px**

### **Method 2: Use Responsive Mode**

1. F12 → Toggle Device Toolbar
2. Pilih device dari dropdown
3. Atau custom dimensions

### **Method 3: JavaScript Console**

```javascript
// Check current width
console.log(window.innerWidth);

// Check if mobile or desktop
if (window.innerWidth < 1024) {
  console.log('Mobile Mode');
} else {
  console.log('Desktop Mode');
}

// Listen for resize
window.addEventListener('resize', () => {
  console.log('Width:', window.innerWidth);
  if (window.innerWidth === 1024) {
    console.log('⚠️ BREAKPOINT! Mode switching...');
  }
});
```

---

## 📱 Testing Different Screen Sizes

### **Emulator Test Sizes:**

```
Mobile Portrait:
- Width: 360px - 428px
- Shows: Mobile layout, BottomNav

Tablet Portrait:
- Width: 768px - 820px
- Shows: Still mobile layout

Tablet Landscape:
- Width: 1024px+
- Shows: Desktop layout, Sidebar

Desktop:
- Width: 1280px+
- Shows: Full desktop layout
```

---

## 🎯 Why 1024px?

**1024px adalah sweet spot karena:**

1. ✅ **iPad Pro 12.9"** memiliki width 1024px → Desktop experience
2. ✅ **Kebanyakan tablet landscape** di bawah 1024px → Mobile experience
3. ✅ **Laptop kecil** (1280px+) → Desktop experience
4. ✅ Standard industry breakpoint untuk tablet→desktop transition

---

## 🛠️ Cara Mengubah Breakpoint (Jika Perlu)

### **Option 1: Custom Tailwind Config**

File: `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1280px',  // Change from 1024px to 1280px
      'xl': '1536px',
    }
  }
}
```

### **Option 2: Custom Breakpoint Class**

```javascript
// Add custom breakpoint
'desktop': '1280px',

// Use in component
<div className="desktop:flex">
```

---

## 📊 Breakpoint Usage Statistics

Dari hasil search, aplikasi ini menggunakan:

- **`lg:`** - **235 occurrences** ⭐ (Most used)
- `md:` - 15 occurrences
- `sm:` - 8 occurrences
- `xl:` - 3 occurrences
- `2xl:` - 0 occurrences

**Kesimpulan:** `lg:` (1024px) adalah breakpoint utama yang paling banyak digunakan!

---

## 🎨 Visual Representation

```
0px          640px       768px       1024px         1280px        1536px
│             │           │           │              │             │
├─────────────┼───────────┼───────────┼──────────────┼─────────────┼─────→
│             │           │           │              │             │
│   Mobile    │    sm:    │    md:    │     lg:      │     xl:     │  2xl:
│             │  Tablet   │  Tablet   │   DESKTOP    │    Wide     │ Ultra
│  Portrait   │  Portrait │ Landscape │              │   Desktop   │  Wide
│             │           │           │              │             │
└─────────────┴───────────┴───────────┴──────────────┴─────────────┴─────→
      BottomNav Visible                     Sidebar Visible
      Logo Simple                           Full Breadcrumb
      Icons 20px                            Icons 24px
```

---

## ✅ Quick Reference

### **Want Mobile Layout?**
```
Screen width < 1024px
```

### **Want Desktop Layout?**
```
Screen width ≥ 1024px
```

### **Testing Breakpoint:**
```javascript
// In browser console
window.innerWidth  // Check current width
```

### **Common Test Widths:**
```
360px  - Typical phone
768px  - Typical tablet portrait
1024px - BREAKPOINT (transition point)
1280px - Typical laptop
1920px - Typical desktop
```

---

## 🎯 Summary

**MAIN BREAKPOINT: 1024px**

- **< 1024px:** Mobile mode
  - BottomNav visible
  - Sidebar hidden
  - Icons 20px
  - Logo simple
  
- **≥ 1024px:** Desktop mode
  - Sidebar visible
  - BottomNav hidden
  - Icons 24px
  - Full breadcrumb

**Transition happens EXACTLY at 1024px!**

---

## 📚 References

- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)
- [Device Metrics](https://www.mydevice.io/)

---

**Sekarang Anda tahu persis kapan layout berubah! 🎉**

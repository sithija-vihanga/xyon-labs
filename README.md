# Xyon Labs - Intelligent Robotics Solutions

A futuristic website showcasing robotics projects, research, and solutions. Features interactive 3D robot models (Unitree H1, Unitree Go2, Kinova Gen3) with animations.

**Live Site:** https://sithija-vihanga.github.io/xyon-labs/

---

## Free Hosting Options

### Option 1: GitHub Pages (Recommended)

Already configured! Your site auto-deploys when you push to the `main` branch.

1. Go to your repository: https://github.com/sithija-vihanga/xyon-labs
2. Navigate to **Settings** > **Pages**
3. Under "Source", select **GitHub Actions**
4. Your site will be live at: `https://sithija-vihanga.github.io/xyon-labs/`

### Option 2: Netlify

1. Go to https://app.netlify.com/drop
2. Drag and drop the `xyon-labs` folder
3. Your site is instantly live with a random URL
4. Optional: Connect to GitHub for auto-deployment

### Option 3: Vercel

```bash
npm i -g vercel
cd xyon-labs
vercel
```

### Option 4: Cloudflare Pages

1. Go to Cloudflare Dashboard > Pages
2. Connect your GitHub repository
3. Set build output directory to `.` (root)
4. Deploy

---

## Adding Project Videos

### Step 1: Prepare Your Videos

- **Format:** MP4 (H.264 codec recommended)
- **Resolution:** 1920x1080 or 1280x720
- **File size:** Keep under 10MB for fast loading
- Compress using tools like HandBrake or FFmpeg

### Step 2: Add Videos to Project

1. Create the videos folder:
```bash
mkdir -p assets/videos
```

2. Copy your video files:
```
assets/videos/receptionist.mp4
assets/videos/voyager.mp4
assets/videos/hydra.mp4
... etc
```

### Step 3: Update HTML

Find the project card in `index.html` and replace the placeholder:

**Before:**
```html
<div class="project-media">
    <div class="media-placeholder">
        <i class="fas fa-video"></i>
        <span>Video Coming Soon</span>
    </div>
</div>
```

**After:**
```html
<div class="project-media">
    <video autoplay loop muted playsinline>
        <source src="assets/videos/your-video.mp4" type="video/mp4">
    </video>
</div>
```

### Using YouTube Videos (Alternative)

For large videos, embed from YouTube:

```html
<div class="project-media">
    <iframe
        src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowfullscreen>
    </iframe>
</div>
```

Replace `VIDEO_ID` with your YouTube video ID (e.g., `dQw4w9WgXcQ`).

---

## Adding Project Images

### Step 1: Prepare Images

- **Format:** WebP (preferred) or JPG/PNG
- **Resolution:** 800x600 or similar aspect ratio
- Compress using TinyPNG or Squoosh

### Step 2: Add to Project

1. Create images folder:
```bash
mkdir -p assets/images
```

2. Add your images:
```
assets/images/project1-thumb.webp
assets/images/project1-gallery1.webp
assets/images/project1-gallery2.webp
```

### Step 3: Update Gallery in HTML

Find the gallery section and replace placeholders:

**Before:**
```html
<div class="project-gallery">
    <div class="gallery-item placeholder">
        <i class="fas fa-image"></i>
    </div>
    <div class="gallery-item placeholder">
        <i class="fas fa-image"></i>
    </div>
    <div class="gallery-item placeholder">
        <i class="fas fa-image"></i>
    </div>
</div>
```

**After:**
```html
<div class="project-gallery">
    <div class="gallery-item">
        <img src="assets/images/project1-gallery1.webp" alt="Project screenshot 1">
    </div>
    <div class="gallery-item">
        <img src="assets/images/project1-gallery2.webp" alt="Project screenshot 2">
    </div>
    <div class="gallery-item">
        <img src="assets/images/project1-gallery3.webp" alt="Project screenshot 3">
    </div>
</div>
```

---

## Updating Project Content

### Project Card Structure

Each project follows this structure in `index.html`:

```html
<div class="project-card" data-category="mobile simulation">
    <div class="project-media">
        <!-- Video or image here -->
    </div>
    <div class="project-content">
        <div class="project-header">
            <h3>Project Title</h3>
            <span class="project-year">2024</span>
        </div>
        <p>Project description goes here...</p>
        <div class="project-tags">
            <span class="tag">ROS2</span>
            <span class="tag">Python</span>
        </div>
        <div class="project-links">
            <a href="https://github.com/username/repo" class="project-link">
                <i class="fab fa-github"></i>
            </a>
            <a href="https://demo-link.com" class="project-link">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    </div>
    <div class="project-gallery">
        <!-- Gallery images here -->
    </div>
</div>
```

### Category Filters

The `data-category` attribute controls filtering. Available categories:
- `mobile` - Mobile robots
- `manipulation` - Robot arms and manipulation
- `simulation` - Simulation projects
- `research` - Research publications

Use multiple categories: `data-category="mobile research"`

---

## Adding a New Project

1. Copy an existing project card in `index.html`
2. Update the content:
   - Title and year
   - Description
   - Tags
   - Category (for filtering)
   - GitHub/demo links
3. Add video/images as described above
4. Commit and push:

```bash
git add .
git commit -m "Add new project: Project Name"
git push
```

---

## Customization

### Changing Colors

Edit CSS variables in `css/style.css`:

```css
:root {
    --primary: #00f0ff;        /* Main accent (cyan) */
    --secondary: #7c3aed;      /* Secondary (purple) */
    --accent: #f72585;         /* Highlight (magenta) */
    --bg-dark: #0a0a0f;        /* Background */
    --bg-card: #12121a;        /* Card background */
}
```

### Updating Contact Info

Edit the contact section in `index.html`:

```html
<a href="mailto:your-email@domain.com">your-email@domain.com</a>
```

### Social Links

Update social media links in the contact section:

```html
<a href="https://github.com/your-username" class="social-link">
    <i class="fab fa-github"></i>
</a>
<a href="https://linkedin.com/in/your-profile" class="social-link">
    <i class="fab fa-linkedin-in"></i>
</a>
```

---

## File Structure

```
xyon-labs/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # All styles
├── js/
│   └── main.js             # JavaScript (3D robots, animations)
├── assets/
│   ├── images/             # Project images (add yours here)
│   ├── videos/             # Project videos (add yours here)
│   └── models/             # 3D models (if any)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages auto-deploy
├── README.md               # This file
└── DEPLOYMENT.md           # Additional deployment info
```

---

## Quick Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub (auto-deploys)
git push

# Pull latest changes
git pull
```

---

## Troubleshooting

### Videos not playing
- Ensure format is MP4 with H.264 codec
- Add `muted` attribute (required for autoplay)
- Check file path is correct

### Images not loading
- Verify file path matches exactly (case-sensitive)
- Check image format is supported (jpg, png, webp, gif)

### Site not updating after push
- Wait 1-2 minutes for GitHub Pages to rebuild
- Check Actions tab for deployment status
- Clear browser cache (Ctrl+Shift+R)

---

## Support

For issues or questions, check:
- Browser console for errors (F12)
- GitHub Actions tab for deployment logs
- Verify all file paths are correct

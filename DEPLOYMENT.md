# Xyon Labs Website - Deployment Guide

## Free Hosting Options

### Option 1: GitHub Pages (Recommended - Completely Free)

1. **Create a GitHub Repository**
   ```bash
   cd xyon-labs
   git init
   git add .
   git commit -m "Initial commit - Xyon Labs website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/xyon-labs.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy your site

3. **Access Your Site**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/xyon-labs/`

4. **Custom Domain (Optional)**
   - Add a `CNAME` file with your domain name
   - Configure DNS records at your domain registrar

### Option 2: Netlify (Free Tier)

1. **Deploy via Netlify Drop**
   - Go to https://app.netlify.com/drop
   - Drag and drop the `xyon-labs` folder
   - Your site is live instantly!

2. **Or Connect to GitHub**
   - Sign up at netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build command: (leave empty - static site)
   - Publish directory: `.`

3. **Free Features**
   - Custom domain support
   - Automatic HTTPS
   - Continuous deployment

### Option 3: Vercel (Free Tier)

1. **Deploy**
   ```bash
   npm i -g vercel
   cd xyon-labs
   vercel
   ```

2. **Or via Dashboard**
   - Go to vercel.com
   - Import your GitHub repository
   - Deploy automatically

### Option 4: Cloudflare Pages (Free Tier)

1. **Connect Repository**
   - Go to Cloudflare Dashboard > Pages
   - Connect your GitHub repository
   - Build output directory: `.`

2. **Benefits**
   - Global CDN
   - Unlimited bandwidth
   - Custom domains

## Adding Content

### Adding Project Videos

Replace the placeholder divs with actual video elements:

```html
<!-- Before -->
<div class="media-placeholder">
    <i class="fas fa-video"></i>
    <span>Video Coming Soon</span>
</div>

<!-- After -->
<video autoplay loop muted playsinline>
    <source src="assets/videos/your-video.mp4" type="video/mp4">
</video>
```

### Adding Project Images

For the gallery items:

```html
<!-- Before -->
<div class="gallery-item placeholder">
    <i class="fas fa-image"></i>
</div>

<!-- After -->
<div class="gallery-item">
    <img src="assets/images/project-image.jpg" alt="Project Image">
</div>
```

### Embedding YouTube Videos

```html
<iframe
    width="100%"
    height="100%"
    src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
</iframe>
```

## Customization

### Changing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary: #00f0ff;        /* Main accent color */
    --secondary: #7c3aed;      /* Secondary accent */
    --accent: #f72585;         /* Highlight color */
    --bg-dark: #0a0a0f;        /* Background dark */
    --bg-card: #12121a;        /* Card background */
}
```

### Adding New Projects

Copy a project card template and modify:

```html
<div class="project-card" data-category="mobile simulation">
    <div class="project-media">
        <!-- Add your video/image here -->
    </div>
    <div class="project-content">
        <div class="project-header">
            <h3>Your Project Name</h3>
            <span class="project-year">2024</span>
        </div>
        <p>Project description...</p>
        <div class="project-tags">
            <span class="tag">Tag1</span>
            <span class="tag">Tag2</span>
        </div>
    </div>
</div>
```

### Updating Contact Information

Edit the contact section in `index.html`:

```html
<a href="mailto:your-email@domain.com">your-email@domain.com</a>
```

## File Structure

```
xyon-labs/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # All styles
├── js/
│   └── main.js             # JavaScript functionality
├── assets/
│   ├── images/             # Project images
│   ├── videos/             # Project videos
│   └── models/             # 3D models (if any)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages workflow
├── .gitignore
└── DEPLOYMENT.md           # This file
```

## Performance Tips

1. **Optimize Images**
   - Use WebP format for better compression
   - Compress images before uploading
   - Use lazy loading for below-fold content

2. **Optimize Videos**
   - Compress videos (H.264 codec recommended)
   - Use YouTube embeds for large videos
   - Consider using video posters

3. **CDN Usage**
   - All external libraries are loaded from CDNs
   - This provides faster loading globally

## Support

For issues or questions:
- Check browser console for errors
- Ensure all file paths are correct
- Verify video formats are web-compatible (MP4 with H.264)

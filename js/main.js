/* ========================================
   XYON LABS - Main JavaScript
   ======================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticles();
    init3DRobot();
    initScrollAnimations();
    initProjectFilters();
    initContactForm();
    initCounters();
    initSmoothScroll();
});

/* ========================================
   NAVIGATION
   ======================================== */

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });
}

/* ========================================
   PARTICLE BACKGROUND
   ======================================== */

function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: rgba(0, 240, 255, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
        pointer-events: none;
    `;
    container.appendChild(particle);

    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0%, 100% {
                transform: translate(0, 0) scale(1);
                opacity: 0.3;
            }
            25% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2);
                opacity: 0.8;
            }
            50% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8);
                opacity: 0.5;
            }
            75% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1);
                opacity: 0.6;
            }
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   3D ROBOT MODEL
   ======================================== */

function init3DRobot() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvas.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f0ff, 1);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x7c3aed, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xf72585, 0.3);
    backLight.position.set(0, -3, -5);
    scene.add(backLight);

    // Create procedural robot
    const robotGroup = new THREE.Group();

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.9,
        roughness: 0.3
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.2
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3
    });

    // Robot Head (Hexagonal)
    const headGeometry = new THREE.CylinderGeometry(0.8, 0.9, 0.6, 6);
    const head = new THREE.Mesh(headGeometry, metalMaterial);
    head.position.y = 3;
    head.rotation.y = Math.PI / 6;
    robotGroup.add(head);

    // Visor
    const visorGeometry = new THREE.BoxGeometry(1.2, 0.2, 0.3);
    const visor = new THREE.Mesh(visorGeometry, glowMaterial);
    visor.position.set(0, 3, 0.5);
    robotGroup.add(visor);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const antenna = new THREE.Mesh(antennaGeometry, metalMaterial);
    antenna.position.set(0.3, 3.5, 0);
    robotGroup.add(antenna);

    const antennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        glowMaterial
    );
    antennaTip.position.set(0.3, 3.8, 0);
    robotGroup.add(antennaTip);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8);
    const neck = new THREE.Mesh(neckGeometry, metalMaterial);
    neck.position.y = 2.5;
    robotGroup.add(neck);

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(1.5, 1.8, 0.8);
    const torso = new THREE.Mesh(torsoGeometry, metalMaterial);
    torso.position.y = 1.4;
    robotGroup.add(torso);

    // Chest light
    const chestLightGeometry = new THREE.CircleGeometry(0.2, 6);
    const chestLight = new THREE.Mesh(chestLightGeometry, glowMaterial);
    chestLight.position.set(0, 1.8, 0.41);
    robotGroup.add(chestLight);

    // Core light
    const coreGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 6);
    const core = new THREE.Mesh(coreGeometry, accentMaterial);
    core.position.set(0, 1.2, 0.41);
    robotGroup.add(core);

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, metalMaterial);
    leftShoulder.position.set(-1, 2, 0);
    robotGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, metalMaterial);
    rightShoulder.position.set(1, 2, 0);
    robotGroup.add(rightShoulder);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1, 8);

    const leftUpperArm = new THREE.Mesh(armGeometry, metalMaterial);
    leftUpperArm.position.set(-1.1, 1.3, 0);
    leftUpperArm.rotation.z = 0.2;
    robotGroup.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(armGeometry, metalMaterial);
    rightUpperArm.position.set(1.1, 1.3, 0);
    rightUpperArm.rotation.z = -0.2;
    robotGroup.add(rightUpperArm);

    // Elbows
    const elbowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const leftElbow = new THREE.Mesh(elbowGeometry, accentMaterial);
    leftElbow.position.set(-1.2, 0.7, 0);
    robotGroup.add(leftElbow);

    const rightElbow = new THREE.Mesh(elbowGeometry, accentMaterial);
    rightElbow.position.set(1.2, 0.7, 0);
    robotGroup.add(rightElbow);

    // Forearms
    const leftForearm = new THREE.Mesh(armGeometry, metalMaterial);
    leftForearm.position.set(-1.25, 0.1, 0);
    leftForearm.rotation.z = 0.1;
    robotGroup.add(leftForearm);

    const rightForearm = new THREE.Mesh(armGeometry, metalMaterial);
    rightForearm.position.set(1.25, 0.1, 0);
    rightForearm.rotation.z = -0.1;
    robotGroup.add(rightForearm);

    // Hands
    const handGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.15);
    const leftHand = new THREE.Mesh(handGeometry, metalMaterial);
    leftHand.position.set(-1.3, -0.5, 0);
    robotGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, metalMaterial);
    rightHand.position.set(1.3, -0.5, 0);
    robotGroup.add(rightHand);

    // Waist
    const waistGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8);
    const waist = new THREE.Mesh(waistGeometry, metalMaterial);
    waist.position.y = 0.35;
    robotGroup.add(waist);

    // Hips
    const hipGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.6);
    const hips = new THREE.Mesh(hipGeometry, metalMaterial);
    hips.position.y = 0;
    robotGroup.add(hips);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1.2, 8);

    const leftUpperLeg = new THREE.Mesh(legGeometry, metalMaterial);
    leftUpperLeg.position.set(-0.4, -0.9, 0);
    robotGroup.add(leftUpperLeg);

    const rightUpperLeg = new THREE.Mesh(legGeometry, metalMaterial);
    rightUpperLeg.position.set(0.4, -0.9, 0);
    robotGroup.add(rightUpperLeg);

    // Knees
    const kneeGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const leftKnee = new THREE.Mesh(kneeGeometry, accentMaterial);
    leftKnee.position.set(-0.4, -1.6, 0);
    robotGroup.add(leftKnee);

    const rightKnee = new THREE.Mesh(kneeGeometry, accentMaterial);
    rightKnee.position.set(0.4, -1.6, 0);
    robotGroup.add(rightKnee);

    // Lower legs
    const leftLowerLeg = new THREE.Mesh(legGeometry, metalMaterial);
    leftLowerLeg.position.set(-0.4, -2.3, 0);
    robotGroup.add(leftLowerLeg);

    const rightLowerLeg = new THREE.Mesh(legGeometry, metalMaterial);
    rightLowerLeg.position.set(0.4, -2.3, 0);
    robotGroup.add(rightLowerLeg);

    // Feet
    const footGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.5);
    const leftFoot = new THREE.Mesh(footGeometry, metalMaterial);
    leftFoot.position.set(-0.4, -3, 0.1);
    robotGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, metalMaterial);
    rightFoot.position.set(0.4, -3, 0.1);
    robotGroup.add(rightFoot);

    // Position the robot
    robotGroup.position.y = 1;
    scene.add(robotGroup);

    // Ground plane with grid
    const gridHelper = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1a1a2e);
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Floating rings
    const ringGeometry = new THREE.TorusGeometry(3, 0.02, 8, 64);
    const ring1 = new THREE.Mesh(ringGeometry, glowMaterial);
    ring1.position.y = 0;
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, accentMaterial);
    ring2.position.y = 0.5;
    ring2.rotation.x = Math.PI / 2;
    ring2.scale.set(0.8, 0.8, 0.8);
    scene.add(ring2);

    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Animate robot parts
        antennaTip.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
        chestLight.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
        core.rotation.z = time;

        // Float animation
        robotGroup.position.y = 1 + Math.sin(time) * 0.1;

        // Ring rotation
        ring1.rotation.z = time * 0.5;
        ring2.rotation.z = -time * 0.3;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */

function initScrollAnimations() {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections on scroll
    const sections = document.querySelectorAll('.about-card, .research-card, .project-card');

    sections.forEach((section, index) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.1 % 0.4
        });
    });

    // Animate section headers
    const headers = document.querySelectorAll('.section-header');
    headers.forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 0.8
        });
    });

    // Parallax effect for hero grid
    gsap.to('.hero-grid', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 100,
        opacity: 0
    });
}

/* ========================================
   PROJECT FILTERS
   ======================================== */

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter projects
            projects.forEach(project => {
                const categories = project.dataset.category.split(' ');

                if (filter === 'all' || categories.includes(filter)) {
                    gsap.to(project, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        display: 'block'
                    });
                } else {
                    gsap.to(project, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.4,
                        onComplete: () => {
                            project.style.display = 'none';
                        }
                    });
                }
            });
        });
    });
}

/* ========================================
   CONTACT FORM
   ======================================== */

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Simulate form submission
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            btn.style.background = '#22c55e';

            // Reset form
            setTimeout(() => {
                form.reset();
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }, 2000);
    });
}

/* ========================================
   COUNTER ANIMATION
   ======================================== */

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/* ========================================
   XYON LABS - Main JavaScript
   ======================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticles();
    init3DRobots();
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
   3D ROBOT MODELS - SWAPPABLE
   ======================================== */

let currentRobot = 'humanoid';
let scene, camera, renderer, controls;
let robotGroups = {};
let autoSwitchInterval;
let switchTimer = 10;
let timerInterval;

const robotInfo = {
    humanoid: {
        name: 'Unitree H1 Humanoid',
        type: 'Bipedal Platform'
    },
    quadruped: {
        name: 'Unitree Go2 Quadruped',
        type: 'Legged Robot Dog'
    },
    arm: {
        name: 'Kinova Gen3 Arm',
        type: '7-DOF Manipulator'
    }
};

function init3DRobots() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvas.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Lighting
    setupLighting();

    // Create all robot models
    createHumanoidRobot();
    createQuadrupedRobot();
    createRobotArm();

    // Ground plane with grid
    const gridHelper = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1a1a2e);
    gridHelper.position.y = -3;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Floating rings
    createFloatingRings();

    // Show initial robot
    showRobot('humanoid');

    // Setup robot selector buttons
    setupRobotSelector();

    // Start auto-switch timer
    startAutoSwitch();

    // Animation loop
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

function setupLighting() {
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
}

function createFloatingRings() {
    const ringGeometry = new THREE.TorusGeometry(4, 0.02, 8, 64);

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

    const ring1 = new THREE.Mesh(ringGeometry, glowMaterial);
    ring1.position.y = -1;
    ring1.rotation.x = Math.PI / 2;
    ring1.name = 'ring1';
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, accentMaterial);
    ring2.position.y = -0.5;
    ring2.rotation.x = Math.PI / 2;
    ring2.scale.set(0.7, 0.7, 0.7);
    ring2.name = 'ring2';
    scene.add(ring2);
}

/* ========================================
   HUMANOID ROBOT (Unitree H1 Style)
   ======================================== */

function createHumanoidRobot() {
    const robotGroup = new THREE.Group();

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

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.5
    });

    // Head - Sleek helmet design
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const head = new THREE.Mesh(headGeometry, whiteMaterial);
    head.scale.set(1, 0.9, 0.85);
    head.position.y = 3.2;
    robotGroup.add(head);

    // Visor
    const visorGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.2);
    const visor = new THREE.Mesh(visorGeometry, glowMaterial);
    visor.position.set(0, 3.2, 0.35);
    robotGroup.add(visor);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16);
    const neck = new THREE.Mesh(neckGeometry, metalMaterial);
    neck.position.y = 2.75;
    robotGroup.add(neck);

    // Torso - Main body
    const torsoGeometry = new THREE.BoxGeometry(0.9, 1.2, 0.5);
    const torso = new THREE.Mesh(torsoGeometry, whiteMaterial);
    torso.position.y = 2;
    robotGroup.add(torso);

    // Chest panel
    const chestPanelGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.1);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, metalMaterial);
    chestPanel.position.set(0, 2.1, 0.25);
    robotGroup.add(chestPanel);

    // Core light
    const coreGeometry = new THREE.CircleGeometry(0.15, 32);
    const core = new THREE.Mesh(coreGeometry, glowMaterial);
    core.position.set(0, 2.2, 0.31);
    robotGroup.add(core);

    // Lower torso
    const lowerTorsoGeometry = new THREE.BoxGeometry(0.7, 0.4, 0.4);
    const lowerTorso = new THREE.Mesh(lowerTorsoGeometry, metalMaterial);
    lowerTorso.position.y = 1.2;
    robotGroup.add(lowerTorso);

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.2, 16, 16);

    const leftShoulder = new THREE.Mesh(shoulderGeometry, metalMaterial);
    leftShoulder.position.set(-0.6, 2.5, 0);
    robotGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, metalMaterial);
    rightShoulder.position.set(0.6, 2.5, 0);
    robotGroup.add(rightShoulder);

    // Upper Arms
    const upperArmGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.6, 16);

    const leftUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    leftUpperArm.position.set(-0.65, 2.1, 0);
    leftUpperArm.rotation.z = 0.1;
    robotGroup.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    rightUpperArm.position.set(0.65, 2.1, 0);
    rightUpperArm.rotation.z = -0.1;
    robotGroup.add(rightUpperArm);

    // Elbows
    const elbowGeometry = new THREE.SphereGeometry(0.1, 16, 16);

    const leftElbow = new THREE.Mesh(elbowGeometry, accentMaterial);
    leftElbow.position.set(-0.7, 1.7, 0);
    robotGroup.add(leftElbow);

    const rightElbow = new THREE.Mesh(elbowGeometry, accentMaterial);
    rightElbow.position.set(0.7, 1.7, 0);
    robotGroup.add(rightElbow);

    // Lower Arms
    const lowerArmGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 16);

    const leftLowerArm = new THREE.Mesh(lowerArmGeometry, metalMaterial);
    leftLowerArm.position.set(-0.72, 1.35, 0);
    robotGroup.add(leftLowerArm);

    const rightLowerArm = new THREE.Mesh(lowerArmGeometry, metalMaterial);
    rightLowerArm.position.set(0.72, 1.35, 0);
    robotGroup.add(rightLowerArm);

    // Hands
    const handGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.08);

    const leftHand = new THREE.Mesh(handGeometry, metalMaterial);
    leftHand.position.set(-0.72, 1, 0);
    robotGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, metalMaterial);
    rightHand.position.set(0.72, 1, 0);
    robotGroup.add(rightHand);

    // Hips
    const hipGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.35);
    const hips = new THREE.Mesh(hipGeometry, metalMaterial);
    hips.position.y = 0.9;
    robotGroup.add(hips);

    // Upper Legs
    const upperLegGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 16);

    const leftUpperLeg = new THREE.Mesh(upperLegGeometry, whiteMaterial);
    leftUpperLeg.position.set(-0.22, 0.35, 0);
    robotGroup.add(leftUpperLeg);

    const rightUpperLeg = new THREE.Mesh(upperLegGeometry, whiteMaterial);
    rightUpperLeg.position.set(0.22, 0.35, 0);
    robotGroup.add(rightUpperLeg);

    // Knees
    const kneeGeometry = new THREE.SphereGeometry(0.12, 16, 16);

    const leftKnee = new THREE.Mesh(kneeGeometry, accentMaterial);
    leftKnee.position.set(-0.22, -0.15, 0);
    robotGroup.add(leftKnee);

    const rightKnee = new THREE.Mesh(kneeGeometry, accentMaterial);
    rightKnee.position.set(0.22, -0.15, 0);
    robotGroup.add(rightKnee);

    // Lower Legs
    const lowerLegGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.8, 16);

    const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, metalMaterial);
    leftLowerLeg.position.set(-0.22, -0.65, 0);
    robotGroup.add(leftLowerLeg);

    const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, metalMaterial);
    rightLowerLeg.position.set(0.22, -0.65, 0);
    robotGroup.add(rightLowerLeg);

    // Feet
    const footGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.3);

    const leftFoot = new THREE.Mesh(footGeometry, metalMaterial);
    leftFoot.position.set(-0.22, -1.15, 0.05);
    robotGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, metalMaterial);
    rightFoot.position.set(0.22, -1.15, 0.05);
    robotGroup.add(rightFoot);

    // Position robot
    robotGroup.position.y = 1;
    robotGroup.visible = false;
    robotGroups['humanoid'] = robotGroup;
    scene.add(robotGroup);
}

/* ========================================
   QUADRUPED ROBOT (Unitree Go2 Style)
   ======================================== */

function createQuadrupedRobot() {
    const robotGroup = new THREE.Group();

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
        color: 0xf72585,
        emissive: 0xf72585,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3
    });

    const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0f,
        metalness: 0.8,
        roughness: 0.4
    });

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.6);
    const body = new THREE.Mesh(bodyGeometry, blackMaterial);
    body.position.y = 0.8;
    robotGroup.add(body);

    // Body top panel
    const topPanelGeometry = new THREE.BoxGeometry(1.6, 0.05, 0.5);
    const topPanel = new THREE.Mesh(topPanelGeometry, metalMaterial);
    topPanel.position.set(0, 1.02, 0);
    robotGroup.add(topPanel);

    // Head section
    const headGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.4);
    const head = new THREE.Mesh(headGeometry, blackMaterial);
    head.position.set(0.85, 0.95, 0);
    robotGroup.add(head);

    // Camera/sensor eyes
    const eyeGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);

    const leftEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(0.85, 0.95, 0.22);
    robotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(1, 0.95, 0.22);
    robotGroup.add(rightEye);

    // Lidar on top
    const lidarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 32);
    const lidar = new THREE.Mesh(lidarGeometry, glowMaterial);
    lidar.position.set(0, 1.1, 0);
    robotGroup.add(lidar);

    // Create legs (4 legs)
    const legPositions = [
        { x: 0.65, z: 0.35, name: 'FR' },   // Front Right
        { x: 0.65, z: -0.35, name: 'FL' },  // Front Left
        { x: -0.65, z: 0.35, name: 'BR' },  // Back Right
        { x: -0.65, z: -0.35, name: 'BL' }  // Back Left
    ];

    legPositions.forEach((pos, index) => {
        // Hip joint
        const hipGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.2);
        const hip = new THREE.Mesh(hipGeometry, metalMaterial);
        hip.position.set(pos.x, 0.65, pos.z);
        robotGroup.add(hip);

        // Upper leg
        const upperLegGeometry = new THREE.BoxGeometry(0.08, 0.35, 0.12);
        const upperLeg = new THREE.Mesh(upperLegGeometry, blackMaterial);
        upperLeg.position.set(pos.x, 0.4, pos.z);
        robotGroup.add(upperLeg);

        // Knee joint
        const kneeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const knee = new THREE.Mesh(kneeGeometry, accentMaterial);
        knee.position.set(pos.x, 0.2, pos.z);
        robotGroup.add(knee);

        // Lower leg
        const lowerLegGeometry = new THREE.BoxGeometry(0.06, 0.4, 0.1);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, metalMaterial);
        lowerLeg.position.set(pos.x, -0.05, pos.z);
        robotGroup.add(lowerLeg);

        // Foot
        const footGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const foot = new THREE.Mesh(footGeometry, blackMaterial);
        foot.position.set(pos.x, -0.3, pos.z);
        robotGroup.add(foot);
    });

    // Tail/back sensor
    const tailGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.1);
    const tail = new THREE.Mesh(tailGeometry, metalMaterial);
    tail.position.set(-1, 0.85, 0);
    robotGroup.add(tail);

    // Position robot
    robotGroup.position.y = 0.5;
    robotGroup.visible = false;
    robotGroups['quadruped'] = robotGroup;
    scene.add(robotGroup);
}

/* ========================================
   ROBOT ARM (Kinova Gen3 Style)
   ======================================== */

function createRobotArm() {
    const robotGroup = new THREE.Group();

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
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

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        metalness: 0.3,
        roughness: 0.5
    });

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.15, 32);
    const base = new THREE.Mesh(baseGeometry, metalMaterial);
    base.position.y = -0.8;
    robotGroup.add(base);

    // Base ring light
    const baseRingGeometry = new THREE.TorusGeometry(0.55, 0.02, 8, 32);
    const baseRing = new THREE.Mesh(baseRingGeometry, glowMaterial);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -0.72;
    robotGroup.add(baseRing);

    // Joint 1 (Base rotation)
    const joint1Geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 32);
    const joint1 = new THREE.Mesh(joint1Geometry, whiteMaterial);
    joint1.position.y = -0.5;
    robotGroup.add(joint1);

    // Link 1
    const link1Geometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 32);
    const link1 = new THREE.Mesh(link1Geometry, metalMaterial);
    link1.position.y = 0;
    robotGroup.add(link1);

    // Joint 2
    const joint2Geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const joint2 = new THREE.Mesh(joint2Geometry, accentMaterial);
    joint2.position.y = 0.45;
    robotGroup.add(joint2);

    // Link 2
    const link2Geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 32);
    const link2 = new THREE.Mesh(link2Geometry, whiteMaterial);
    link2.position.set(0.25, 0.8, 0);
    link2.rotation.z = -0.5;
    robotGroup.add(link2);

    // Joint 3
    const joint3Geometry = new THREE.SphereGeometry(0.12, 32, 32);
    const joint3 = new THREE.Mesh(joint3Geometry, accentMaterial);
    joint3.position.set(0.55, 1.1, 0);
    robotGroup.add(joint3);

    // Link 3
    const link3Geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 32);
    const link3 = new THREE.Mesh(link3Geometry, metalMaterial);
    link3.position.set(0.8, 1.35, 0);
    link3.rotation.z = -0.8;
    robotGroup.add(link3);

    // Joint 4 (Wrist)
    const joint4Geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const joint4 = new THREE.Mesh(joint4Geometry, glowMaterial);
    joint4.position.set(1, 1.55, 0);
    robotGroup.add(joint4);

    // Wrist rotation
    const wristGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 32);
    const wrist = new THREE.Mesh(wristGeometry, whiteMaterial);
    wrist.position.set(1.1, 1.6, 0);
    wrist.rotation.z = Math.PI / 2;
    robotGroup.add(wrist);

    // Gripper base
    const gripperBaseGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.12);
    const gripperBase = new THREE.Mesh(gripperBaseGeometry, metalMaterial);
    gripperBase.position.set(1.25, 1.6, 0);
    robotGroup.add(gripperBase);

    // Gripper fingers
    const fingerGeometry = new THREE.BoxGeometry(0.02, 0.15, 0.03);

    const leftFinger = new THREE.Mesh(fingerGeometry, metalMaterial);
    leftFinger.position.set(1.33, 1.55, 0.04);
    robotGroup.add(leftFinger);

    const rightFinger = new THREE.Mesh(fingerGeometry, metalMaterial);
    rightFinger.position.set(1.33, 1.55, -0.04);
    robotGroup.add(rightFinger);

    // Finger tips (glowing)
    const tipGeometry = new THREE.BoxGeometry(0.025, 0.03, 0.035);

    const leftTip = new THREE.Mesh(tipGeometry, glowMaterial);
    leftTip.position.set(1.33, 1.46, 0.04);
    robotGroup.add(leftTip);

    const rightTip = new THREE.Mesh(tipGeometry, glowMaterial);
    rightTip.position.set(1.33, 1.46, -0.04);
    robotGroup.add(rightTip);

    // Position robot
    robotGroup.position.set(-0.5, 0.5, 0);
    robotGroup.visible = false;
    robotGroups['arm'] = robotGroup;
    scene.add(robotGroup);
}

/* ========================================
   ROBOT SWITCHING LOGIC
   ======================================== */

function showRobot(robotType) {
    // Hide all robots with fade out
    Object.keys(robotGroups).forEach(key => {
        robotGroups[key].visible = false;
    });

    // Show selected robot
    if (robotGroups[robotType]) {
        robotGroups[robotType].visible = true;
        currentRobot = robotType;

        // Update robot info display
        const info = robotInfo[robotType];
        const nameEl = document.querySelector('.robot-name');
        const typeEl = document.querySelector('.robot-type');

        if (nameEl && typeEl) {
            nameEl.textContent = info.name;
            typeEl.textContent = info.type;
        }

        // Update selector buttons
        document.querySelectorAll('.robot-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.robot === robotType) {
                btn.classList.add('active');
            }
        });

        // Adjust camera position based on robot
        if (robotType === 'quadruped') {
            camera.position.set(3, 2, 5);
        } else if (robotType === 'arm') {
            camera.position.set(2, 2, 5);
        } else {
            camera.position.set(0, 2, 8);
        }
    }
}

function setupRobotSelector() {
    const buttons = document.querySelectorAll('.robot-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const robotType = btn.dataset.robot;
            showRobot(robotType);
            resetAutoSwitch();
        });
    });
}

function startAutoSwitch() {
    // Update timer display
    const timerEl = document.getElementById('switch-timer');
    switchTimer = 10;

    timerInterval = setInterval(() => {
        switchTimer--;
        if (timerEl) timerEl.textContent = switchTimer;

        if (switchTimer <= 0) {
            switchToNextRobot();
            switchTimer = 10;
        }
    }, 1000);
}

function resetAutoSwitch() {
    switchTimer = 10;
    const timerEl = document.getElementById('switch-timer');
    if (timerEl) timerEl.textContent = switchTimer;
}

function switchToNextRobot() {
    const robotTypes = ['humanoid', 'quadruped', 'arm'];
    const currentIndex = robotTypes.indexOf(currentRobot);
    const nextIndex = (currentIndex + 1) % robotTypes.length;
    showRobot(robotTypes[nextIndex]);
}

/* ========================================
   ANIMATION LOOP
   ======================================== */

let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Animate glowing elements
    Object.keys(robotGroups).forEach(key => {
        const group = robotGroups[key];
        if (group.visible) {
            group.traverse(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
                }
            });

            // Float animation
            group.position.y = (key === 'quadruped' ? 0.5 : key === 'arm' ? 0.5 : 1) + Math.sin(time) * 0.1;
        }
    });

    // Ring rotation
    const ring1 = scene.getObjectByName('ring1');
    const ring2 = scene.getObjectByName('ring2');
    if (ring1) ring1.rotation.z = time * 0.5;
    if (ring2) ring2.rotation.z = -time * 0.3;

    controls.update();
    renderer.render(scene, camera);
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

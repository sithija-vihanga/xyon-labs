/* ========================================
   XYON LABS - Main JavaScript
   Real 3D Robot Models with Animations
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

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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

    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2); opacity: 0.8; }
            50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8); opacity: 0.5; }
            75% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1); opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   3D ROBOT MODELS - REAL ANIMATED MODELS
   ======================================== */

let currentRobot = 'humanoid';
let scene, camera, renderer, controls;
let robotModels = {};
let mixers = {};
let currentMixer = null;
let clock;
let switchTimer = 10;
let timerInterval;
let loadingManager;
let modelsLoaded = 0;
const totalModels = 3;

const robotInfo = {
    humanoid: {
        name: 'Humanoid Robot',
        type: 'Bipedal Platform',
        animation: 'Walking'
    },
    quadruped: {
        name: 'Quadruped Robot',
        type: 'Four-Legged Platform',
        animation: 'Running'
    },
    arm: {
        name: 'Industrial Robot Arm',
        type: '6-DOF Manipulator',
        animation: 'Operating'
    }
};

// Model URLs from three.js examples and CDN
const modelURLs = {
    humanoid: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    soldier: 'https://threejs.org/examples/models/gltf/Soldier.glb',
    horse: 'https://threejs.org/examples/models/gltf/Horse.glb'
};

function init3DRobots() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    clock = new THREE.Clock();

    // Scene setup
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 1, 0);

    // Lighting
    setupLighting();

    // Ground
    createGround();

    // Floating rings
    createFloatingRings();

    // Show loading state
    showLoadingState();

    // Load all models
    loadAllModels();

    // Setup robot selector buttons
    setupRobotSelector();

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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    // Cyan accent light
    const accentLight1 = new THREE.PointLight(0x00f0ff, 1, 10);
    accentLight1.position.set(-3, 2, 3);
    scene.add(accentLight1);

    // Purple accent light
    const accentLight2 = new THREE.PointLight(0x7c3aed, 0.8, 10);
    accentLight2.position.set(3, 2, -3);
    scene.add(accentLight2);

    // Pink rim light
    const rimLight = new THREE.PointLight(0xf72585, 0.5, 8);
    rimLight.position.set(0, 3, -5);
    scene.add(rimLight);
}

function createGround() {
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1a1a2e);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({
        opacity: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createFloatingRings() {
    const ringGeometry = new THREE.TorusGeometry(3, 0.02, 8, 64);

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
    ring1.position.y = 0.1;
    ring1.rotation.x = Math.PI / 2;
    ring1.name = 'ring1';
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, accentMaterial);
    ring2.position.y = 0.2;
    ring2.rotation.x = Math.PI / 2;
    ring2.scale.set(0.7, 0.7, 0.7);
    ring2.name = 'ring2';
    scene.add(ring2);
}

function showLoadingState() {
    const robotName = document.querySelector('.robot-name');
    const robotType = document.querySelector('.robot-type');
    if (robotName) robotName.textContent = 'Loading Models...';
    if (robotType) robotType.textContent = 'Please wait';
}

function loadAllModels() {
    const loader = new THREE.GLTFLoader();

    // Load Humanoid Robot (RobotExpressive)
    loader.load(
        modelURLs.humanoid,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.8, 0.8, 0.8);
            model.position.set(0, 0, 0);
            model.visible = false;

            // Enable shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Setup animation mixer
            const mixer = new THREE.AnimationMixer(model);
            mixers['humanoid'] = mixer;

            // Store animations
            model.animations = gltf.animations;

            // Find and play walking animation
            const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walking');
            if (walkClip) {
                const action = mixer.clipAction(walkClip);
                action.play();
            } else if (gltf.animations.length > 0) {
                // Play first animation if Walking not found
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            robotModels['humanoid'] = model;
            scene.add(model);
            onModelLoaded('humanoid');
        },
        (progress) => {
            console.log('Humanoid loading:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
        },
        (error) => {
            console.error('Error loading humanoid:', error);
            createFallbackHumanoid();
            onModelLoaded('humanoid');
        }
    );

    // Load Quadruped (Horse for walking animation)
    loader.load(
        modelURLs.horse,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.015, 0.015, 0.015);
            model.position.set(0, 0, 0);
            model.visible = false;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Make it look more robotic with metallic material
                    if (child.material) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x2a2a3a,
                            metalness: 0.8,
                            roughness: 0.3
                        });
                    }
                }
            });

            const mixer = new THREE.AnimationMixer(model);
            mixers['quadruped'] = mixer;
            model.animations = gltf.animations;

            if (gltf.animations.length > 0) {
                const action = mixer.clipAction(gltf.animations[0]);
                action.setEffectiveTimeScale(0.8);
                action.play();
            }

            robotModels['quadruped'] = model;
            scene.add(model);
            onModelLoaded('quadruped');
        },
        (progress) => {
            console.log('Quadruped loading:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
        },
        (error) => {
            console.error('Error loading quadruped:', error);
            createFallbackQuadruped();
            onModelLoaded('quadruped');
        }
    );

    // Load Soldier for Arm-like motion (or create procedural arm)
    loader.load(
        modelURLs.soldier,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            model.visible = false;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const mixer = new THREE.AnimationMixer(model);
            mixers['arm'] = mixer;
            model.animations = gltf.animations;

            // Find run or idle animation
            const runClip = THREE.AnimationClip.findByName(gltf.animations, 'Run');
            const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');

            if (runClip) {
                const action = mixer.clipAction(runClip);
                action.play();
            } else if (idleClip) {
                const action = mixer.clipAction(idleClip);
                action.play();
            } else if (gltf.animations.length > 0) {
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            robotModels['arm'] = model;
            scene.add(model);
            onModelLoaded('arm');
        },
        (progress) => {
            console.log('Soldier loading:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
        },
        (error) => {
            console.error('Error loading soldier:', error);
            createFallbackArm();
            onModelLoaded('arm');
        }
    );
}

function onModelLoaded(modelName) {
    modelsLoaded++;
    console.log(`Model ${modelName} loaded. Total: ${modelsLoaded}/${totalModels}`);

    if (modelsLoaded >= totalModels) {
        // All models loaded, show first one
        showRobot('humanoid');
        startAutoSwitch();
    }
}

/* ========================================
   FALLBACK PROCEDURAL MODELS
   ======================================== */

function createFallbackHumanoid() {
    const robotGroup = new THREE.Group();

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.9,
        roughness: 0.3
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.5
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.5
    });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), whiteMaterial);
    head.position.y = 1.9;
    robotGroup.add(head);

    // Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), glowMaterial);
    visor.position.set(0, 1.9, 0.2);
    robotGroup.add(visor);

    // Body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), whiteMaterial);
    torso.position.y = 1.35;
    robotGroup.add(torso);

    // Core
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), glowMaterial);
    core.position.set(0, 1.4, 0.16);
    robotGroup.add(core);

    // Arms
    const armGeom = new THREE.CylinderGeometry(0.05, 0.04, 0.4, 16);
    const leftArm = new THREE.Mesh(armGeom, metalMaterial);
    leftArm.position.set(-0.35, 1.2, 0);
    robotGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, metalMaterial);
    rightArm.position.set(0.35, 1.2, 0);
    robotGroup.add(rightArm);

    // Legs
    const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.5, 16);
    const leftLeg = new THREE.Mesh(legGeom, metalMaterial);
    leftLeg.position.set(-0.12, 0.7, 0);
    robotGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, metalMaterial);
    rightLeg.position.set(0.12, 0.7, 0);
    robotGroup.add(rightLeg);

    // Feet
    const footGeom = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    const leftFoot = new THREE.Mesh(footGeom, metalMaterial);
    leftFoot.position.set(-0.12, 0.4, 0.02);
    robotGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeom, metalMaterial);
    rightFoot.position.set(0.12, 0.4, 0.02);
    robotGroup.add(rightFoot);

    robotGroup.position.y = -0.4;
    robotGroup.visible = false;
    robotModels['humanoid'] = robotGroup;
    scene.add(robotGroup);

    // Create simple animation
    mixers['humanoid'] = createSimpleAnimationMixer(robotGroup, 'bob');
}

function createFallbackQuadruped() {
    const robotGroup = new THREE.Group();

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0f,
        metalness: 0.8,
        roughness: 0.4
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.5
    });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.25, 0.4), metalMaterial);
    body.position.y = 0.6;
    robotGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.25), metalMaterial);
    head.position.set(0.5, 0.7, 0);
    robotGroup.add(head);

    // Eyes
    const eye1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), glowMaterial);
    eye1.rotation.x = Math.PI / 2;
    eye1.position.set(0.5, 0.7, 0.14);
    robotGroup.add(eye1);

    const eye2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), glowMaterial);
    eye2.rotation.x = Math.PI / 2;
    eye2.position.set(0.6, 0.7, 0.14);
    robotGroup.add(eye2);

    // Legs
    const legPositions = [
        { x: 0.35, z: 0.18 },
        { x: 0.35, z: -0.18 },
        { x: -0.35, z: 0.18 },
        { x: -0.35, z: -0.18 }
    ];

    legPositions.forEach(pos => {
        const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.08), metalMaterial);
        upperLeg.position.set(pos.x, 0.4, pos.z);
        robotGroup.add(upperLeg);

        const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.06), metalMaterial);
        lowerLeg.position.set(pos.x, 0.15, pos.z);
        robotGroup.add(lowerLeg);
    });

    robotGroup.visible = false;
    robotModels['quadruped'] = robotGroup;
    scene.add(robotGroup);

    mixers['quadruped'] = createSimpleAnimationMixer(robotGroup, 'bob');
}

function createFallbackArm() {
    const robotGroup = new THREE.Group();

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        metalness: 0.9,
        roughness: 0.3
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.5
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.3
    });

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.1, 32), metalMaterial);
    base.position.y = 0.05;
    robotGroup.add(base);

    // Base ring
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.02, 8, 32), glowMaterial);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.1;
    robotGroup.add(baseRing);

    // Joint 1
    const joint1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 32), metalMaterial);
    joint1.position.y = 0.2;
    robotGroup.add(joint1);

    // Link 1
    const link1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 32), metalMaterial);
    link1.position.y = 0.6;
    robotGroup.add(link1);

    // Joint 2
    const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), accentMaterial);
    joint2.position.y = 0.95;
    robotGroup.add(joint2);

    // Link 2
    const link2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 32), metalMaterial);
    link2.position.set(0.2, 1.2, 0);
    link2.rotation.z = -0.5;
    robotGroup.add(link2);

    // Joint 3
    const joint3 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), accentMaterial);
    joint3.position.set(0.45, 1.4, 0);
    robotGroup.add(joint3);

    // Gripper
    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.08), metalMaterial);
    gripper.position.set(0.6, 1.45, 0);
    robotGroup.add(gripper);

    // Gripper tips
    const tip1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), glowMaterial);
    tip1.position.set(0.68, 1.4, 0.03);
    robotGroup.add(tip1);

    const tip2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), glowMaterial);
    tip2.position.set(0.68, 1.4, -0.03);
    robotGroup.add(tip2);

    robotGroup.position.set(-0.3, 0, 0);
    robotGroup.visible = false;
    robotModels['arm'] = robotGroup;
    scene.add(robotGroup);

    mixers['arm'] = createSimpleAnimationMixer(robotGroup, 'rotate');
}

function createSimpleAnimationMixer(group, type) {
    // Return a simple object that mimics mixer behavior
    return {
        update: (delta) => {
            const time = clock.getElapsedTime();
            if (type === 'bob') {
                group.position.y = (group.position.y || 0) + Math.sin(time * 2) * 0.001;
            } else if (type === 'rotate') {
                group.rotation.y = Math.sin(time * 0.5) * 0.3;
            }
        }
    };
}

/* ========================================
   ROBOT SWITCHING LOGIC
   ======================================== */

function showRobot(robotType) {
    // Hide all robots
    Object.keys(robotModels).forEach(key => {
        if (robotModels[key]) {
            robotModels[key].visible = false;
        }
    });

    // Show selected robot
    if (robotModels[robotType]) {
        robotModels[robotType].visible = true;
        currentRobot = robotType;
        currentMixer = mixers[robotType];

        // Update robot info display
        const info = robotInfo[robotType];
        const nameEl = document.querySelector('.robot-name');
        const typeEl = document.querySelector('.robot-type');

        if (nameEl && typeEl) {
            nameEl.textContent = info.name;
            typeEl.textContent = info.type + ' - ' + info.animation;
        }

        // Update selector buttons
        document.querySelectorAll('.robot-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.robot === robotType) {
                btn.classList.add('active');
            }
        });

        // Adjust camera based on robot type
        if (robotType === 'quadruped') {
            camera.position.set(2, 1, 3);
            controls.target.set(0, 0.5, 0);
        } else if (robotType === 'arm') {
            camera.position.set(2, 1.5, 3);
            controls.target.set(0, 1, 0);
        } else {
            camera.position.set(0, 1.5, 4);
            controls.target.set(0, 1, 0);
        }
        controls.update();
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

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Update current mixer (animation)
    if (currentMixer && currentMixer.update) {
        currentMixer.update(delta);
    }

    // Ring rotation
    const ring1 = scene.getObjectByName('ring1');
    const ring2 = scene.getObjectByName('ring2');
    if (ring1) ring1.rotation.z = time * 0.3;
    if (ring2) ring2.rotation.z = -time * 0.2;

    controls.update();
    renderer.render(scene, camera);
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

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
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

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

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            btn.style.background = '#22c55e';

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

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const stepTime = 2000 / 50;

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
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

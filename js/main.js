/* ========================================
   XYON LABS - Main JavaScript
   Realistic Robot Models with Animations
   Unitree H1, Unitree Go2, Kinova Gen3
   ======================================== */

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
        navbar.classList.toggle('scrolled', window.scrollY > 100);
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
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(0, 240, 255, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float${i} ${Math.random() * 10 + 10}s linear infinite;
            pointer-events: none;
        `;
        container.appendChild(particle);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes float${i} {
                0%, 100% { transform: translate(0, 0); opacity: 0.3; }
                50% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px); opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ========================================
   3D ROBOT SYSTEM
   ======================================== */

let currentRobot = 'humanoid';
let scene, camera, renderer, controls, clock;
let robots = {};
let animationData = {};
let switchTimer = 10;
let timerInterval;

const robotInfo = {
    humanoid: {
        name: 'Unitree H1',
        type: 'Humanoid Robot',
        specs: '1.8m tall • 47kg • 19 DOF'
    },
    quadruped: {
        name: 'Unitree Go2',
        type: 'Quadruped Robot',
        specs: '0.4m tall • 15kg • 12 DOF'
    },
    arm: {
        name: 'Kinova Gen3',
        type: 'Robot Manipulator',
        specs: '7-DOF • 4kg payload • 902mm reach'
    }
};

function init3DRobots() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    clock = new THREE.Clock();
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    canvas.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0.8, 0);

    setupLighting();
    createEnvironment();

    // Create all robots
    createUnitreeH1();
    createUnitreeGo2();
    createKinovaGen3();

    // Show first robot
    showRobot('humanoid');
    setupRobotSelector();
    startAutoSwitch();
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

function setupLighting() {
    // Ambient
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    // Cyan accent
    const cyanLight = new THREE.PointLight(0x00f0ff, 0.8, 8);
    cyanLight.position.set(-2, 1.5, 2);
    scene.add(cyanLight);

    // Purple accent
    const purpleLight = new THREE.PointLight(0x7c3aed, 0.6, 8);
    purpleLight.position.set(2, 1, -2);
    scene.add(purpleLight);
}

function createEnvironment() {
    // Grid
    const grid = new THREE.GridHelper(15, 30, 0x00f0ff, 0x151520);
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    scene.add(grid);

    // Ground for shadows
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15),
        new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.2 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.01, 8, 64), ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.01;
    ring1.name = 'ring1';
    scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.01, 8, 64), ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.02;
    ring2.name = 'ring2';
    scene.add(ring2);
}

/* ========================================
   UNITREE H1 HUMANOID
   ======================================== */

function createUnitreeH1() {
    const robot = new THREE.Group();

    // Materials - Unitree style (black/dark gray with orange accents)
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
    const darkGrayMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.5, roughness: 0.3, emissive: 0xff6600, emissiveIntensity: 0.2 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });

    // HEAD - Sleek helmet design
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.72;

    const headMain = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.2), blackMat);
    headGroup.add(headMain);

    // Face screen/visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), screenMat);
    visor.position.set(0, 0, 0.11);
    headGroup.add(visor);

    // Sensors on top
    const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16), darkGrayMat);
    sensor.position.set(0, 0.11, 0);
    headGroup.add(sensor);

    robot.add(headGroup);
    animationData.humanoid = { head: headGroup };

    // NECK
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.08, 16), darkGrayMat);
    neck.position.y = 1.58;
    robot.add(neck);

    // TORSO - Boxy industrial design
    const torsoUpper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.2), blackMat);
    torsoUpper.position.y = 1.4;
    torsoUpper.castShadow = true;
    robot.add(torsoUpper);

    // Chest detail - Orange accent stripe
    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.01), orangeMat);
    chestStripe.position.set(0, 1.45, 0.105);
    robot.add(chestStripe);

    // Core/battery pack
    const torsoMid = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.18), darkGrayMat);
    torsoMid.position.y = 1.15;
    torsoMid.castShadow = true;
    robot.add(torsoMid);

    // Hip unit
    const hipBox = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.16), blackMat);
    hipBox.position.y = 0.96;
    robot.add(hipBox);

    // SHOULDERS
    const shoulderGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
    shoulderGeom.rotateZ(Math.PI / 2);

    const leftShoulder = new THREE.Mesh(shoulderGeom, darkGrayMat);
    leftShoulder.position.set(-0.26, 1.42, 0);
    robot.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeom, darkGrayMat);
    rightShoulder.position.set(0.26, 1.42, 0);
    robot.add(rightShoulder);

    // ARMS - with proper pivot points at shoulder
    const createArm = (side) => {
        const x = side === 'left' ? -0.32 : 0.32;

        // Arm group positioned at shoulder joint for proper rotation
        const armGroup = new THREE.Group();
        armGroup.position.set(x, 1.42, 0);

        // Upper arm (relative to shoulder)
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.25, 16), blackMat);
        upperArm.position.y = -0.17;
        armGroup.add(upperArm);

        // Elbow joint
        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), orangeMat);
        elbow.position.y = -0.32;
        armGroup.add(elbow);

        // Lower arm
        const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.22, 16), darkGrayMat);
        lowerArm.position.y = -0.47;
        armGroup.add(lowerArm);

        // Hand
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.03), blackMat);
        hand.position.y = -0.62;
        armGroup.add(hand);

        return armGroup;
    };

    const leftArm = createArm('left');
    const rightArm = createArm('right');
    robot.add(leftArm, rightArm);
    animationData.humanoid.leftArm = leftArm;
    animationData.humanoid.rightArm = rightArm;

    // LEGS - with proper pivot points at hip
    const createLeg = (side) => {
        const x = side === 'left' ? -0.12 : 0.12;

        // Leg group positioned at hip joint for proper rotation
        const legGroup = new THREE.Group();
        legGroup.position.set(x, 0.88, 0);

        // Hip joint
        const hip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), darkGrayMat);
        legGroup.add(hip);

        // Upper leg (thigh) - relative to hip
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.28, 16), blackMat);
        thigh.position.y = -0.18;
        thigh.castShadow = true;
        legGroup.add(thigh);

        // Knee joint
        const knee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), orangeMat);
        knee.position.y = -0.34;
        legGroup.add(knee);

        // Lower leg (shin)
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 16), darkGrayMat);
        shin.position.y = -0.53;
        shin.castShadow = true;
        legGroup.add(shin);

        // Ankle
        const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), darkGrayMat);
        ankle.position.y = -0.70;
        legGroup.add(ankle);

        // Foot
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.14), blackMat);
        foot.position.set(0, -0.86, 0.02);
        foot.castShadow = true;
        legGroup.add(foot);

        return legGroup;
    };

    const leftLeg = createLeg('left');
    const rightLeg = createLeg('right');
    robot.add(leftLeg, rightLeg);
    animationData.humanoid.leftLeg = leftLeg;
    animationData.humanoid.rightLeg = rightLeg;

    robot.visible = false;
    robots.humanoid = robot;
    scene.add(robot);
}

/* ========================================
   UNITREE GO2 QUADRUPED
   ======================================== */

function createUnitreeGo2() {
    const robot = new THREE.Group();

    // Materials - Go2 style (black with orange/yellow accents)
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.8, roughness: 0.3 });
    const grayMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.4 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8800, metalness: 0.5, roughness: 0.3, emissive: 0xff6600, emissiveIntensity: 0.15 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });

    // BODY - Main chassis
    const bodyMain = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.18), blackMat);
    bodyMain.position.y = 0.32;
    bodyMain.castShadow = true;
    robot.add(bodyMain);

    // Body top panel
    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.16), grayMat);
    topPanel.position.y = 0.39;
    robot.add(topPanel);

    // Orange accent stripes
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.01), orangeMat);
    stripe1.position.set(0, 0.405, 0.07);
    robot.add(stripe1);

    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.01), orangeMat);
    stripe2.position.set(0, 0.405, -0.07);
    robot.add(stripe2);

    // HEAD UNIT - positioned at front of body, looking forward (+X direction)
    const headGroup = new THREE.Group();
    headGroup.position.set(0.28, 0.36, 0);

    const headMain = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), blackMat);
    headGroup.add(headMain);

    // Camera eyes (stereo cameras) - facing forward (+X)
    const eyeGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16);
    eyeGeom.rotateZ(Math.PI / 2); // Rotate to face forward

    const leftEye = new THREE.Mesh(eyeGeom, screenMat);
    leftEye.position.set(0.06, 0, 0.03);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, screenMat);
    rightEye.position.set(0.06, 0, -0.03);
    headGroup.add(rightEye);

    // Depth sensor - facing forward
    const depthSensor = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), grayMat);
    depthSensor.position.set(0.06, -0.02, 0);
    headGroup.add(depthSensor);

    robot.add(headGroup);
    animationData.quadruped = { head: headGroup };

    // LIDAR on top
    const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 32), grayMat);
    lidar.position.set(0, 0.42, 0);
    robot.add(lidar);

    // LEGS - Go2 has distinctive leg design with proper pivot points
    const createGo2Leg = (frontBack, leftRight) => {
        const x = frontBack === 'front' ? 0.18 : -0.18;
        const z = leftRight === 'left' ? -0.1 : 0.1;

        // Leg group positioned at hip for proper rotation
        const legGroup = new THREE.Group();
        legGroup.position.set(x, 0.28, z);

        // Hip motor housing
        const hipMotor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.06), grayMat);
        legGroup.add(hipMotor);

        // Thigh (upper leg) - relative to hip
        const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.04), blackMat);
        thigh.position.y = -0.10;
        thigh.castShadow = true;
        legGroup.add(thigh);

        // Knee motor
        const kneeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16), orangeMat);
        kneeCap.rotation.x = Math.PI / 2;
        kneeCap.position.y = -0.18;
        legGroup.add(kneeCap);

        // Shin (lower leg)
        const shin = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.03), grayMat);
        shin.position.y = -0.26;
        shin.castShadow = true;
        legGroup.add(shin);

        // Foot pad
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), blackMat);
        foot.position.y = -0.34;
        legGroup.add(foot);

        return legGroup;
    };

    const legFL = createGo2Leg('front', 'left');
    const legFR = createGo2Leg('front', 'right');
    const legBL = createGo2Leg('back', 'left');
    const legBR = createGo2Leg('back', 'right');

    robot.add(legFL, legFR, legBL, legBR);
    animationData.quadruped.legs = [legFL, legFR, legBL, legBR];

    // Tail (battery/compute unit)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), grayMat);
    tail.position.set(-0.3, 0.32, 0);
    robot.add(tail);

    robot.position.y = 0.06;
    robot.visible = false;
    robots.quadruped = robot;
    scene.add(robot);
}

/* ========================================
   KINOVA GEN3 ROBOT ARM
   ======================================== */

function createKinovaGen3() {
    const robot = new THREE.Group();

    // Materials - Kinova style (white/light gray with blue accents)
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.3, roughness: 0.5 });
    const grayMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.4 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, metalness: 0.6, roughness: 0.3, emissive: 0x003366, emissiveIntensity: 0.2 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.5 });

    // BASE - fixed to ground
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 32), darkMat);
    base.position.y = 0.025;
    base.castShadow = true;
    robot.add(base);

    // Base ring light
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.005, 8, 32), accentMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.05;
    robot.add(baseRing);

    // Build arm as connected chain for proper animation
    // SEGMENT 1 - Base rotator (rotates on Y axis)
    const segment1 = new THREE.Group();
    segment1.position.y = 0.05;

    const joint1Housing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 32), whiteMat);
    joint1Housing.position.y = 0.05;
    segment1.add(joint1Housing);

    const joint1Ring = new THREE.Mesh(new THREE.TorusGeometry(0.061, 0.004, 8, 32), blueMat);
    joint1Ring.rotation.x = Math.PI / 2;
    joint1Ring.position.y = 0.08;
    segment1.add(joint1Ring);

    robot.add(segment1);
    animationData.arm = { segment1: segment1 };

    // SEGMENT 2 - Shoulder link (tilts forward/back)
    const segment2 = new THREE.Group();
    segment2.position.y = 0.1;

    const link1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 32), whiteMat);
    link1.position.y = 0.1;
    link1.castShadow = true;
    segment2.add(link1);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.055, 32, 32), blueMat);
    shoulder.position.y = 0.2;
    segment2.add(shoulder);

    segment1.add(segment2);
    animationData.arm.segment2 = segment2;

    // SEGMENT 3 - Upper arm
    const segment3 = new THREE.Group();
    segment3.position.y = 0.2;

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 32), whiteMat);
    upperArm.position.y = 0.11;
    upperArm.castShadow = true;
    segment3.add(upperArm);

    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), blueMat);
    elbow.position.y = 0.22;
    segment3.add(elbow);

    segment2.add(segment3);
    animationData.arm.segment3 = segment3;

    // SEGMENT 4 - Forearm
    const segment4 = new THREE.Group();
    segment4.position.y = 0.22;

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 32), whiteMat);
    forearm.position.y = 0.09;
    forearm.castShadow = true;
    segment4.add(forearm);

    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.042, 32, 32), blueMat);
    wrist.position.y = 0.18;
    segment4.add(wrist);

    segment3.add(segment4);
    animationData.arm.segment4 = segment4;

    // SEGMENT 5 - Wrist/Gripper
    const segment5 = new THREE.Group();
    segment5.position.y = 0.18;

    const wristLink = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 32), whiteMat);
    wristLink.position.y = 0.03;
    segment5.add(wristLink);

    // Gripper base
    const gripperBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.06), darkMat);
    gripperBase.position.y = 0.08;
    segment5.add(gripperBase);

    // Gripper fingers
    const fingerGeom = new THREE.BoxGeometry(0.01, 0.05, 0.015);

    const leftFinger = new THREE.Mesh(fingerGeom, grayMat);
    leftFinger.position.set(0, 0.125, 0.02);
    segment5.add(leftFinger);

    const rightFinger = new THREE.Mesh(fingerGeom, grayMat);
    rightFinger.position.set(0, 0.125, -0.02);
    segment5.add(rightFinger);

    // Finger tips
    const leftTip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.015, 0.018), accentMat);
    leftTip.position.set(0, 0.155, 0.02);
    segment5.add(leftTip);

    const rightTip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.015, 0.018), accentMat);
    rightTip.position.set(0, 0.155, -0.02);
    segment5.add(rightTip);

    segment4.add(segment5);
    animationData.arm.segment5 = segment5;
    animationData.arm.leftFinger = leftFinger;
    animationData.arm.rightFinger = rightFinger;

    robot.visible = false;
    robots.arm = robot;
    scene.add(robot);
}

/* ========================================
   ROBOT ANIMATIONS
   ======================================== */

function animateRobots(time) {
    // Humanoid walking animation
    if (robots.humanoid && robots.humanoid.visible && animationData.humanoid) {
        const walkSpeed = 2.5;
        const legAmplitude = 0.4;  // Larger leg swing
        const armAmplitude = 0.35; // Arms swing opposite to legs

        // Arm swing - opposite to legs for natural walking
        if (animationData.humanoid.leftArm) {
            animationData.humanoid.leftArm.rotation.x = Math.sin(time * walkSpeed) * armAmplitude;
        }
        if (animationData.humanoid.rightArm) {
            animationData.humanoid.rightArm.rotation.x = -Math.sin(time * walkSpeed) * armAmplitude;
        }

        // Leg movement - swing from hip
        if (animationData.humanoid.leftLeg) {
            animationData.humanoid.leftLeg.rotation.x = -Math.sin(time * walkSpeed) * legAmplitude;
        }
        if (animationData.humanoid.rightLeg) {
            animationData.humanoid.rightLeg.rotation.x = Math.sin(time * walkSpeed) * legAmplitude;
        }

        // Body bob - happens twice per walk cycle
        robots.humanoid.position.y = Math.abs(Math.sin(time * walkSpeed * 2)) * 0.025;

        // Slight body sway
        robots.humanoid.rotation.z = Math.sin(time * walkSpeed) * 0.02;

        // Head look around
        if (animationData.humanoid.head) {
            animationData.humanoid.head.rotation.y = Math.sin(time * 0.4) * 0.15;
        }
    }

    // Quadruped trotting animation
    if (robots.quadruped && robots.quadruped.visible && animationData.quadruped) {
        const trotSpeed = 5;
        const legAmplitude = 0.4;  // Leg swing amplitude

        if (animationData.quadruped.legs) {
            // Diagonal gait pattern: FL+BR move together, FR+BL move together
            // Rotate on Z axis for forward/backward leg swing (dog walks along X axis)
            const phase1 = Math.sin(time * trotSpeed);
            const phase2 = -Math.sin(time * trotSpeed);

            // Front legs swing forward/backward on Z axis
            animationData.quadruped.legs[0].rotation.z = phase1 * legAmplitude; // FL
            animationData.quadruped.legs[1].rotation.z = phase2 * legAmplitude; // FR
            // Back legs swing opposite
            animationData.quadruped.legs[2].rotation.z = phase2 * legAmplitude; // BL
            animationData.quadruped.legs[3].rotation.z = phase1 * legAmplitude; // BR
        }

        // Body bounce - synchronized with leg movement
        robots.quadruped.position.y = 0.06 + Math.abs(Math.sin(time * trotSpeed * 2)) * 0.012;

        // Slight body pitch (nose up/down during trot)
        robots.quadruped.rotation.z = Math.sin(time * trotSpeed * 2) * 0.02;

        // Head look around - rotate on Y for left/right look
        if (animationData.quadruped.head) {
            animationData.quadruped.head.rotation.y = Math.sin(time * 0.5) * 0.15;
        }
    }

    // Robot arm manipulation animation - using connected chain
    if (robots.arm && robots.arm.visible && animationData.arm) {
        const armSpeed = 0.5;

        // Base rotation - slow sweep
        if (animationData.arm.segment1) {
            animationData.arm.segment1.rotation.y = Math.sin(time * armSpeed * 0.3) * 0.6;
        }

        // Shoulder tilt
        if (animationData.arm.segment2) {
            animationData.arm.segment2.rotation.x = Math.sin(time * armSpeed) * 0.3 + 0.2;
        }

        // Upper arm bend
        if (animationData.arm.segment3) {
            animationData.arm.segment3.rotation.x = Math.sin(time * armSpeed + 0.5) * 0.4 - 0.3;
        }

        // Forearm movement
        if (animationData.arm.segment4) {
            animationData.arm.segment4.rotation.x = Math.sin(time * armSpeed + 1) * 0.3 + 0.2;
        }

        // Wrist rotation
        if (animationData.arm.segment5) {
            animationData.arm.segment5.rotation.z = Math.sin(time * armSpeed * 2) * 0.3;
        }

        // Gripper open/close - synced with reaching motion
        const gripperCycle = Math.sin(time * armSpeed);
        const gripOpen = gripperCycle > 0 ? (gripperCycle * 0.012) : 0;

        if (animationData.arm.leftFinger) {
            animationData.arm.leftFinger.position.z = 0.02 + gripOpen;
        }
        if (animationData.arm.rightFinger) {
            animationData.arm.rightFinger.position.z = -0.02 - gripOpen;
        }
    }
}

/* ========================================
   ROBOT SWITCHING
   ======================================== */

function showRobot(type) {
    Object.keys(robots).forEach(key => {
        if (robots[key]) robots[key].visible = false;
    });

    if (robots[type]) {
        robots[type].visible = true;
        currentRobot = type;

        const info = robotInfo[type];
        const nameEl = document.querySelector('.robot-name');
        const typeEl = document.querySelector('.robot-type');

        if (nameEl) nameEl.textContent = info.name;
        if (typeEl) typeEl.textContent = `${info.type} • ${info.specs}`;

        document.querySelectorAll('.robot-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.robot === type);
        });

        // Adjust camera
        if (type === 'quadruped') {
            camera.position.set(1.2, 0.6, 1.5);
            controls.target.set(0, 0.3, 0);
        } else if (type === 'arm') {
            camera.position.set(1.5, 0.8, 1.5);
            controls.target.set(0, 0.5, 0);
        } else {
            camera.position.set(0, 1.2, 3);
            controls.target.set(0, 0.9, 0);
        }
        controls.update();
    }
}

function setupRobotSelector() {
    document.querySelectorAll('.robot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showRobot(btn.dataset.robot);
            resetAutoSwitch();
        });
    });
}

function startAutoSwitch() {
    switchTimer = 12;

    timerInterval = setInterval(() => {
        switchTimer--;

        if (switchTimer <= 0) {
            const types = ['humanoid', 'quadruped', 'arm'];
            const nextIndex = (types.indexOf(currentRobot) + 1) % types.length;
            showRobot(types[nextIndex]);
            switchTimer = 12;
        }
    }, 1000);
}

function resetAutoSwitch() {
    switchTimer = 12;
}

/* ========================================
   ANIMATION LOOP
   ======================================== */

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Animate robots
    animateRobots(time);

    // Rotate rings
    const ring1 = scene.getObjectByName('ring1');
    const ring2 = scene.getObjectByName('ring2');
    if (ring1) ring1.rotation.z = time * 0.2;
    if (ring2) ring2.rotation.z = -time * 0.15;

    controls.update();
    renderer.render(scene, camera);
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.about-card, .research-card, .project-card').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
            y: 50, opacity: 0, duration: 0.8, delay: (i % 4) * 0.1
        });
    });

    document.querySelectorAll('.section-header').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
            y: 30, opacity: 0, duration: 0.8
        });
    });

    gsap.to('.hero-grid', {
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
        y: 100, opacity: 0
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
                const show = filter === 'all' || categories.includes(filter);

                gsap.to(project, {
                    opacity: show ? 1 : 0,
                    scale: show ? 1 : 0.9,
                    duration: 0.4,
                    onComplete: () => { project.style.display = show ? 'block' : 'none'; }
                });
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
   COUNTERS
   ======================================== */

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const step = target / 50;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current);
                    }
                }, 40);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

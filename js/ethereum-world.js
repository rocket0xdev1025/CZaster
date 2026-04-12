// ethereum-cyberpunk-metaverse.js - 3D Cyberpunk Visualization of Blockchain

// Animation and rendering variables
let scene, camera, renderer;
let ethLogoModel, particles, clock;
let raycaster, mouse, INTERSECTED;
let dataFlows = [];
let transactionNodes = [];
let blockchainRings = [];
let isAnimationPaused = false; // Flag to track if animation is paused

// Environment variables
const modelScale = 0.5;
const particleCount = 2500;
const cameraDistance = 18;
const transactionCount = 25;
const dataFlowCount = 40;
const ringCount = 3;
let scrollY = 0;
let targetCameraPosition = { x: 0, y: 0, z: cameraDistance };

// Color palette
const colors = {
  ethereum: 0x3366ff,
  bitcoin: 0xff9900,
  ripple: 0x00b1ea,
  background: 0x000912,
  highlight1: 0x00ffcc, // Neon teal
  highlight2: 0xff00cc, // Neon pink
  highlight3: 0xff3366, // Neon red
  glow: 0x33ffff, // Cyan glow
  dataFlow: 0x00aaff, // Blue data
  wireframe: 0xff00ff, // Magenta wireframe
};

// Initialization
function init() {
  setupScene();
  setupCamera();
  setupLighting();
  setupRenderer();
  // Remove post-processing to fix the error
  // setupPostProcessing();
  createParticleSystem();
  createEthereumLogo();
  createBlockchainVisualization();
  createDataFlows();
  createTransactionNodes();
  setupEventListeners();
  addCityScape();
  addGridFloor();

  // Start loading sequence
  setTimeout(() => {
    document.querySelector(".loading-screen").style.opacity = "0";
    setTimeout(() => {
      document.querySelector(".loading-screen").style.display = "none";
    }, 1000);
  }, 2000);

  // Start animation loop
  animate();
}

// Setup the Three.js scene
function setupScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(colors.background, 0.035);
  scene.background = new THREE.Color(colors.background);
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

// Setup the camera with perspective
function setupCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, 0);
}

// Setup dynamic lighting
function setupLighting() {
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x101025, 0.5);
  scene.add(ambientLight);

  // Directional light - primary light source
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // Point lights for cyberpunk atmosphere
  const tealLight = new THREE.PointLight(colors.highlight1, 2, 30);
  tealLight.position.set(-5, 2, 3);
  scene.add(tealLight);

  const pinkLight = new THREE.PointLight(colors.highlight2, 2, 30);
  pinkLight.position.set(5, -2, 3);
  scene.add(pinkLight);

  const redLight = new THREE.PointLight(colors.highlight3, 2, 40);
  redLight.position.set(0, 10, -10);
  scene.add(redLight);

  // Add volumetric light beams
  addVolumetricLightBeams();
}

// Add volumetric light beams
function addVolumetricLightBeams() {
  const beamGeometry = new THREE.CylinderGeometry(0.1, 0.3, 15, 8, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: colors.highlight1,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(beamGeometry, beamMaterial.clone());
    beam.material.color.set(
      i % 2 === 0 ? colors.highlight1 : colors.highlight2
    );
    beam.position.set(
      (Math.random() - 0.5) * 40,
      -4,
      (Math.random() - 0.5) * 40
    );
    beam.scale.set(1, 1 + Math.random(), 1);
    beam.rotation.x = Math.PI / 2;
    beam.rotation.z = Math.random() * Math.PI;
    beam.userData = { rotationSpeed: (Math.random() - 0.5) * 0.01 };
    scene.add(beam);
  }
}

// Setup WebGL renderer with anti-aliasing
function setupRenderer() {
  const canvas = document.getElementById("ethereum-world");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(colors.background);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMappingExposure = 1.2;
}

// Create the particle system for background atmosphere
function createParticleSystem() {
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  const tealColor = new THREE.Color(0x00ffcc);
  const pinkColor = new THREE.Color(0xff00cc);
  const blueColor = new THREE.Color(0x0066ff);

  for (let i = 0; i < particleCount; i++) {
    // Position particles in a spherical volume
    const radius = 15 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Random size between 0.1 and 0.7
    sizes[i] = 0.1 + Math.random() * 0.6;

    // Color particles based on position to create atmosphere layers
    let colorChoice;
    const heightZone = positions[i * 3 + 1] + 15; // normalize height
    if (heightZone < 10) {
      colorChoice = pinkColor.clone().lerp(blueColor, Math.random());
    } else if (heightZone < 20) {
      colorChoice = blueColor.clone().lerp(tealColor, Math.random());
    } else {
      colorChoice = tealColor.clone().lerp(pinkColor, Math.random());
    }

    colors[i * 3] = colorChoice.r;
    colors[i * 3 + 1] = colorChoice.g;
    colors[i * 3 + 2] = colorChoice.b;
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Create a shader material for the particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
    },
    vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                
                // Add subtle movement to particles
                vec3 pos = position;
                pos.x += sin(pos.y * 0.05 + time * 0.2) * 0.5;
                pos.y += cos(pos.x * 0.05 + time * 0.2) * 0.5;
                pos.z += sin(pos.z * 0.05 + time * 0.2) * 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * pixelRatio * (150.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                // Create a circular particle with soft glow
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(gl_PointCoord, center);
                if (dist > 0.5) discard;
                
                // Smooth edges and apply glowing effect
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particles = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particles);

  // Create data packet particles
  createDataPackets();
}

// Create data packet system (moving particles representing data transmission)
function createDataPackets() {
  const packetCount = 200;
  const packetGeometry = new THREE.BufferGeometry();
  const packetPositions = new Float32Array(packetCount * 3);
  const packetSizes = new Float32Array(packetCount);
  const packetColors = new Float32Array(packetCount * 3);
  const packetVelocities = new Float32Array(packetCount * 3);
  const packetLifetime = new Float32Array(packetCount);

  const tealColor = new THREE.Color(colors.highlight1);
  const pinkColor = new THREE.Color(colors.highlight2);

  for (let i = 0; i < packetCount; i++) {
    // Initialize packets at random positions around center
    initializeDataPacket(
      i,
      packetPositions,
      packetSizes,
      packetColors,
      packetVelocities,
      packetLifetime,
      tealColor,
      pinkColor
    );
  }

  packetGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(packetPositions, 3)
  );
  packetGeometry.setAttribute(
    "size",
    new THREE.BufferAttribute(packetSizes, 1)
  );
  packetGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(packetColors, 3)
  );

  // Extra attributes for animation
  packetGeometry.setAttribute(
    "velocity",
    new THREE.BufferAttribute(packetVelocities, 3)
  );
  packetGeometry.setAttribute(
    "lifetime",
    new THREE.BufferAttribute(packetLifetime, 1)
  );

  const packetMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
    },
    vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute vec3 velocity;
            attribute float lifetime;
            varying vec3 vColor;
            varying float vLifetime;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                vLifetime = lifetime;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * pixelRatio * (50.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            varying vec3 vColor;
            varying float vLifetime;
            
            void main() {
                // Make pixel bright based on lifetime
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(gl_PointCoord, center);
                if (dist > 0.5) discard;
                
                // Make edge glow based on lifetime
                float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vLifetime;
                vec3 glowColor = vColor * (1.0 + 0.5 * vLifetime);
                gl_FragColor = vec4(glowColor, alpha);
            }
        `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particles.dataPackets = new THREE.Points(packetGeometry, packetMaterial);
  scene.add(particles.dataPackets);
}

// Initialize a single data packet
function initializeDataPacket(
  index,
  positions,
  sizes,
  colors,
  velocities,
  lifetime,
  color1,
  color2
) {
  // Random starting position within a sphere
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  const radius = 5 + Math.random() * 10;

  positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[index * 3 + 2] = radius * Math.cos(phi);

  // Random size
  sizes[index] = 0.2 + Math.random() * 0.5;

  // Assign color (different for different types of data)
  const packetType = Math.floor(Math.random() * 3);
  let packetColor;

  if (packetType === 0) {
    packetColor = color1; // Teal
  } else if (packetType === 1) {
    packetColor = color2; // Pink
  } else {
    packetColor = new THREE.Color(colors.dataFlow); // Blue
  }

  colors[index * 3] = packetColor.r;
  colors[index * 3 + 1] = packetColor.g;
  colors[index * 3 + 2] = packetColor.b;

  // Random velocity (moving away from or toward center)
  const speed = 0.05 + Math.random() * 0.1;
  const direction = Math.random() > 0.5 ? 1 : -1; // In or out

  velocities[index * 3] = (direction * positions[index * 3] * speed) / radius;
  velocities[index * 3 + 1] =
    (direction * positions[index * 3 + 1] * speed) / radius;
  velocities[index * 3 + 2] =
    (direction * positions[index * 3 + 2] * speed) / radius;

  // Set lifetime (1.0 = full, will decrease over time)
  lifetime[index] = 0.1 + Math.random() * 0.9;
}

// Create the 3D Ethereum logo with cyberpunk styling
function createEthereumLogo() {
  // Create diamond geometry (stylized Ethereum logo)
  const geometry = new THREE.CylinderGeometry(0, 2, 4, 6, 1, false);

  // Create material with holographic effect
  const material = new THREE.MeshPhysicalMaterial({
    color: colors.ethereum,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x3366ff,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    envMapIntensity: 1.0,
  });

  // Create the logo mesh
  ethLogoModel = new THREE.Mesh(geometry, material);
  ethLogoModel.scale.set(modelScale, modelScale, modelScale);
  ethLogoModel.rotation.x = Math.PI / 6;
  ethLogoModel.castShadow = true;
  ethLogoModel.receiveShadow = true;
  scene.add(ethLogoModel);

  // Add floating wireframe overlay with offset
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: colors.wireframe,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    })
  );
  wireframe.scale.set(modelScale * 1.05, modelScale * 1.05, modelScale * 1.05);
  wireframe.rotation.x = Math.PI / 6;
  ethLogoModel.wireframe = wireframe;
  scene.add(wireframe);

  // Add inner glow
  const glowGeometry = new THREE.CylinderGeometry(0, 1.9, 3.8, 6, 1, false);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: colors.glow,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  });

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.scale.set(modelScale, modelScale, modelScale);
  glow.rotation.x = Math.PI / 6;
  ethLogoModel.glow = glow;
  scene.add(glow);
}

// Create blockchain visualization with rings
function createBlockchainVisualization() {
  for (let i = 0; i < ringCount; i++) {
    const radius = 5 + i * 2;
    const thickness = 0.1;
    const detail = 50;

    // Create torus geometry for blockchain ring
    const ringGeometry = new THREE.TorusGeometry(radius, thickness, 16, detail);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color:
        i === 0
          ? colors.ethereum
          : i === 1
          ? colors.highlight1
          : colors.highlight2,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Rotate each ring differently
    ring.rotation.x = Math.PI / 3;
    ring.rotation.y = Math.PI / (i + 1);

    // Store ring rotation speeds
    ring.userData = {
      rotationSpeed: {
        x: 0.001,
        y: 0.002 - i * 0.0005,
        z: 0.0005 * i,
      },
    };

    blockchainRings.push(ring);
    scene.add(ring);

    // Add blocks along the ring
    addBlocksToRing(ring, i, radius, detail);
  }
}

// Add blocks to blockchain ring
function addBlocksToRing(ring, ringIndex, ringRadius, detail) {
  const blockCount = 10 + ringIndex * 5;
  const blockSize = 0.2 + 0.1 * ringIndex;

  // Create a group for blocks
  const blocksGroup = new THREE.Group();
  ring.blocks = blocksGroup;
  scene.add(blocksGroup);

  for (let i = 0; i < blockCount; i++) {
    // Calculate position along the ring
    const angle = (i / blockCount) * Math.PI * 2;
    const x = ringRadius * Math.cos(angle);
    const y = ringRadius * Math.sin(angle);

    // Create block geometry
    const blockGeometry = new THREE.BoxGeometry(
      blockSize,
      blockSize,
      blockSize
    );

    // Select different colors for different ring levels
    let blockColor;
    if (ringIndex === 0) {
      blockColor = new THREE.Color(colors.ethereum);
    } else if (ringIndex === 1) {
      blockColor = new THREE.Color(colors.highlight1);
    } else {
      blockColor = new THREE.Color(colors.highlight2);
    }

    // Make some blocks "special" (transactions)
    const isSpecialBlock = Math.random() > 0.7;
    if (isSpecialBlock) {
      blockColor.setHex(colors.highlight3);
    }

    const blockMaterial = new THREE.MeshPhongMaterial({
      color: blockColor,
      transparent: true,
      opacity: 0.9,
      emissive: blockColor,
      emissiveIntensity: 0.5,
      shininess: 80,
    });

    const block = new THREE.Mesh(blockGeometry, blockMaterial);

    // Position the block
    block.position.set(x, y, 0);

    // Apply the same rotation as the ring
    block.rotation.x = ring.rotation.x;
    block.rotation.y = ring.rotation.y;
    block.rotation.z = ring.rotation.z;

    // Add special animation data for special blocks
    block.userData = {
      isSpecial: isSpecialBlock,
      originalColor: blockColor.clone(),
      pulseSpeed: 0.5 + Math.random() * 2,
      angleOffset: angle,
      ringRadius: ringRadius,
      ringIndex: ringIndex,
    };

    // Add to group
    blocksGroup.add(block);
  }
}

// Create data flows (connections between blocks and transactions)
function createDataFlows() {
  for (let i = 0; i < dataFlowCount; i++) {
    // Create a curve that flows between random points
    const points = [];

    // Start point (random in sphere)
    const startRadius = 3 + Math.random() * 7;
    const startTheta = Math.random() * Math.PI * 2;
    const startPhi = Math.random() * Math.PI;

    const startX = startRadius * Math.sin(startPhi) * Math.cos(startTheta);
    const startY = startRadius * Math.sin(startPhi) * Math.sin(startTheta);
    const startZ = startRadius * Math.cos(startPhi);

    // End point (random in sphere)
    const endRadius = 3 + Math.random() * 12;
    const endTheta = Math.random() * Math.PI * 2;
    const endPhi = Math.random() * Math.PI;

    const endX = endRadius * Math.sin(endPhi) * Math.cos(endTheta);
    const endY = endRadius * Math.sin(endPhi) * Math.sin(endTheta);
    const endZ = endRadius * Math.cos(endPhi);

    // Control points for curve
    points.push(new THREE.Vector3(startX, startY, startZ));

    // Add 1-2 control points
    const controlPoints = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < controlPoints; j++) {
      const ratio = (j + 1) / (controlPoints + 1);
      const ctrlX =
        startX + (endX - startX) * ratio + (Math.random() - 0.5) * 5;
      const ctrlY =
        startY + (endY - startY) * ratio + (Math.random() - 0.5) * 5;
      const ctrlZ =
        startZ + (endZ - startZ) * ratio + (Math.random() - 0.5) * 5;

      points.push(new THREE.Vector3(ctrlX, ctrlY, ctrlZ));
    }

    points.push(new THREE.Vector3(endX, endY, endZ));

    // Create a curve
    const curve = new THREE.CatmullRomCurve3(points);

    // Create geometry for the curve
    const curveGeometry = new THREE.TubeGeometry(
      curve,
      20, // tubular segments
      0.03, // tube radius
      8, // radial segments
      false // closed
    );

    // Choose data flow color by type
    const flowType = Math.floor(Math.random() * 3);
    let flowColor;

    if (flowType === 0) {
      flowColor = colors.highlight1; // Teal
    } else if (flowType === 1) {
      flowColor = colors.highlight2; // Pink
    } else {
      flowColor = colors.dataFlow; // Blue
    }

    const flowMaterial = new THREE.MeshBasicMaterial({
      color: flowColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    const dataFlow = new THREE.Mesh(curveGeometry, flowMaterial);

    // Add animation parameters
    dataFlow.userData = {
      animationOffset: Math.random() * 1.0,
      animationSpeed: 0.2 + Math.random() * 0.8,
      flowType: flowType,
      originalColor: new THREE.Color(flowColor),
    };

    dataFlows.push(dataFlow);
    scene.add(dataFlow);

    // Add animated particles flowing along the curve
    addFlowingParticles(curve, flowColor, flowType);
  }
}

// Add particles flowing along curve
function addFlowingParticles(curve, color, flowType) {
  const particleCount = 5 + Math.floor(Math.random() * 10);
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleProgress = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    // Distribute particles along the curve
    const progress = Math.random();
    const position = curve.getPointAt(progress);

    particlePositions[i * 3] = position.x;
    particlePositions[i * 3 + 1] = position.y;
    particlePositions[i * 3 + 2] = position.z;

    // Random size
    particleSizes[i] = 0.1 + Math.random() * 0.2;

    // Starting progress along curve
    particleProgress[i] = progress;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );
  particleGeometry.setAttribute(
    "size",
    new THREE.BufferAttribute(particleSizes, 1)
  );
  particleGeometry.setAttribute(
    "progress",
    new THREE.BufferAttribute(particleProgress, 1)
  );

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
    },
    vertexShader: `
            attribute float size;
            attribute float progress;
            varying float vProgress;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vProgress = progress;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            uniform vec3 color;
            varying float vProgress;
            
            void main() {
                // Create a bright circular particle with trail effect
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(gl_PointCoord, center);
                if (dist > 0.5) discard;
                
                // Glow effect
                float brightness = 1.0 - dist * 2.0;
                vec3 glowColor = color * brightness;
                gl_FragColor = vec4(glowColor, brightness);
            }
        `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const flowingParticles = new THREE.Points(particleGeometry, particleMaterial);
  flowingParticles.userData = {
    curve: curve,
    speed: 0.005 + Math.random() * 0.02,
  };

  scene.add(flowingParticles);
}

// Create nodes representing crypto transactions
function createTransactionNodes() {
  for (let i = 0; i < transactionCount; i++) {
    // Random position in a wider sphere
    const radius = 10 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    // Determine node type
    let nodeColor, nodeSize;
    const nodeType = Math.floor(Math.random() * 4);

    // Assign visual properties based on type
    if (nodeType === 0) {
      nodeColor = colors.ethereum; // ETH
      nodeSize = 0.4 + Math.random() * 0.3;
    } else if (nodeType === 1) {
      nodeColor = colors.bitcoin; // BTC
      nodeSize = 0.3 + Math.random() * 0.4;
    } else if (nodeType === 2) {
      nodeColor = colors.ripple; // XRP
      nodeSize = 0.3 + Math.random() * 0.2;
    } else {
      nodeColor = colors.highlight1; // Other crypto
      nodeSize = 0.2 + Math.random() * 0.3;
    }

    // Create node geometry and materials
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: nodeColor,
      emissive: nodeColor,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      shininess: 80,
    });

    // Use different shapes for different crypto types
    let nodeGeometry;
    if (nodeType === 0) {
      nodeGeometry = new THREE.OctahedronGeometry(nodeSize, 0); // ETH
    } else if (nodeType === 1) {
      nodeGeometry = new THREE.DodecahedronGeometry(nodeSize, 0); // BTC
    } else if (nodeType === 2) {
      nodeGeometry = new THREE.TetrahedronGeometry(nodeSize, 0); // XRP
    } else {
      nodeGeometry = new THREE.IcosahedronGeometry(nodeSize, 0); // Other
    }

    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);

    // Add info for hover effects
    const txValue = Math.round((10 + Math.random() * 990) * 100) / 100;
    node.userData = {
      type: nodeType,
      typeName:
        nodeType === 0
          ? "ETH"
          : nodeType === 1
          ? "BTC"
          : nodeType === 2
          ? "XRP"
          : "ALT",
      value: txValue,
      pulseSpeed: 0.5 + Math.random() * 1.5,
      originalColor: new THREE.Color(nodeColor),
      originalScale: nodeSize,
      hovered: false,
    };

    transactionNodes.push(node);
    scene.add(node);

    // Occasionally add connection lines between nodes
    if (Math.random() > 0.7 && i > 0) {
      const targetIndex = Math.floor(Math.random() * i);
      const targetNode = transactionNodes[targetIndex];

      createConnectionLine(node, targetNode);
    }
  }
}

// Create a connection line between two transaction nodes
function createConnectionLine(node1, node2) {
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors.dataFlow,
    transparent: true,
    opacity: 0.5,
    linewidth: 1,
  });

  // Create line vertices from node positions
  const points = [node1.position.clone(), node2.position.clone()];

  lineGeometry.setFromPoints(points);

  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.userData = {
    node1: node1,
    node2: node2,
    animationProgress: 0,
    animationSpeed: 0.01 + Math.random() * 0.04,
  };

  scene.add(line);
}

// Add city-like skyline in the background
function addCityScape() {
  const cityGroup = new THREE.Group();

  // City parameters
  const buildingCount = 100;
  const cityRadius = 50;
  const maxHeight = 15;

  for (let i = 0; i < buildingCount; i++) {
    // Random position in a circle
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * cityRadius;

    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    // Building dimensions
    const width = 1 + Math.random() * 3;
    const depth = 1 + Math.random() * 3;
    const height = 5 + Math.random() * maxHeight;

    // Create building
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);

    // Determine building color and style
    let buildingColor;
    const colorType = Math.random();

    if (colorType < 0.3) {
      buildingColor = new THREE.Color(0x101025); // Dark blue
    } else if (colorType < 0.6) {
      buildingColor = new THREE.Color(0x202040); // Medium blue
    } else {
      buildingColor = new THREE.Color(0x303060); // Light blue
    }

    const buildingMaterial = new THREE.MeshPhongMaterial({
      color: buildingColor,
      emissive: 0x000000,
      transparent: false,
      opacity: 1.0,
      flatShading: true,
    });

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(x, -10 + height / 2, z);
    cityGroup.add(building);
  }

  scene.add(cityGroup);
}

// Add grid floor for cyberpunk aesthetic
function addGridFloor() {
  const size = 100;
  const divisions = 100;
  const colorCenterLine = colors.highlight1;
  const colorGrid = colors.highlight2;

  const grid = new THREE.GridHelper(
    size,
    divisions,
    colorCenterLine,
    colorGrid
  );
  grid.position.y = -10;
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  scene.add(grid);
}

// Add event listeners for window resize and scroll
function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("scroll", onScroll);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("click", onClick);

  // Add hover state for transaction nodes
  document.addEventListener("mousemove", checkIntersects);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle scrolling behavior
function onScroll() {
  scrollY = window.scrollY;

  // Calculate how far down the page the user has scrolled (0 to 1)
  const scrollProgress = Math.min(
    scrollY / (document.body.scrollHeight - window.innerHeight),
    1
  );

  // Adjust camera position based on scroll
  targetCameraPosition.y = -scrollProgress * 5;

  // Rotate the Ethereum logo based on scroll position
  if (ethLogoModel) {
    ethLogoModel.rotation.y = scrollProgress * Math.PI * 2;
  }

  // Adjust blockchain ring positions
  blockchainRings.forEach((ring, index) => {
    ring.rotation.x = Math.PI / 3 + scrollProgress * Math.PI * 0.5;
  });
}

// Handle mouse movement
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Influence the camera's target position slightly based on mouse
  targetCameraPosition.x = mouse.x * 2;

  // Update the custom cursor position
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }
}

// Handle click event (for interactive elements)
function onClick() {
  if (INTERSECTED) {
    // Handle click on a transaction node
    if (transactionNodes.includes(INTERSECTED)) {
      // Show transaction details
      const nodeData = INTERSECTED.userData;
      console.log(
        `Transaction: ${nodeData.typeName}, Value: ${nodeData.value}`
      );

      // Trigger visual effect
      triggerTransactionEffect(INTERSECTED);
    }
  }
}

// Check for intersects with mouse raycaster
function checkIntersects() {
  // Update the raycaster with the current mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the ray
  const intersects = raycaster.intersectObjects(transactionNodes, false);

  // Reset all previously hovered nodes
  transactionNodes.forEach((node) => {
    if (node.userData.hovered) {
      node.scale.set(1, 1, 1);
      node.material.emissiveIntensity = 0.5;
      node.userData.hovered = false;
    }
  });

  // Handle new hover
  if (intersects.length > 0) {
    INTERSECTED = intersects[0].object;
    INTERSECTED.userData.hovered = true;
    INTERSECTED.scale.set(1.2, 1.2, 1.2);
    INTERSECTED.material.emissiveIntensity = 1.0;

    // Update cursor style
    document.body.style.cursor = "pointer";
  } else {
    INTERSECTED = null;
    document.body.style.cursor = "auto";
  }
}

// Trigger visual effect when a transaction is clicked
function triggerTransactionEffect(node) {
  // Create pulse wave effect
  const pulseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: node.userData.originalColor,
    transparent: true,
    opacity: 1,
  });

  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
  pulse.position.copy(node.position);
  scene.add(pulse);

  // Animate the pulse
  function expandPulse() {
    if (pulse.scale.x < 30) {
      pulse.scale.x += 0.5;
      pulse.scale.y += 0.5;
      pulse.scale.z += 0.5;
      pulse.material.opacity -= 0.02;

      requestAnimationFrame(expandPulse);
    } else {
      scene.remove(pulse);
      pulse.geometry.dispose();
      pulse.material.dispose();
    }
  }

  expandPulse();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Skip animation updates if paused
  if (isAnimationPaused) {
    // Still render the scene to maintain the last frame
    renderer.render(scene, camera);
    return;
  }

  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Smoothly move camera to target position
  camera.position.x += (targetCameraPosition.x - camera.position.x) * 0.05;
  camera.position.y += (targetCameraPosition.y - camera.position.y) * 0.05;
  camera.position.z = cameraDistance;
  camera.lookAt(0, 0, 0);

  // Rotate Ethereum logo
  if (ethLogoModel) {
    ethLogoModel.rotation.y += 0.005;
    ethLogoModel.wireframe.rotation.y = ethLogoModel.rotation.y;
    ethLogoModel.wireframe.rotation.x = ethLogoModel.rotation.x;
    ethLogoModel.glow.rotation.y = ethLogoModel.rotation.y;
    ethLogoModel.glow.rotation.x = ethLogoModel.rotation.x;

    // Pulse wireframe
    const pulseFactor = Math.sin(elapsedTime * 2) * 0.5 + 0.5;
    ethLogoModel.wireframe.material.opacity = 0.5 + pulseFactor * 0.5;
    ethLogoModel.glow.material.opacity = 0.2 + pulseFactor * 0.1;
  }

  // Update blockchain rings
  blockchainRings.forEach((ring) => {
    ring.rotation.x += ring.userData.rotationSpeed.x;
    ring.rotation.y += ring.userData.rotationSpeed.y;
    ring.rotation.z += ring.userData.rotationSpeed.z;

    // Update blocks position and rotation
    if (ring.blocks) {
      ring.blocks.rotation.copy(ring.rotation);

      // Update individual blocks
      ring.blocks.children.forEach((block) => {
        if (block.userData.isSpecial) {
          // Pulse effect for special blocks
          const pulseValue =
            Math.sin(elapsedTime * block.userData.pulseSpeed) * 0.5 + 0.5;
          block.material.emissiveIntensity = 0.3 + pulseValue * 0.7;
        }
      });
    }
  });

  // Update particle system
  if (particles) {
    particles.material.uniforms.time.value = elapsedTime;

    // Update data packets
    if (particles.dataPackets) {
      particles.dataPackets.material.uniforms.time.value = elapsedTime;

      // Get particle positions and update them
      const positions =
        particles.dataPackets.geometry.attributes.position.array;
      const velocities =
        particles.dataPackets.geometry.attributes.velocity.array;
      const lifetimes =
        particles.dataPackets.geometry.attributes.lifetime.array;

      for (let i = 0; i < positions.length / 3; i++) {
        // Update position based on velocity
        positions[i * 3] += velocities[i * 3] * deltaTime * 10;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 10;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 10;

        // Calculate distance from center
        const dist = Math.sqrt(
          positions[i * 3] * positions[i * 3] +
            positions[i * 3 + 1] * positions[i * 3 + 1] +
            positions[i * 3 + 2] * positions[i * 3 + 2]
        );

        // Decrease lifetime
        lifetimes[i] -= deltaTime * 0.2;

        // Reset particles that are too far or expired
        if (dist > 25 || lifetimes[i] <= 0) {
          // Create new particle
          const color1 = new THREE.Color(colors.highlight1);
          const color2 = new THREE.Color(colors.highlight2);
          initializeDataPacket(
            i,
            positions,
            particles.dataPackets.geometry.attributes.size.array,
            particles.dataPackets.geometry.attributes.color.array,
            velocities,
            lifetimes,
            color1,
            color2
          );
        }
      }

      // Update GPU buffers
      particles.dataPackets.geometry.attributes.position.needsUpdate = true;
      particles.dataPackets.geometry.attributes.lifetime.needsUpdate = true;
    }
  }

  // Update data flows
  dataFlows.forEach((flow) => {
    // Pulse effect for data flows
    const pulseValue =
      Math.sin(
        elapsedTime * flow.userData.animationSpeed +
          flow.userData.animationOffset
      ) *
        0.5 +
      0.5;
    flow.material.opacity = 0.3 + pulseValue * 0.7;

    // Change color based on flow type and pulse
    const baseColor = flow.userData.originalColor;
    if (flow.userData.flowType === 0) {
      // Teal to blue
      flow.material.color.setHex(
        Math.sin(elapsedTime) > 0 ? colors.highlight1 : colors.dataFlow
      );
    } else if (flow.userData.flowType === 1) {
      // Pink pulse
      flow.material.color.lerpColors(
        baseColor,
        new THREE.Color(colors.highlight3),
        pulseValue
      );
    }
  });

  // Update transaction nodes
  transactionNodes.forEach((node) => {
    // Rotate slowly
    node.rotation.x += deltaTime * 0.2;
    node.rotation.y += deltaTime * 0.3;

    if (!node.userData.hovered) {
      // Pulsing effect
      const pulseFactor =
        Math.sin(elapsedTime * node.userData.pulseSpeed) * 0.5 + 0.5;
      node.material.emissiveIntensity = 0.2 + pulseFactor * 0.3;
    }
  });

  // Render scene
  renderer.render(scene, camera);
}

// Start initialization
document.addEventListener("DOMContentLoaded", function () {
  // Simulate loading progress
  const progressBar = document.querySelector(".progress");
  const loadingScreen = document.querySelector(".loading-screen");
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += 1;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(loadingInterval);
      init();
      // Make sure loading screen is removed
      if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
          loadingScreen.style.display = "none";
        }, 1000);
      }
    }
  }, 20);
});

// Function to pause the animation
function pauseAnimation() {
  isAnimationPaused = true;
}

// Function to resume the animation
function resumeAnimation() {
  isAnimationPaused = false;
}

// Make functions available globally
window.pauseEthereumAnimation = pauseAnimation;
window.resumeEthereumAnimation = resumeAnimation;

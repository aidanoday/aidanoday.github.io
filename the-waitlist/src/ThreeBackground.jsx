import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ThreeBackground = forwardRef(function ThreeBackground(props, ref) {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    get controls() { return controlsRef.current; },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0cece);
    scene.fog = new THREE.FogExp2(0xd0cece, 0.045);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    //camera.position.set (270 * Math.sin(Math.PI / 4), 3.5, 8 * Math.cos(Math.PI / 4));
    camera.position.set(4, 3.5, 8);
camera.lookAt(0, 1.5, 0);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.pointerEvents = "auto";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
    dirLight.name = 'dirLight';
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xc8d8e8, 0.6);
    fillLight.name = 'fillLight';
    fillLight.position.set(-5, 4, -2);
    scene.add(fillLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(80, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xb8b5b0,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.name = 'ground';
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -50;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid lines on ground
    const gridHelper = new THREE.GridHelper(200, 60, 0xa8a5a0, 0xa8a5a0);
    gridHelper.name = 'gridHelper';
    gridHelper.position.y = 0.002;
    gridHelper.position.z = -50;
    gridHelper.material.opacity = 0.18;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Pawn geometry factory — sharp cone + floating sphere
    function createPawn(scale) {
      const group = new THREE.Group();

      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e1e1e,
        roughness: 0.38,
        metalness: 0.3,
      });

      // Sharp cone body
      const coneGeo = new THREE.ConeGeometry(0.32 * scale, 0.9 * scale, 20);
      const cone = new THREE.Mesh(coneGeo, mat);
      cone.name = 'pawnCone';
      cone.position.y = 0.45 * scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);

      // Floating head sphere
      const headGeo = new THREE.SphereGeometry(0.22 * scale, 20, 16);
      const head = new THREE.Mesh(headGeo, mat);
      head.name = 'pawnHead';
      head.castShadow = true;
      group.add(head);
      group.userData.head = head;
      group.userData.scale = scale;
      group.userData.headBaseY = (0.9 + 0.28) * scale;

      return group;
    }

    // Place pawns in a receding line
    const pawnCount = 40;
    const startZ = 32;
    const endZ = -32;
    const pawnGroups = [];

    for (let i = 0; i < pawnCount; i++) {
      const t = i / (pawnCount - 1);
      const z = startZ - t * (startZ - endZ);
      const perspScale = 1.0 - t * 0.52;

      const pawn = createPawn(perspScale);
      pawn.name = `pawn_${i}`;

      const xOffset = Math.sin(i * 1.1) * 1.1 * (1 - t * 0.4);
      pawn.position.set(xOffset, 0, z);
      pawn.userData.xBase = xOffset;
      pawn.userData.zPos = z;
      pawn.userData.index = i;

      scene.add(pawn);
      pawnGroups.push(pawn);
    }

    // Subtle shadow decals under each pawn
    for (let i = 0; i < pawnCount; i++) {
      const t = i / (pawnCount - 1);
      const perspScale = 1.0 - t * 0.52;
      const xOffset = Math.sin(i * 1.1) * 1.4 * (1 - t * 0.4);
      const z = startZ - t * (startZ - endZ);

      const shadowGeo = new THREE.CircleGeometry(0.38 * perspScale, 20);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.2 * (1 - t * 0.5),
        depthWrite: false,
      });
      const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
      shadowDisc.name = `shadowDisc_${i}`;
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.set(xOffset, 0.003, z);
      scene.add(shadowDisc);
    }

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(0, 1.0, 0);
    controls.update();
    controlsRef.current = controls;

    // Animation
    let time = 0;

    function animate() {
      time += 0.006;

      for (const pawn of pawnGroups) {
        const head = pawn.userData.head;
        const baseY = pawn.userData.headBaseY;
        const idx = pawn.userData.index;
        head.position.y = baseY + Math.sin(time + idx * 0.55) * 0.12 * pawn.userData.scale;
      }

      if (!controls.autoRotate) {
        camera.position.x += Math.sin(time * 0.2) * 0.003;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    // Resize handler
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
});

export default ThreeBackground;

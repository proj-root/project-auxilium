import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// EXPERIMENTAL

/**
 * HolographicLotus
 * A single self-contained component rendering an animated 3D holographic
 * lotus flower (3 layers of petals + veined leaves) that blooms once on
 * mount, viewed frontally from a ~20deg downward angle.
 */

interface HoloMaterialOptions {
  colorTop: string;
  colorBottom: string;
  gridDensity?: number;
  gridStrength?: number;
  opacity?: number;
  glow?: number;
  veins?: number;
}

interface PetalLayerConfig {
  count: number;
  length: number;
  width: number;
  colorTop: string;
  colorBottom: string;
  closedAngle: number;
  openAngle: number;
  yOffset: number;
  radiusOut: number;
  rotationOffset: number;
  delay: number;
  duration: number;
}

interface LeafConfig {
  radius: number;
  rotY: number;
  tiltX: number;
  x: number;
  z: number;
  y: number;
}

interface AnimatedPetal {
  tilt: THREE.Object3D;
  cfg: PetalLayerConfig;
}

export default function HolographicLotus() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------------------------------------------------------------
    // Basic scene / camera / renderer
    // ---------------------------------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );

    // Frontal view, tilted down ~20deg toward the stigma.
    const target = new THREE.Vector3(0, 0.55, 0);
    const camDist = 6.3;
    const tilt = THREE.MathUtils.degToRad(20);
    camera.position.set(
      0,
      target.y + camDist * Math.sin(tilt),
      camDist * Math.cos(tilt),
    );
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Soft ambient fill so the shader-lit geometry still reads with depth.
    scene.add(new THREE.AmbientLight(0x88ffe0, 0.5));
    const key = new THREE.PointLight(0x66ffee, 1.1, 12);
    key.position.set(2, 3, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0x33ff88, 0.7, 12);
    rim.position.set(-2.5, 1.5, -2);
    scene.add(rim);

    // ---------------------------------------------------------------
    // Shared holographic shader material factory
    // ---------------------------------------------------------------
    const clock = new THREE.Clock();

    function makeHoloMaterial({
      colorTop,
      colorBottom,
      gridDensity = 18.0,
      gridStrength = 0.55,
      opacity = 0.55,
      glow = 0.9,
      veins = 0.0,
    }: HoloMaterialOptions): THREE.ShaderMaterial {
      return new THREE.ShaderMaterial({
        uniforms: {
          uColorTop: { value: new THREE.Color(colorTop) },
          uColorBottom: { value: new THREE.Color(colorBottom) },
          uGridDensity: { value: gridDensity },
          uGridStrength: { value: gridStrength },
          uOpacity: { value: opacity },
          uGlow: { value: glow },
          uVeins: { value: veins },
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - worldPos.xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform vec3 uColorTop;
          uniform vec3 uColorBottom;
          uniform float uGridDensity;
          uniform float uGridStrength;
          uniform float uOpacity;
          uniform float uGlow;
          uniform float uVeins;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;

          void main() {
            float t = clamp(vUv.y, 0.0, 1.0);
            vec3 base = mix(uColorBottom, uColorTop, t);

            // faint tech grid
            vec2 g = vUv * uGridDensity;
            vec2 gf = abs(fract(g) - 0.5) * 2.0;
            float lineX = 1.0 - smoothstep(0.90, 1.0, gf.x);
            float lineY = 1.0 - smoothstep(0.90, 1.0, gf.y);
            float grid = max(lineX, lineY) * uGridStrength;

            // optional vein lines radiating from base (uv.x centered at 0.5)
            float veinPattern = 0.0;
            if (uVeins > 0.0) {
              float cx = abs(vUv.x - 0.5) * 2.0;
              float ang = cx * 7.0;
              float veinLine = 1.0 - smoothstep(0.0, 0.06, abs(fract(ang) - 0.5) * 2.0 - 1.0 + 1.0);
              veinLine = pow(1.0 - abs(sin(ang * 3.14159)), 8.0);
              float radial = 1.0 - smoothstep(0.0, 0.05, abs(fract(vUv.y * 5.0) - 0.5));
              veinPattern = max(veinLine, radial * 0.4) * uVeins;
            }

            // fresnel rim glow for a translucent hologram edge
            float fresnel = pow(1.0 - clamp(dot(normalize(vViewDir), normalize(vNormalW)), 0.0, 1.0), 2.2);

            float scan = sin(vUv.y * 40.0 - uTime * 1.5) * 0.03 + 0.03;

            vec3 color = base + grid * vec3(0.7, 1.0, 0.95) + veinPattern * vec3(0.3, 1.0, 0.6);
            color += fresnel * base * uGlow;
            color += scan * base;

            float alpha = uOpacity + fresnel * 0.35 + grid * 0.35 + veinPattern * 0.3;
            gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    }

    const materials: THREE.ShaderMaterial[] = []; // keep list to tick uTime + dispose later

    function registerMaterial(mat: THREE.ShaderMaterial): THREE.ShaderMaterial {
      materials.push(mat);
      return mat;
    }

    // ---------------------------------------------------------------
    // Petal geometry builder
    // A lotus petal outline built from bezier curves, extruded flat then
    // curled/folded via vertex displacement for a natural cupped shape.
    // ---------------------------------------------------------------
    function createPetalGeometry(
      length = 1,
      width = 0.46,
      curl = 0.35,
      foldDepth = 0.14,
    ): THREE.BufferGeometry {
      const shape = new THREE.Shape();
      const w = width;
      shape.moveTo(0, 0);
      shape.bezierCurveTo(
        w * 0.65,
        length * 0.05,
        w,
        length * 0.42,
        w * 0.32,
        length * 0.86,
      );
      shape.bezierCurveTo(
        w * 0.16,
        length * 1.02,
        -w * 0.16,
        length * 1.02,
        -w * 0.32,
        length * 0.86,
      );
      shape.bezierCurveTo(-w, length * 0.42, -w * 0.65, length * 0.05, 0, 0);

      const geo = new THREE.ShapeGeometry(shape, 24);
      geo.computeBoundingBox();

      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      const bb = geo.boundingBox as THREE.Box3;
      const maxY = bb.max.y || length;

      if (pos && uv) {
        for (let i = 0; i < pos.count; i++) {
          const x = pos?.getX(i) || 0;
          const y = pos?.getY(i) || 0;
          const yNorm = THREE.MathUtils.clamp(y / maxY, 0, 1);

          // longitudinal curl: petal tip curves toward viewer/up
          const curlZ = Math.sin(yNorm * Math.PI * 0.5) * curl * yNorm;

          // transverse fold: petal edges lift up relative to central spine
          const xNorm = width !== 0 ? x / width : 0;
          const fold =
            (1 - Math.cos(xNorm * Math.PI * 0.5)) * foldDepth * (0.3 + yNorm);

          pos?.setZ(i, curlZ + fold);
          // uv.y drives the color gradient (base -> tip)
          uv?.setXY(i, xNorm * 0.5 + 0.5, yNorm);
        }
        pos.needsUpdate = true;
        uv.needsUpdate = true;
      }
      geo.computeVertexNormals();
      return geo;
    }

    // ---------------------------------------------------------------
    // Leaf geometry builder — round lily-pad shape with a wavy rim and
    // a UV setup suited to the radial vein shader.
    // ---------------------------------------------------------------
    function createLeafGeometry(
      radius = 1.6,
      waviness = 0.08,
      notch = 0.18,
    ): THREE.BufferGeometry {
      const shape = new THREE.Shape();
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        let r = radius * (1 + waviness * Math.sin(a * 5));
        // small notch like a lily pad slit
        const notchWidth = 0.18;
        const distToNotch = Math.min(
          Math.abs(a - 0),
          Math.abs(a - Math.PI * 2),
        );
        if (distToNotch < notchWidth) {
          r *= 1 - notch * (1 - distToNotch / notchWidth);
        }
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      const geo = new THREE.ShapeGeometry(shape, 48);

      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      if (pos && uv) {
        for (let i = 0; i < pos.count; i++) {
          const x = pos?.getX(i) || 0;
          const y = pos?.getY(i) || 0;
          const r = Math.sqrt(x * x + y * y) / radius;
          // gentle dish / undulation so it isn't perfectly flat
          const z =
            Math.sin(r * Math.PI * 0.5) * 0.12 +
            Math.sin(x * 2.2) * Math.cos(y * 2.2) * 0.04;
          pos?.setZ(i, z);
          const ang = Math.atan2(y, x);
          uv?.setXY(i, ang / (Math.PI * 2) + 0.5, r);
        }
        pos.needsUpdate = true;
        uv.needsUpdate = true;
      }
      geo.computeVertexNormals();
      return geo;
    }

    // ---------------------------------------------------------------
    // Build the flower
    // ---------------------------------------------------------------
    const flowerGroup = new THREE.Group();
    scene.add(flowerGroup);

    // ---- Leaves (below the flower) ----
    const leavesGroup = new THREE.Group();
    leavesGroup.position.y = -0.35;
    flowerGroup.add(leavesGroup);

    const leafConfigs: LeafConfig[] = [
      { radius: 2.0, rotY: 0.4, tiltX: -0.35, x: -1.1, z: -0.6, y: -0.05 },
      { radius: 1.7, rotY: -2.0, tiltX: -0.3, x: 1.2, z: -0.3, y: 0.02 },
      { radius: 1.5, rotY: 2.4, tiltX: -0.32, x: 0.1, z: 1.1, y: -0.02 },
    ];

    leafConfigs.forEach((cfg) => {
      const geo = createLeafGeometry(cfg.radius);
      const mat = registerMaterial(
        makeHoloMaterial({
          colorTop: '#8affc2',
          colorBottom: '#0a5a3c',
          gridDensity: 14,
          gridStrength: 0.35,
          opacity: 0.4,
          glow: 0.7,
          veins: 0.6,
        }),
      );
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2 + cfg.tiltX;
      mesh.rotation.z = cfg.rotY;
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      leavesGroup.add(mesh);
    });

    // ---- Center: receptacle (seed pod) + stamens ----
    const centerGroup = new THREE.Group();
    centerGroup.position.y = 0.55;
    flowerGroup.add(centerGroup);

    const yellowMat = registerMaterial(
      makeHoloMaterial({
        colorTop: '#fff6c2',
        colorBottom: '#f2c40f',
        gridDensity: 20,
        gridStrength: 0.4,
        opacity: 0.55,
        glow: 0.8,
      }),
    );

    // flat-topped receptacle
    const podProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.16, 0.02),
      new THREE.Vector2(0.22, 0.09),
      new THREE.Vector2(0.2, 0.16),
      new THREE.Vector2(0.1, 0.19),
      new THREE.Vector2(0.0, 0.19),
    ];
    const podGeo = new THREE.LatheGeometry(podProfile, 32);
    const podMesh = new THREE.Mesh(podGeo, yellowMat);
    centerGroup.add(podMesh);

    // tiny seed bumps on top of the receptacle
    const seedGeo = new THREE.SphereGeometry(0.022, 8, 8);
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 7 : 12;
      const rr = ring === 0 ? 0.07 : 0.13;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const seed = new THREE.Mesh(seedGeo, yellowMat);
        seed.position.set(Math.cos(a) * rr, 0.195, Math.sin(a) * rr);
        centerGroup.add(seed);
      }
    }

    // stamens: thin filaments with small anther tips around the receptacle
    const filamentCount = 26;
    const filamentGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.34, 5);
    filamentGeo.translate(0, 0.17, 0);
    const antherGeo = new THREE.SphereGeometry(0.02, 6, 6);
    for (let i = 0; i < filamentCount; i++) {
      const a = (i / filamentCount) * Math.PI * 2;
      const r = 0.23 + Math.random() * 0.04;
      const filament = new THREE.Mesh(filamentGeo, yellowMat);
      filament.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      filament.rotation.x = (Math.random() - 0.5) * 0.5;
      filament.rotation.z = (Math.random() - 0.5) * 0.5;
      centerGroup.add(filament);

      const anther = new THREE.Mesh(antherGeo, yellowMat);
      anther.position.set(Math.cos(a) * r * 1.05, 0.34, Math.sin(a) * r * 1.05);
      centerGroup.add(anther);
    }

    // ---- Petals: 3 layers, innermost smallest -> outermost largest ----
    const petalLayers: PetalLayerConfig[] = [
      {
        count: 8,
        length: 0.62,
        width: 0.24,
        colorTop: '#a6fff2',
        colorBottom: '#12b88a',
        closedAngle: THREE.MathUtils.degToRad(12),
        openAngle: THREE.MathUtils.degToRad(28),
        yOffset: 0.62,
        radiusOut: 0.05,
        rotationOffset: 0,
        delay: 0.55,
        duration: 1.6,
      },
      {
        count: 8,
        length: 0.95,
        width: 0.4,
        colorTop: '#7dfbff',
        colorBottom: '#0fae7a',
        closedAngle: THREE.MathUtils.degToRad(10),
        openAngle: THREE.MathUtils.degToRad(52),
        yOffset: 0.5,
        radiusOut: 0.08,
        rotationOffset: Math.PI / 8,
        delay: 0.28,
        duration: 1.8,
      },
      {
        count: 10,
        length: 1.3,
        width: 0.52,
        colorTop: '#5df2ff',
        colorBottom: '#0a9a6e',
        closedAngle: THREE.MathUtils.degToRad(8),
        openAngle: THREE.MathUtils.degToRad(78),
        yOffset: 0.38,
        radiusOut: 0.11,
        rotationOffset: Math.PI / 10,
        delay: 0.0,
        duration: 2.0,
      },
    ];

    const animatedPetals: AnimatedPetal[] = [];

    petalLayers.forEach((cfg) => {
      const geo = createPetalGeometry(cfg.length, cfg.width, 0.32, 0.16);
      const mat = registerMaterial(
        makeHoloMaterial({
          colorTop: cfg.colorTop,
          colorBottom: cfg.colorBottom,
          gridDensity: 16,
          gridStrength: 0.5,
          opacity: 0.5,
          glow: 0.95,
        }),
      );

      const layerGroup = new THREE.Group();
      layerGroup.position.y = cfg.yOffset;
      flowerGroup.add(layerGroup);

      for (let i = 0; i < cfg.count; i++) {
        const pivot = new THREE.Object3D();
        pivot.rotation.y = (i / cfg.count) * Math.PI * 2 + cfg.rotationOffset;
        layerGroup.add(pivot);

        const tilt = new THREE.Object3D();
        tilt.position.set(0, 0, cfg.radiusOut);
        tilt.rotation.x = cfg.closedAngle;
        pivot.add(tilt);

        const mesh = new THREE.Mesh(geo, mat);
        tilt.add(mesh);

        animatedPetals.push({ tilt, cfg });
      }
    });

    // ---------------------------------------------------------------
    // Bloom-in animation (runs once) + idle motion
    // ---------------------------------------------------------------
    function easeOutBack(x: number): number {
      const c1 = 1.4;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    let raf: number;
    function animate() {
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      animatedPetals.forEach(({ tilt, cfg }) => {
        const localT = (elapsed - cfg.delay) / cfg.duration;
        const clamped = THREE.MathUtils.clamp(localT, 0, 1);
        const eased = clamped <= 0 ? 0 : easeOutBack(clamped);
        const angle = THREE.MathUtils.lerp(
          cfg.closedAngle,
          cfg.openAngle,
          eased,
        );
        tilt.rotation.x = angle;
      });

      // very slow idle rotation once bloom has mostly settled, for a
      // gentle holographic "display turntable" feel
      flowerGroup.rotation.y = elapsed * 0.06;
      flowerGroup.position.y = Math.sin(elapsed * 0.6) * 0.015;

      materials.forEach((m) => {
        if (m.uniforms.uTime) {
          return (m.uniforms.uTime.value = elapsed)
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    // ---------------------------------------------------------------
    // Resize handling
    // ---------------------------------------------------------------
    function handleResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // ---------------------------------------------------------------
    // Cleanup
    // ---------------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background:
          'radial-gradient(ellipse at 50% 40%, #061018 0%, #01050a 65%, #000000 100%)',
        overflow: 'hidden',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

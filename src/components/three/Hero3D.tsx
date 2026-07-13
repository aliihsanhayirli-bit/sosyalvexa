import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

/**
 * Procedürel topografik yüzey: Temelli civarının bozkır/engebenli yapısını
 * noise tabanlı vertex displacement ile üretir. Gerçek DEM yerine bağımsız,
 * deterministik, estetik bir arazi.
 */
function Terrain({ onHover }: { onHover: (i: number | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const size = 24;
    const segments = 180;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];

    // Multi-octave noise (FBM)
    const noise2D = (x: number, y: number) => {
      const s = Math.sin(x * 1.2 + Math.cos(y * 0.7)) * Math.cos(y * 1.4 - Math.sin(x * 0.9));
      return (s + 1) / 2;
    };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);

      // Yükselti: merkezden uzaklaştıkça alçal, hafif tepecikler
      let h = 0;
      h += noise2D(x * 0.18, z * 0.18) * 1.4;
      h += noise2D(x * 0.45, z * 0.45) * 0.5;
      h += noise2D(x * 0.9, z * 0.9) * 0.18;
      h -= Math.max(0, dist - 8) * 0.25; // uzak kenarlar alçal
      h += Math.cos(x * 0.3) * Math.sin(z * 0.3) * 0.3;

      pos.setY(i, h);

      // Renk: yükseklik + konum gradient
      const t = THREE.MathUtils.clamp((h + 0.6) / 2.2, 0, 1);
      const base = new THREE.Color('#0c1f33');
      const mid = new THREE.Color('#1e5a4a');
      const top = new THREE.Color('#3a8a72');
      const col = base.clone().lerp(mid, t).lerp(top, Math.pow(t, 3) * 0.8);
      colors.push(col.r, col.g, col.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

const PARCELS = [
  { id: 0, position: [-3.2, 0, -1.2] as const, size: [2.2, 0.5, 1.6] as const, price: '₺2.4M', area: '1.250 m²' },
  { id: 1, position: [2.8, 0, 0.6] as const, size: [1.8, 0.6, 1.4] as const, price: '₺1.9M', area: '980 m²' },
  { id: 2, position: [0.5, 0, 2.8] as const, size: [2.6, 0.7, 1.8] as const, price: '₺3.1M', area: '1.640 m²' },
  { id: 3, position: [-1.5, 0, 2.2] as const, size: [1.4, 0.4, 1.2] as const, price: '₺1.4M', area: '720 m²' },
  { id: 4, position: [3.6, 0, -2.4] as const, size: [2.0, 0.55, 1.5] as const, price: '₺2.7M', area: '1.380 m²' },
];

function Parcel({
  id, position, size, price, area, hovered, onHover,
}: {
  id: number; position: readonly [number, number, number]; size: readonly [number, number, number];
  price: string; area: string; hovered: boolean; onHover: (i: number | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [h, setH] = useState(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 0.45 : 0;
    setH(THREE.MathUtils.damp(h, target, 4, dt));
    ref.current.position.y = size[1] / 2 + h;
    const s = hovered ? 1.04 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial
          color={hovered ? '#00d4aa' : '#0e3a4a'}
          emissive={hovered ? '#00d4aa' : '#0a2a3a'}
          emissiveIntensity={hovered ? 0.7 : 0.3}
          metalness={0.4}
          roughness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>

      {hovered && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          <Html position={[0, size[1] + 1.2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="pointer-events-none rounded-lg border border-accent/40 bg-background/90 px-3 py-2 shadow-2xl shadow-accent/20 backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-wider text-accent">Parsel #{id + 1}</div>
              <div className="mt-0.5 font-display text-lg font-semibold text-foreground">{price}</div>
              <div className="text-[11px] text-muted-foreground">{area}</div>
            </div>
          </Html>
        </Float>
      )}

      {/* Çevre çizgisi */}
      <lineSegments position={[0, 0.02, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(size[0] + 0.05, 0.02, size[2] + 0.05)]} />
        <lineBasicMaterial color="#00d4aa" transparent opacity={hovered ? 0.9 : 0.5} />
      </lineSegments>
    </group>
  );
}

function AutoCamera() {
  const { camera } = useThree();
  const ref = useRef({ angle: 0.6, radius: 14, height: 6 });
  const [userInteracting, setUserInteracting] = useState(false);
  const lastChange = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastChange.current > 2500) setUserInteracting(false);
    }, 500);
    return () => clearInterval(id);
  }, []);

  useFrame((_, dt) => {
    if (!userInteracting) {
      ref.current.angle += dt * 0.05;
    }
    const { angle, radius, height } = ref.current;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, height, 1.5, dt);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function GoldParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 8 + 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += dt * 0.3;
      if (y > 10) y = 1;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={180} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#E0C460" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isMobile) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(0,212,170,0.25), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(224,196,96,0.15), transparent 50%), linear-gradient(180deg, #0a1628 0%, #051020 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAzIi8+PC9zdmc+')] opacity-50" />
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#050d18'), 1);
      }}
    >
      <PerspectiveCamera makeDefault fov={50} position={[10, 6, 10]} />
      <AutoCamera />

      <fog attach="fog" args={['#050d18', 14, 32]} />

      <ambientLight intensity={0.35} color="#5a7a9a" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.4}
        color="#ffe8b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-8, 4, -8]} intensity={0.5} color="#00d4aa" />
      <pointLight position={[6, 2, 8]} intensity={0.3} color="#E0C460" />

      <Stars radius={50} depth={50} count={1500} factor={3} fade speed={0.4} />
      <GoldParticles />

      <Terrain onHover={setHovered} />
      {PARCELS.map((p) => (
        <Parcel key={p.id} {...p} hovered={hovered === p.id} onHover={setHovered} />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate={false}
      />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.4} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}

export function Hero3D() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <HeroScene />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
              Temelli · Ankara
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-7xl">
              Toprağın <span className="gold-text italic">değerini</span><br />
              bilenler için.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
              YCA Yatırım, Ankara Temelli ve çevresinde arsa alım-satımı, yatırım danışmanlığı ve hukuki süreç yönetiminde 15+ yıllık tecrübesiyle yanınızda.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <a
                href="/arsalar"
                className="group inline-flex items-center gap-2 rounded-md bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:shadow-accent/50"
              >
                Arsaları Keşfet
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/iletisim"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-white/[0.08]"
              >
                Ücretsiz Danışmanlık
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-16 flex items-center gap-8 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-accent to-transparent" />
                15+ Yıl
              </div>
              <div>₺850M+ İşlem Hacmi</div>
              <div className="hidden sm:block">1.200+ Mutlu Müşteri</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Aşağı kaydır</div>
        <div className="mx-auto mt-2 h-8 w-px animate-pulse bg-gradient-to-b from-foreground/40 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </section>
  );
}

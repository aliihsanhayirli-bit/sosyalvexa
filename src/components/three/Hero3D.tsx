import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

type BuildingSeed = {
  id: number;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  premium: boolean;
  label: string;
  price: string;
  area: string;
};

const CITY = (() => {
  const seeds: BuildingSeed[] = [];
  const cols = 6;
  const rows = 4;
  const stepX = 2.2;
  const stepZ = 2.2;
  const labels = [
    { label: 'Çankaya', price: '₺3.4M', area: '1.420 m²' },
    { label: 'Etimesgut', price: '₺2.1M', area: '980 m²' },
    { label: 'Mamak', price: '₺1.6M', area: '820 m²' },
    { label: 'Yenimahalle', price: '₺2.8M', area: '1.180 m²' },
    { label: 'Keçiören', price: '₺1.9M', area: '940 m²' },
    { label: 'Sincan', price: '₺1.4M', area: '720 m²' },
    { label: 'Altındağ', price: '₺2.3M', area: '1.050 m²' },
    { label: 'Pursaklar', price: '₺1.7M', area: '860 m²' },
  ];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 1 && c === 2) || (r === 2 && c === 4)) continue;
      const baseW = 0.8 + Math.sin(c * 1.3 + r * 0.7) * 0.3;
      const baseD = 0.8 + Math.cos(c * 0.9 + r * 1.1) * 0.3;
      const baseH = 1.2 + Math.abs(Math.sin(c * 0.6 + r * 1.7)) * 3.6;
      const premium = (c + r) % 5 === 0 || (c * r) % 7 === 0;
      const meta = labels[(c + r) % labels.length];
      seeds.push({
        id: id++,
        x: (c - (cols - 1) / 2) * stepX + (Math.random() - 0.5) * 0.25,
        z: (r - (rows - 1) / 2) * stepZ + (Math.random() - 0.5) * 0.25,
        w: baseW,
        d: baseD,
        h: baseH,
        premium,
        label: meta.label,
        price: meta.price,
        area: meta.area,
      });
    }
  }
  return seeds;
})();

const WINDOW_TEXTURE = (() => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#08111f';
  ctx.fillRect(0, 0, c.width, c.height);
  const cols = 6;
  const rows = 14;
  const padX = 8;
  const padY = 8;
  const w = (c.width - padX * 2) / cols;
  const h = (c.height - padY * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const lit = Math.random() < 0.55;
      const warm = lit && Math.random() < 0.6;
      const x = padX + cc * w + 2;
      const y = padY + r * h + 2;
      const ww = w - 4;
      const hh = h - 4;
      if (lit) {
        ctx.fillStyle = warm ? '#F0CB55' : '#5fa9c9';
      } else {
        ctx.fillStyle = '#0a1628';
      }
      ctx.fillRect(x, y, ww, hh);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

function Building({
  id, x, z, w, d, h, premium, label, price, area, hovered, onHover,
}: BuildingSeed & { hovered: boolean; onHover: (id: number | null) => void }) {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const targetY = premium ? h + 0.18 : h / 2;

  useFrame((_, dt) => {
    if (!ref.current) return;
    const t = hovered ? 0.3 : 0;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, t, 4, dt);
    const s = hovered ? 1.04 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, hovered ? 0.9 : 0.0, 6, dt);
    }
  });

  const repeats = useMemo(() => {
    const u = Math.max(1, Math.round(w * 1.4));
    const v = Math.max(1, Math.round(h * 0.8));
    return { u, v };
  }, [w, h]);

  const sideTexture = useMemo(() => {
    const t = WINDOW_TEXTURE.clone();
    t.needsUpdate = true;
    t.repeat.set(repeats.u, repeats.v);
    return t;
  }, [repeats.u, repeats.v]);

  return (
    <group
      ref={ref}
      position={[x, 0, z]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
    >
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          map={sideTexture}
          color={hovered ? '#1a2540' : '#0c1626'}
          emissive={premium ? '#3a2a08' : '#0a1a2a'}
          emissiveIntensity={premium ? 0.45 : 0.2}
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>

      {premium && (
        <mesh ref={glowRef} position={[0, h + 0.05, 0]}>
          <boxGeometry args={[w * 0.85, 0.08, d * 0.85]} />
          <meshBasicMaterial color="#F0CB55" transparent opacity={0} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, h + 1.0, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="pointer-events-none rounded-lg border border-accent/40 bg-background/90 px-3 py-2 shadow-2xl shadow-accent/20 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-wider text-accent">{label}</div>
            <div className="mt-0.5 font-display text-lg font-semibold text-foreground">{price}</div>
            <div className="text-[11px] text-muted-foreground">{area}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function GroundPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial
        color="#08111f"
        emissive="#0a1628"
        emissiveIntensity={0.3}
        metalness={0.2}
        roughness={0.85}
      />
    </mesh>
  );
}

function GridLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => {
    const verts: number[] = [];
    const step = 1.1;
    const half = 7;
    for (let i = -half; i <= half; i++) {
      verts.push(i * step, 0, -half * step, i * step, 0, half * step);
      verts.push(-half * step, 0, i * step, half * step, 0, i * step);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.18 + Math.sin(performance.now() * 0.0008) * 0.05;
  });

  return (
    <lineSegments ref={ref} geometry={geom} position={[0, 0.005, 0]}>
      <lineBasicMaterial color="#D4A82B" transparent opacity={0.18} />
    </lineSegments>
  );
}

function AutoCamera() {
  const { camera } = useThree();
  const ref = useRef({ angle: 0.4, radius: 13, height: 5.5 });

  useFrame((_, dt) => {
    ref.current.angle += dt * 0.04;
    const { angle, radius, height } = ref.current;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, height, 1.2, dt);
    camera.lookAt(0, 1, 0);
  });

  return null;
}

function GoldParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = Math.random() * 9 + 1.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.015;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += dt * 0.25;
      if (y > 11) y = 1.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={140} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F0CB55" transparent opacity={0.6} sizeAttenuation />
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
              'radial-gradient(ellipse at 30% 40%, rgba(212,168,43,0.18), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(20,30,60,0.6), transparent 50%), linear-gradient(180deg, #0a1628 0%, #051020 100%)',
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
        gl.setClearColor(new THREE.Color('#040a14'), 1);
      }}
    >
      <PerspectiveCamera makeDefault fov={45} position={[10, 6, 10]} />
      <AutoCamera />

      <fog attach="fog" args={['#040a14', 12, 28]} />

      <ambientLight intensity={0.3} color="#3a4a6a" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.1}
        color="#ffe8b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 4, -6]} intensity={0.6} color="#D4A82B" />
      <pointLight position={[5, 2, 6]} intensity={0.4} color="#F0CB55" />
      <pointLight position={[0, 8, 0]} intensity={0.25} color="#5fa9c9" />

      <Stars radius={50} depth={50} count={1200} factor={2.5} fade speed={0.3} />
      <GoldParticles />

      <GroundPlate />
      <GridLines />
      {CITY.map((b) => (
        <Building key={b.id} {...b} hovered={hovered === b.id} onHover={setHovered} />
      ))}

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.5} mipmapBlur />
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
              Ankara · İmarlı Arsa
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-7xl">
              Toprağın <span className="gold-text italic">değerini</span><br />
              bilenler için.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
              GYD Grup, Ankara genelinde imarlı arsa alım-satımı, yatırım danışmanlığı ve hukuki süreç yönetiminde 15+ yıllık tecrübesiyle yanınızda.
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

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Sparkles as SparklesIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Laptop() {
  return (
    <group position={[-1.8, 0.4, 0.3]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1.6]} />
        <meshStandardMaterial color="#0a1628" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, -0.78]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[2.4, 1.5, 0.06]} />
        <meshStandardMaterial color="#040a14" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.86, -0.74]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[2.3, 1.4]} />
        <meshBasicMaterial color="#0a1628" />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 32]} />
        <meshBasicMaterial color="#D4A82B" transparent opacity={0.4} />
      </mesh>
      <Html position={[0, 0.86, -0.72]} rotation={[-0.25, 0, 0]} center distanceFactor={2.5} zIndexRange={[100, 0]}>
        <div className="flex h-32 w-72 flex-col gap-1.5 rounded-md border border-accent/30 bg-background/95 p-3 shadow-2xl shadow-accent/30 backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="ml-2 text-[10px] text-muted-foreground">vexabiz.com.tr</div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-3/4 rounded bg-accent/40" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-5/6 rounded bg-white/10" />
            <div className="h-1 w-2/3 rounded bg-white/10" />
            <div className="mt-1.5 h-4 w-1/3 rounded bg-gradient-to-r from-accent to-accent/60" />
          </div>
        </div>
      </Html>
    </group>
  );
}

function Monitor() {
  return (
    <group position={[0, 0.9, -1.5]} rotation={[0, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 1.4, 0.08]} />
        <meshStandardMaterial color="#040a14" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.75, 0]} castShadow>
        <boxGeometry args={[0.08, 0.1, 0.3]} />
        <meshStandardMaterial color="#0a1628" metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.4]} />
        <meshStandardMaterial color="#0a1628" metalness={0.6} />
      </mesh>
      <Html position={[0, 0, 0.06]} center distanceFactor={2.5} zIndexRange={[100, 0]}>
        <div className="flex h-32 w-72 flex-col gap-1.5 rounded-md border border-accent/30 bg-background/95 p-2.5 shadow-2xl shadow-accent/30 backdrop-blur-md pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-accent">Meta Business Suite</div>
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['FB', 'IG', 'WA'].map((c) => (
              <div key={c} className="rounded border border-accent/20 bg-accent/5 p-1 text-center text-[9px] font-semibold text-accent">
                {c}
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-4/5 rounded bg-white/10" />
            <div className="h-1 w-2/3 rounded bg-white/10" />
          </div>
          <div className="mt-auto flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">Pixel ✓</span>
            <span className="text-emerald-400">CAPI ✓</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function Phone({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.95, 0.05]} />
        <meshStandardMaterial color="#0a1628" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.45, 0.9]} />
        <meshBasicMaterial color="#040a14" />
      </mesh>
      <Html position={[0, 0, 0.027]} center distanceFactor={2} zIndexRange={[100, 0]}>
        <div className="flex h-44 w-24 flex-col gap-1 rounded-md border border-accent/30 bg-background/95 p-1.5 shadow-2xl shadow-accent/30 backdrop-blur-md pointer-events-none">
          <div className="flex items-center justify-between text-[7px] text-muted-foreground">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1 w-3/4 rounded bg-accent/40" />
            <div className="rounded bg-accent/10 p-1">
              <div className="text-[7px] text-foreground/80">Hoş geldiniz!</div>
            </div>
            <div className="ml-auto h-3 w-3/4 rounded bg-accent/20" />
            <div className="ml-auto h-3 w-1/2 rounded bg-accent/20" />
            <div className="rounded bg-white/5 p-1">
              <div className="h-0.5 w-full rounded bg-white/10" />
              <div className="mt-0.5 h-0.5 w-3/4 rounded bg-white/10" />
            </div>
          </div>
          <div className="text-center text-[6px] text-accent">💬 Cevap yaz</div>
        </div>
      </Html>
    </group>
  );
}

function NetworkConnections() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.08;
  });

  const nodes = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      arr.push([Math.cos(angle) * 4, 1.5 + Math.sin(i * 1.3) * 0.8, Math.sin(angle) * 4]);
    }
    return arr;
  }, []);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#D4A82B" />
        </mesh>
      ))}
      {nodes.map((pos, i) => {
        const next = nodes[(i + 1) % nodes.length];
        const mid: [number, number, number] = [(pos[0] + next[0]) / 2, (pos[1] + next[1]) / 2 + 0.5, (pos[2] + next[2]) / 2];
        return <ConnectionLine key={`l-${i}`} from={pos} to={mid} />;
      })}
    </group>
  );
}

function ConnectionLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const matRef = useRef<THREE.LineBasicMaterial | null>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...from, ...to], 3));
    return g;
  }, [from, to]);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.3 + Math.sin(performance.now() * 0.001 + from[0]) * 0.2;
    }
  });

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial ref={matRef} color="#D4A82B" transparent opacity={0.3} />
    </lineSegments>
  );
}

function Desk() {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#0a1628" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[-3.7, -0.8, 0]}>
        <boxGeometry args={[0.15, 1.6, 4]} />
        <meshStandardMaterial color="#0a1628" metalness={0.4} />
      </mesh>
      <mesh position={[3.7, -0.8, 0]}>
        <boxGeometry args={[0.15, 1.6, 4]} />
        <meshStandardMaterial color="#0a1628" metalness={0.4} />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <boxGeometry args={[8, 0.05, 0.15]} />
        <meshStandardMaterial color="#0a1628" metalness={0.4} />
      </mesh>
    </group>
  );
}

function GoldParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = Math.random() * 6 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.015;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += dt * 0.18;
      if (y > 7) y = 0.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={150} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#F0CB55" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function FloorGrid() {
  const ref = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => {
    const v: number[] = [];
    const size = 16, step = 1.5;
    for (let i = -size; i <= size; i += step) {
      v.push(-size, -1.7, i, size, -1.7, i);
      v.push(i, -1.7, -size, i, -1.7, size);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);

  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color="#D4A82B" transparent opacity={0.06} />
    </lineSegments>
  );
}

function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#040a14'), 1); }}
    >
      <PerspectiveCamera makeDefault fov={45} position={[0, 3.5, 8]} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={6}
        maxDistance={14}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.08}
        target={[0, 1, 0]}
      />

      <fog attach="fog" args={['#040a14', 10, 30]} />

      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[8, 12, 6]} intensity={0.9} color="#ffe8b8" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 3, -2]} intensity={0.6} color="#D4A82B" distance={10} />
      <pointLight position={[4, 2, 3]} intensity={0.4} color="#3b82f6" distance={8} />

      <GoldParticles />
      <FloorGrid />
      <Desk />
      <Monitor />
      <Laptop />
      <Phone position={[2.3, 0.55, 1.3]} rotation={[0, -0.6, 0.05]} />
      <Phone position={[-2.6, 0.55, 1.2]} rotation={[0, 0.5, -0.05]} />
      <NetworkConnections />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}

function MobileFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#040a14]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 30%, rgba(212,168,43,0.18), transparent 50%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.12), transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,43,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,43,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 p-6">
          {[
            { label: 'Meta BM', icon: '📱', color: 'from-blue-500/20 to-blue-500/5' },
            { label: 'Web', icon: '💻', color: 'from-emerald-500/20 to-emerald-500/5' },
          ].map((it) => (
            <div
              key={it.label}
              className={`flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${it.color} p-6 backdrop-blur-md`}
            >
              <div className="text-3xl">{it.icon}</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero3D() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        {isMobile ? <MobileFallback /> : <HeroScene />}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="pointer-events-auto max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-accent">
              <SparklesIcon className="h-3 w-3" />
              Dijital Dönüşüm Ortağınız
            </div>

            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-7xl">
              Hemen olsun istemez <span className="gold-text italic">misiniz?</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
              Vexabiz Digital, Türkiye genelinde KOBİ ve işletmelere Meta Business Manager ve kurumsal web sitesi kurulumu yapıyor.
            </p>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/60 sm:text-base">
              <span className="text-accent">Doğru olsun istemez misiniz?</span> 1 kerede tam olsun ister misiniz?
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/hizmetler"
                className="group inline-flex items-center gap-2 rounded-md bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:shadow-accent/50"
              >
                Hizmetleri Keşfet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/iletisim"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-white/[0.08]"
              >
                Ücretsiz Keşif
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Aşağı kaydır</div>
        <div className="mx-auto mt-2 h-8 w-px animate-pulse bg-gradient-to-b from-foreground/40 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </section>
  );
}

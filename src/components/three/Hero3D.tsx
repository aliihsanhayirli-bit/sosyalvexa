import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { pb } from '@/lib/pb';
import { formatPrice, formatArea } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  reserved: '#F59E0B',
  sold: '#EF4444',
};

const REGION_POS: Record<string, [number, number]> = {
  cankaya:    [ 0,  0],
  altindag:   [ 0, -3],
  yenimahalle: [ 2, -5],
  kecioren:   [ 4, -4],
  pursaklar:  [ 6, -5],
  mamak:      [ 3,  0],
  etimesgut:  [-4, -2],
  sincan:     [-4, -5],
  polatli:    [-8, -9],
};

interface Listing {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  area_m2: number;
  region: string;
  status: string;
}

function getRegionPos(slug?: string): [number, number] {
  if (!slug) return [0, 0];
  return REGION_POS[slug.toLowerCase()] || [0, 0];
}

function noise2D(x: number, z: number): number {
  return (
    Math.sin(x * 0.32) * 0.55 +
    Math.cos(z * 0.41) * 0.35 +
    Math.sin(x * 0.73 + z * 0.51) * 0.22 +
    Math.cos(x * 1.21 - z * 0.83) * 0.16
  );
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function TopoMap() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(34, 30, 96, 80);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const low = new THREE.Color('#0a1830');
    const mid = new THREE.Color('#1a2c4a');
    const high = new THREE.Color('#2a4060');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = noise2D(x, z) * 0.8;
      pos.setY(i, h);
      const t = THREE.MathUtils.clamp((h + 0.8) / 1.6, 0, 1);
      const c = t < 0.5
        ? low.clone().lerp(mid, t * 2)
        : mid.clone().lerp(high, (t - 0.5) * 2);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh receiveShadow geometry={geom}>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.08} />
    </mesh>
  );
}

function ContourLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => {
    const verts: number[] = [];
    const step = 0.5;
    const half = 15;
    const levels = [-0.4, 0.0, 0.4];
    for (const level of levels) {
      for (let i = -half; i < half; i += step) {
        for (let j = -half; j < half; j += step) {
          const h1 = noise2D(i, j) * 0.8;
          const h2 = noise2D(i + step, j) * 0.8;
          if ((h1 - level) * (h2 - level) < 0) {
            const t = (level - h1) / (h2 - h1);
            verts.push(i + t * step, 0.02, j, i + t * step + 0.01, 0.02, j);
          }
          const h3 = noise2D(i, j + step) * 0.8;
          if ((h1 - level) * (h3 - level) < 0) {
            const t = (level - h1) / (h3 - h1);
            verts.push(i, 0.02, j + t * step, i, 0.02, j + t * step + 0.01);
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.12 + Math.sin(performance.now() * 0.0006) * 0.05;
  });

  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color="#D4A82B" transparent opacity={0.15} />
    </lineSegments>
  );
}

function ListingMarker({
  listing,
  hovered,
  onHover,
}: {
  listing: Listing;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const [cx, cz] = getRegionPos(listing.region);
  const h = hashId(listing.id);
  const angle = (h % 360) * (Math.PI / 180);
  const dist = ((h % 100) / 100) * 1.4 + 0.4;
  const x = cx + Math.cos(angle) * dist;
  const z = cz + Math.sin(angle) * dist;
  const ground = 0.25 + noise2D(x, z) * 0.8;

  const size = 0.28 + Math.min(listing.area_m2, 5000) / 5000 * 0.42;
  const color = STATUS_COLORS[listing.status] || STATUS_COLORS.available;

  const ref = useRef<THREE.Group>(null);
  const targetY = hovered ? ground + 0.4 : ground;

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 4, dt);
    const s = hovered ? 1.55 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
  });

  return (
    <group
      ref={ref}
      position={[x, ground, z]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(listing.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
    >
      <mesh castShadow>
        <boxGeometry args={[size, 0.6, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.7 : 0.35}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[size * 1.05, 0.04, size * 1.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.9, 0]} center distanceFactor={11} zIndexRange={[100, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-lg border border-accent/40 bg-background/90 px-3 py-2 shadow-2xl shadow-accent/20 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-wider text-accent">
              {listing.region} · {listing.status === 'available' ? 'Satılık' : listing.status === 'reserved' ? 'Rezerve' : 'Satıldı'}
            </div>
            <div className="mt-0.5 font-display text-lg font-semibold text-foreground">
              {formatPrice(listing.price, (listing.currency as 'TRY' | 'USD') || 'TRY')}
            </div>
            <div className="text-[11px] text-muted-foreground">{formatArea(listing.area_m2)}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function RegionLabels({ listings }: { listings: Listing[] }) {
  const regionsShown = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const l of listings) {
      const slug = (l.region || '').toLowerCase();
      if (!map.has(slug)) {
        const [x, z] = getRegionPos(slug);
        map.set(slug, [x, z, 1]);
      } else {
        map.set(slug, [map.get(slug)![0], map.get(slug)![1], map.get(slug)![2] + 1]);
      }
    }
    return Array.from(map.entries());
  }, [listings]);

  return (
    <>
      {regionsShown.map(([slug, [x, z, count]]) => {
        const h = noise2D(x, z) * 0.8;
        return (
          <Html
            key={slug}
            position={[x, h + 2.2, z]}
            center
            distanceFactor={14}
            zIndexRange={[50, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="rounded-md border border-white/10 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent/80 backdrop-blur-sm">
              {slug} · {count}
            </div>
          </Html>
        );
      })}
    </>
  );
}

function SlowCamera() {
  const { camera } = useThree();
  const ref = useRef({ angle: 0.6, radius: 22, height: 14 });

  useFrame((_, dt) => {
    ref.current.angle += dt * 0.018;
    const { angle, radius, height } = ref.current;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 0.6, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 0.6, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, height, 0.6, dt);
    camera.lookAt(0, 0, -2);
  });

  return null;
}

function GoldParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 32;
      arr[i * 3 + 1] = Math.random() * 8 + 1.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.012;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += dt * 0.22;
      if (y > 10) y = 1.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={120} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F0CB55" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function HeroScene({ listings }: { listings: Listing[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
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
      <PerspectiveCamera makeDefault fov={50} position={[18, 14, 18]} />
      <SlowCamera />

      <fog attach="fog" args={['#040a14', 18, 38]} />

      <ambientLight intensity={0.4} color="#3a4a6a" />
      <directionalLight position={[10, 14, 6]} intensity={1.0} color="#ffe8b8" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 4, -6]} intensity={0.5} color="#D4A82B" />
      <pointLight position={[6, 3, 6]} intensity={0.4} color="#F0CB55" />

      <GoldParticles />

      <TopoMap />
      <ContourLines />

      {listings.map((l) => (
        <ListingMarker key={l.id} listing={l} hovered={hovered === l.id} onHover={setHovered} />
      ))}

      <RegionLabels listings={listings} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}

export function Hero3D() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    let cancelled = false;
    pb.collection('listings')
      .getList<Listing>(1, 80, { filter: 'published = true', sort: '-featured,-created' })
      .then(({ items }) => { if (!cancelled) setListings(items); })
      .catch(() => { /* sessiz — boş sahne fallback */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <HeroScene listings={listings} />
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

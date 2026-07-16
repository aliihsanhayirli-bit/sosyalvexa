import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pb, getFileUrl } from '@/lib/pb';
import { formatPrice, formatArea } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  reserved: '#F59E0B',
  sold: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Satılık',
  reserved: 'Rezerve',
  sold: 'Satıldı',
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

const REGION_TONES: Record<string, THREE.Color> = {
  cankaya:    new THREE.Color('#0f1d3a'),
  altindag:   new THREE.Color('#0d1b32'),
  yenimahalle: new THREE.Color('#0b1930'),
  kecioren:   new THREE.Color('#122242'),
  pursaklar:  new THREE.Color('#0a1c34'),
  mamak:      new THREE.Color('#0c1830'),
  etimesgut:  new THREE.Color('#0a1628'),
  sincan:     new THREE.Color('#0d1f36'),
  polatli:    new THREE.Color('#0a1828'),
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
  photos: string[];
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

function nearestRegion(x: number, z: number): string {
  let nearest = 'cankaya';
  let minDist = Infinity;
  for (const [slug, [rx, rz]] of Object.entries(REGION_POS)) {
    const d = (x - rx) ** 2 + (z - rz) ** 2;
    if (d < minDist) { minDist = d; nearest = slug; }
  }
  return nearest;
}

function generateParcelShape(id: string, baseR: number): THREE.Shape {
  const h = hashId(id);
  const sides = 4 + (h % 3);
  const phaseOffset = ((h >> 4) % 360) * Math.PI / 180;
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + phaseOffset;
    const r = baseR * (0.7 + (((h >> (i * 5 + 8)) & 0xff) / 255) * 0.55);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

const WINDOW_TEXTURE = (() => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, c.width, c.height);
  const cols = 3;
  const rows = 7;
  const padX = 4;
  const padY = 4;
  const w = (c.width - padX * 2) / cols;
  const h = (c.height - padY * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const lit = Math.random() < 0.4;
      const x = padX + cc * w + 1;
      const y = padY + r * h + 1;
      const ww = w - 2;
      const hh = h - 2;
      ctx.fillStyle = lit ? (Math.random() < 0.5 ? '#F0CB55' : '#5fa9c9') : '#0a1628';
      ctx.fillRect(x, y, ww, hh);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

const SKYLINE = (() => {
  const buildings: { x: number; z: number; w: number; d: number; h: number; tone: number }[] = [];
  const seeds: { x: number; z: number; w: number; d: number; h: number; tone: number }[] = [];
  const cols = 4;
  const rows = 2;
  const stepX = 1.6;
  const stepZ = 1.6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c - (cols - 1) / 2) * stepX + (Math.random() - 0.5) * 0.2;
      const cz = (r - (rows - 1) / 2) * stepZ + (Math.random() - 0.5) * 0.2;
      const w = 0.55 + Math.random() * 0.4;
      const d = 0.55 + Math.random() * 0.4;
      const h = 1.5 + Math.random() * 3.2;
      const tone = 0.6 + Math.random() * 0.3;
      seeds.push({ x: cx, z: cz + 7, w, d, h, tone });
    }
  }
  return seeds;
})();

function CityBackdrop() {
  return (
    <group>
      {SKYLINE.map((b, i) => {
        const repeats = { u: Math.max(1, Math.round(b.w * 1.6)), v: Math.max(1, Math.round(b.h * 0.9)) };
        const tex = WINDOW_TEXTURE.clone();
        tex.needsUpdate = true;
        tex.repeat.set(repeats.u, repeats.v);
        return (
          <mesh key={i} position={[b.x, b.h / 2 + 0.05, b.z]} castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              map={tex}
              color={new THREE.Color('#0c1626').multiplyScalar(b.tone)}
              emissive="#1a2840"
              emissiveIntensity={0.18}
              metalness={0.5}
              roughness={0.55}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function TopoMap() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(34, 30, 96, 80);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = noise2D(x, z) * 0.8;
      pos.setY(i, h);

      const region = nearestRegion(x, z);
      const base = REGION_TONES[region] || REGION_TONES.cankaya;
      const elevFactor = 0.85 + Math.max(0, h) * 0.22;
      const c = base.clone().multiplyScalar(elevFactor);
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

  const sizeScale = 0.55 + Math.min(listing.area_m2, 5000) / 5000 * 0.65;
  const color = STATUS_COLORS[listing.status] || STATUS_COLORS.available;
  const statusLabel = STATUS_LABELS[listing.status] || listing.status;
  const pulse = listing.status === 'available';

  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const shape = useMemo(() => generateParcelShape(listing.id, 1.0), [listing.id]);
  const extrudeSettings = useMemo(
    () => ({
      depth: 0.35 + (listing.area_m2 / 5000) * 0.4,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    }),
    [listing.area_m2]
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    const targetY = hovered ? ground + 0.4 : ground;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 4, dt);
    const s = THREE.MathUtils.damp(ref.current.scale.x, hovered ? 1.45 : 1, 8, dt);
    ref.current.scale.set(s, s, s);

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const base = hovered ? 0.7 : 0.4;
      const wobble = pulse ? Math.sin(performance.now() * 0.003) * 0.18 : 0;
      mat.emissiveIntensity = THREE.MathUtils.clamp(base + wobble, 0.2, 0.9);
    }
  });

  const photoUrl =
    listing.photos && listing.photos.length > 0 && listing.collectionId
      ? getFileUrl({ collectionId: listing.collectionId, id: listing.id }, listing.photos[0])
      : null;

  return (
    <group
      ref={ref}
      position={[x, ground, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(listing.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        window.location.href = `/arsalar/${listing.slug}`;
      }}
    >
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[sizeScale, sizeScale, 1]}
        castShadow
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sizeScale * 0.75, sizeScale * 0.95, 24]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.18} />
      </mesh>

      {hovered && (
        <Html
          position={[0, 0.95, 0]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="w-60 overflow-hidden rounded-lg border border-accent/40 bg-background/95 shadow-2xl shadow-accent/30 backdrop-blur-md">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-28 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/30 to-accent/20 text-foreground/40">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <div className="p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-accent">
                {listing.region} · {statusLabel}
              </div>
              <div className="mt-0.5 line-clamp-1 font-display text-sm font-semibold text-foreground">
                {listing.title}
              </div>
              <div className="mt-1.5 flex items-end justify-between border-t border-white/10 pt-1.5">
                <div>
                  <div className="text-[10px] text-muted-foreground">{formatArea(listing.area_m2)}</div>
                  <div className="font-display text-base font-semibold text-foreground">
                    {formatPrice(listing.price, (listing.currency as 'TRY' | 'USD') || 'TRY')}
                  </div>
                </div>
                <Link
                  to={`/arsalar/${listing.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-foreground transition-all hover:brightness-110"
                >
                  Detay →
                </Link>
              </div>
            </div>
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
        const cur = map.get(slug)!;
        map.set(slug, [cur[0], cur[1], cur[2] + 1]);
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

function Legend({ listings }: { listings: Listing[] }) {
  const regionCount = useMemo(
    () => new Set(listings.map((l) => l.region.toLowerCase())).size,
    [listings]
  );

  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-10 rounded-lg border border-white/10 bg-background/80 p-3 backdrop-blur-md">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Parsel Durumu</div>
      <div className="mt-2 space-y-1.5">
        {(Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map((k) => (
          <div key={k} className="flex items-center gap-2 text-xs text-foreground/85">
            <span
              className="h-3 w-3 rounded-sm shadow ring-1 ring-white/10"
              style={{ background: STATUS_COLORS[k] }}
            />
            {STATUS_LABELS[k]}
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-muted-foreground">
        {listings.length} parsel · {regionCount} bölge
      </div>
    </div>
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
      <CityBackdrop />

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

      {listings.length > 0 && <Legend listings={listings} />}

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

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Aşağı kaydır</div>
        <div className="mx-auto mt-2 h-8 w-px animate-pulse bg-gradient-to-b from-foreground/40 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </section>
  );
}

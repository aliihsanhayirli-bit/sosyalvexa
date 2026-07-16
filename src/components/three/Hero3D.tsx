import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Html, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';
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

const REGION_CENTER: Record<string, [number, number]> = {
  cankaya:    [39.92, 32.85],
  altindag:   [39.96, 32.86],
  yenimahalle:[39.97, 32.81],
  kecioren:   [40.00, 32.86],
  pursaklar:  [40.04, 32.89],
  mamak:      [39.94, 32.91],
  etimesgut:  [39.95, 32.69],
  sincan:     [39.97, 32.58],
  polatli:    [39.58, 32.14],
};

const ANKARA_CENTER: [number, number] = [39.92, 32.85];
const PLANE_HALF = 24;
const KM_PER_UNIT = 1.2;

function latLngToXZ(lat: number, lng: number): [number, number] {
  const x = (lng - ANKARA_CENTER[1]) * (85 / KM_PER_UNIT) / 40 * PLANE_HALF / 12;
  const z = -(lat - ANKARA_CENTER[0]) * (111 / KM_PER_UNIT) / 40 * PLANE_HALF / 12;
  return [x, z];
}

function regionToXZ(slug: string): [number, number] {
  const c = REGION_CENTER[slug.toLowerCase()];
  if (!c) return [0, 0];
  return latLngToXZ(c[0], c[1]);
}

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
  lat?: number;
  lng?: number;
}

function noise2D(x: number, z: number): number {
  return (
    Math.sin(x * 0.32) * 0.45 +
    Math.cos(z * 0.41) * 0.30 +
    Math.sin(x * 0.73 + z * 0.51) * 0.18
  );
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
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
  c.width = 64; c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, c.width, c.height);
  const cols = 3, rows = 7, padX = 4, padY = 4;
  const w = (c.width - padX * 2) / cols;
  const h = (c.height - padY * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const lit = Math.random() < 0.4;
      ctx.fillStyle = lit ? (Math.random() < 0.5 ? '#F0CB55' : '#5fa9c9') : '#0a1628';
      ctx.fillRect(padX + cc * w + 1, padY + r * h + 1, w - 2, h - 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

const SKYLINE = (() => {
  const seeds: { x: number; z: number; w: number; d: number; h: number; tone: number }[] = [];
  const cols = 4, rows = 2, stepX = 1.6, stepZ = 1.6;
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

function MapBase() {
  const tex = useLoader(THREE.TextureLoader, '/ankara-map.png');
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[PLANE_HALF * 2, PLANE_HALF * 2]} />
      <meshStandardMaterial map={tex} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

function MapBorder() {
  const verts = useMemo(() => {
    const v: number[] = [];
    const h = PLANE_HALF;
    v.push(-h, 0.02, -h,  h, 0.02, -h);
    v.push( h, 0.02, -h,  h, 0.02,  h);
    v.push( h, 0.02,  h, -h, 0.02,  h);
    v.push(-h, 0.02,  h, -h, 0.02, -h);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={verts}>
      <lineBasicMaterial color="#D4A82B" transparent opacity={0.6} />
    </lineSegments>
  );
}

function ContourLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => {
    const verts: number[] = [];
    const step = 0.5, half = PLANE_HALF, levels = [-0.3, 0.0, 0.3];
    for (const level of levels) {
      for (let i = -half; i < half; i += step) {
        for (let j = -half; j < half; j += step) {
          const h1 = noise2D(i, j);
          const h2 = noise2D(i + step, j);
          if ((h1 - level) * (h2 - level) < 0) {
            const t = (level - h1) / (h2 - h1);
            verts.push(i + t * step, 0.03, j, i + t * step + 0.01, 0.03, j);
          }
          const h3 = noise2D(i, j + step);
          if ((h1 - level) * (h3 - level) < 0) {
            const t = (level - h1) / (h3 - h1);
            verts.push(i, 0.03, j + t * step, i, 0.03, j + t * step + 0.01);
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
    mat.opacity = 0.1 + Math.sin(performance.now() * 0.0006) * 0.05;
  });

  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color="#D4A82B" transparent opacity={0.1} />
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
  const [cx, cz] = listing.lat != null && listing.lng != null
    ? latLngToXZ(listing.lat, listing.lng)
    : regionToXZ(listing.region);
  const h = hashId(listing.id);
  const jitterAngle = (h % 360) * (Math.PI / 180);
  const jitterDist = ((h % 100) / 100) * 0.7 + 0.2;
  const x = cx + Math.cos(jitterAngle) * jitterDist;
  const z = cz + Math.sin(jitterAngle) * jitterDist;
  const ground = 0.18;

  const sizeScale = 0.55 + Math.min(listing.area_m2, 5000) / 5000 * 0.65;
  const color = STATUS_COLORS[listing.status] || STATUS_COLORS.available;
  const statusLabel = STATUS_LABELS[listing.status] || listing.status;
  const pulse = listing.status === 'available';

  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const shape = useMemo(() => generateParcelShape(listing.id, 1.0), [listing.id]);
  const extrudeSettings = useMemo(
    () => ({
      depth: 0.4 + (listing.area_m2 / 5000) * 0.4,
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
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={[sizeScale, sizeScale, 1]} castShadow>
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
        <Html position={[0, 0.95, 0]} center distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'auto' }}>
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

function RegionLabels({
  listings,
  selected,
  onSelect,
}: {
  listings: Listing[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const l of listings) {
      const slug = (l.region || '').toLowerCase();
      if (!map.has(slug)) {
        const [x, z] = regionToXZ(slug);
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
      {groups.map(([slug, [x, z, count]]) => {
        const isSelected = selected === slug;
        return (
          <Html
            key={slug}
            position={[x, 1.8, z]}
            center
            distanceFactor={12}
            zIndexRange={[60, 0]}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isSelected ? null : slug);
              }}
              className={`pointer-events-auto group flex flex-col items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md transition-all ${
                isSelected
                  ? 'border-accent bg-accent/20 text-accent shadow-lg shadow-accent/30'
                  : 'border-white/10 bg-background/70 text-accent/80 hover:border-accent/40 hover:bg-background/90'
              }`}
            >
              <span>{slug}</span>
              {count >= 3 && (
                <span className="rounded-full bg-accent px-1.5 text-[9px] text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
          </Html>
        );
      })}
    </>
  );
}

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

function CameraFocus({ focusedRegion }: { focusedRegion: string | null }) {
  const controls = useThree((s) => s.controls) as any;
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (focusedRegion) {
      const [x, z] = regionToXZ(focusedRegion);
      targetPos.current.set(x, 0, z);
    } else {
      targetPos.current.set(0, 0, 0);
    }
  }, [focusedRegion]);

  useFrame((_, dt) => {
    if (controls && focusedRegion) {
      controls.target.lerp(targetPos.current, Math.min(dt * 2.5, 1));
    }
  });

  return null;
}

function CameraTracker({ onUpdate }: { onUpdate: (x: number, z: number) => void }) {
  const { camera } = useThree();
  useFrame(() => {
    onUpdate(camera.position.x, camera.position.z);
  });
  return null;
}

function Legend({ listings, selectedRegion, onSelectRegion }: {
  listings: Listing[];
  selectedRegion: string | null;
  onSelectRegion: (slug: string | null) => void;
}) {
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
            <span className="h-3 w-3 rounded-sm shadow ring-1 ring-white/10" style={{ background: STATUS_COLORS[k] }} />
            {STATUS_LABELS[k]}
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-muted-foreground">
        {listings.length} parsel · {regionCount} bölge
      </div>
      <button
        onClick={() => onSelectRegion(null)}
        className={`pointer-events-auto mt-2 w-full rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
          selectedRegion
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-white/10 bg-white/[0.04] text-muted-foreground opacity-50'
        }`}
        disabled={!selectedRegion}
      >
        {selectedRegion ? `✓ ${selectedRegion} seçili · Sıfırla` : 'Tüm haritayı göster'}
      </button>
    </div>
  );
}

function MiniMap({ camX, camZ }: { camX: number; camZ: number }) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-10 overflow-hidden rounded-lg border border-white/10 bg-background/80 backdrop-blur-md">
      <div
        className="h-32 w-32 bg-cover bg-center opacity-90"
        style={{ backgroundImage: 'url(/ankara-map.png)' }}
      />
      <div className="absolute inset-0 border-2 border-accent/40 rounded-lg" />
      <div
        className="absolute h-2 w-2 rounded-full bg-accent shadow-lg shadow-accent/60 ring-2 ring-background"
        style={{
          left: `${50 + (camX / (PLANE_HALF * 2)) * 100}%`,
          top: `${50 + (camZ / (PLANE_HALF * 2)) * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-background/85 px-2 py-1 text-center text-[9px] font-semibold uppercase tracking-wider text-accent">
        Konum
      </div>
    </div>
  );
}

function Attribution() {
  return (
    <div className="pointer-events-none absolute bottom-1 left-1/2 z-10 -translate-x-1/2 rounded bg-background/70 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
      © OpenStreetMap contributors
    </div>
  );
}

function pinPos(l: Listing): { x: number; y: number } {
  const [px, pz] = l.lat != null && l.lng != null
    ? latLngToXZ(l.lat, l.lng)
    : regionToXZ(l.region);
  const h = hashId(l.id);
  const jitterAngle = (h % 360) * (Math.PI / 180);
  const jitterDist = ((h % 100) / 100) * 0.025 + 0.005;
  const x = px + Math.cos(jitterAngle) * jitterDist;
  const y = pz + Math.sin(jitterAngle) * jitterDist;
  return {
    x: 50 + (x / (PLANE_HALF * 2)) * 100,
    y: 50 + (y / (PLANE_HALF * 2)) * 100,
  };
}

function shortPrice(p: number): string {
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(p >= 10_000_000 ? 0 : 1)}M`;
  if (p >= 1_000) return `${(p / 1_000).toFixed(0)}K`;
  return `${p}`;
}

function MobileMap({ listings }: { listings: Listing[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId ? listings.find((l) => l.id === activeId) : null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a1628]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/ankara-map.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/40 to-background/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

      {listings.map((l) => {
        const pos = pinPos(l);
        const color = STATUS_COLORS[l.status] || STATUS_COLORS.available;
        const isActive = activeId === l.id;
        return (
          <a
            key={l.id}
            href={`/arsalar/${l.slug}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveId(isActive ? null : l.id);
            }}
            className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-lg ring-2 ring-background transition-transform ${
              isActive ? 'scale-125 z-30' : 'z-20'
            } ${l.status === 'available' ? 'animate-pulse' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: color }}
            aria-label={`${l.region} — ${formatPrice(l.price, (l.currency as 'TRY' | 'USD') || 'TRY')}`}
          >
            {shortPrice(l.price)}
          </a>
        );
      })}

      {active && (
        <div className="absolute inset-x-3 bottom-20 z-30 rounded-xl border border-accent/40 bg-background/95 p-3 shadow-2xl shadow-accent/30 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white/10"
              style={{ background: STATUS_COLORS[active.status] }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-accent">
                {active.region} · {STATUS_LABELS[active.status] || active.status}
              </div>
              <div className="mt-0.5 line-clamp-2 font-display text-sm font-semibold text-foreground">
                {active.title}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground">{formatArea(active.area_m2)}</div>
                  <div className="font-display text-base font-semibold text-foreground">
                    {formatPrice(active.price, (active.currency as 'TRY' | 'USD') || 'TRY')}
                  </div>
                </div>
                <Link
                  to={`/arsalar/${active.slug}`}
                  onClick={() => setActiveId(null)}
                  className="rounded bg-accent px-3 py-1.5 text-[10px] font-semibold text-accent-foreground"
                >
                  Detay →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-20 z-10 rounded-lg border border-white/10 bg-background/80 p-2 backdrop-blur-md">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Parsel</div>
        <div className="mt-1 space-y-1">
          {(Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map((k) => (
            <div key={k} className="flex items-center gap-1.5 text-[10px] text-foreground/80">
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10" style={{ background: STATUS_COLORS[k] }} />
              {STATUS_LABELS[k]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroScene({
  listings,
  focusedRegion,
  onSelectRegion,
  onCameraUpdate,
}: {
  listings: Listing[];
  focusedRegion: string | null;
  onSelectRegion: (slug: string | null) => void;
  onCameraUpdate: (x: number, z: number) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#040a14'), 1); }}
    >
      <PerspectiveCamera makeDefault fov={50} position={[0, 22, 22]} />
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={45}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate={!focusedRegion}
        autoRotateSpeed={0.25}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />
      <CameraFocus focusedRegion={focusedRegion} />
      <CameraTracker onUpdate={onCameraUpdate} />

      <fog attach="fog" args={['#040a14', 22, 50]} />

      <ambientLight intensity={0.55} color="#ffffff" />
      <directionalLight position={[10, 18, 8]} intensity={0.9} color="#ffe8b8" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 6, -6]} intensity={0.4} color="#D4A82B" />

      <GoldParticles />

      <MapBase />
      <MapBorder />
      <ContourLines />
      <CityBackdrop />

      {listings.map((l) => (
        <ListingMarker key={l.id} listing={l} hovered={hovered === l.id} onHover={setHovered} />
      ))}

      <RegionLabels listings={listings} selected={focusedRegion} onSelect={onSelectRegion} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}

export function Hero3D() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  const [camPos, setCamPos] = useState({ x: 0, z: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const onCameraUpdate = useCallback((x: number, z: number) => setCamPos({ x, z }), []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
        {isMobile ? (
          <MobileMap listings={listings} />
        ) : (
          <HeroScene
            listings={listings}
            focusedRegion={focusedRegion}
            onSelectRegion={setFocusedRegion}
            onCameraUpdate={onCameraUpdate}
          />
        )}
      </div>

      {listings.length > 0 && !isMobile && (
        <>
          <Legend
            listings={listings}
            selectedRegion={focusedRegion}
            onSelectRegion={setFocusedRegion}
          />
          <MiniMap camX={camPos.x} camZ={camPos.z} />
          <Attribution />
        </>
      )}

      {isMobile && listings.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded bg-background/70 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
          © OpenStreetMap contributors
        </div>
      )}

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

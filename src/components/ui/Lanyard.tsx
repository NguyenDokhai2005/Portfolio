'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';

import { useIsMobileEager } from '@/hooks/useIsMobile';

const CARD_GLB = '/assets/kartu.glb';
const BAND_TEXTURE = '/assets/bandd.png';
/**
 * Rebuilt baseColor atlas that swaps the portrait baked into `kartu.glb` for
 * the site owner's own photo. Same 512x512 layout, so the model's UVs still
 * line up. Regenerate with `node scripts/build-lanyard-texture.mjs`.
 */
const CARD_TEXTURE = '/assets/kartu-texture.png';

/** Idle showcase spin, in rad/s — one full turn every ~8.4s. */
const IDLE_SPIN_SPEED = 0.75;
/** How sharply the card eases back into the idle spin once released. */
const SPIN_RAMP = 2.2;

/** Camera distance the design was framed at; never move closer than this. */
const BASE_CAMERA_Z = 13;
/**
 * World-space half-width that must stay inside the frustum. The rope hangs the
 * card from an anchor at x = 3 and the card is ~1.6 units wide, so its right
 * edge rests near x = 3.8; the remainder is breathing room.
 */
const REQUIRED_HALF_WIDTH = 4.2;

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Record<string, unknown>;
    meshLineMaterial: Record<string, unknown>;
  }
}

/** Rapier's ref types predate React 19's nullable `useRef` signature. */
type BodyRef = RefObject<RapierRigidBody>;
const asBodyRef = (ref: RefObject<RapierRigidBody | null>) => ref as BodyRef;

/**
 * Interactive 3D lanyard badge: a fixed anchor connected to the card by three
 * rope-jointed spheres, rendered as a textured mesh line. Drag the card to
 * swing it — pointer events are disabled on mobile where physics is skipped.
 */
export default function Lanyard() {
  const isMobile = useIsMobileEager();

  return (
    <div
      className="responsive-wrapper"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 13], fov: 25 }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          pointerEvents: isMobile ? 'none' : 'auto',
        }}
      >
        <ambientLight intensity={Math.PI} />
        <FitCameraToCard />

        <Physics
          key={isMobile ? 'mobile' : 'desktop'}
          interpolate
          gravity={[0, -40, 0]}
          timeStep={1 / 60}
        >
          {!isMobile && <Band isMobile={isMobile} />}
        </Physics>

        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

/**
 * Keeps the card inside the frustum on portrait-ish canvases.
 *
 * A perspective camera's vertical extent is fixed by its fov and distance, but
 * the horizontal extent is that times the aspect ratio. The lanyard hangs at a
 * fixed world x, so once the canvas aspect drops below ~1.32 the card falls out
 * of frame and gets cropped at the right edge. Pulling the camera back restores
 * the horizontal room without touching the rope physics, so the swing, drag and
 * float behaviour are untouched.
 */
function FitCameraToCard() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    if (!width || !height) return;

    const aspect = width / height;
    const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const needed = REQUIRED_HALF_WIDTH / (Math.tan(halfFov) * aspect);

    // `max` so wide desktops keep the original framing exactly.
    camera.position.z = Math.max(BASE_CAMERA_Z, needed);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}

interface BandProps {
  isMobile: boolean;
  maxSpeed?: number;
  minSpeed?: number;
}

type LerpedRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 };

function Band({ isMobile, maxSpeed = 50, minSpeed = 10 }: BandProps) {
  const band = useRef<THREE.Mesh & { geometry: MeshLineGeometry }>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  /** Wraps only the meshes below the strap's clip, so the spin stays local. */
  const spin = useRef<THREE.Group>(null);
  /** Current spin rate, eased so drag pauses and releases are not abrupt. */
  const spinRate = useRef(0);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_GLB) as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.Material>;
  };
  const [texture, cardTexture] = useTexture([BAND_TEXTURE, CARD_TEXTURE]);
  const { width, height } = useThree((state) => state.size);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);

  const interactive = !isMobile;

  useRopeJoint(asBodyRef(fixed), asBodyRef(j1), [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(asBodyRef(j1), asBodyRef(j2), [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(asBodyRef(j2), asBodyRef(j3), [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(asBodyRef(j3), asBodyRef(card), [[0, 0, 0], [0, 1.45, 0]]);

  // glTF-embedded textures are uploaded unflipped and in sRGB. `useTexture`
  // defaults to flipY: true / no colour space, which would render the card
  // upside-down and washed out, so match the loader's conventions here.
  useEffect(() => {
    cardTexture.flipY = false;
    cardTexture.colorSpace = THREE.SRGBColorSpace;
    cardTexture.wrapS = cardTexture.wrapT = THREE.RepeatWrapping;
    cardTexture.anisotropy = 16;
    cardTexture.needsUpdate = true;
  }, [cardTexture]);

  useEffect(() => {
    if (!hovered || !interactive) return;
    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, dragged, interactive]);

  useFrame((state, delta) => {
    if (dragged && card.current && interactive) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());

      const x = vec.x - dragged.x;
      let y = vec.y - dragged.y;
      const z = vec.z - dragged.z;

      // Clamp upward drags so the card can't be flung above the anchor.
      if (state.pointer.y < (isMobile ? -0.1 : -0.2)) {
        y = card.current.translation().y;
      }

      card.current.setNextKinematicTranslation({ x, y, z });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current) {
      return;
    }

    // Smooth the two middle joints so the band reads as fabric, not a chain.
    [j1, j2].forEach((ref) => {
      const body = ref.current as LerpedRigidBody | null;
      if (!body) return;
      if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
      const distance = Math.max(
        0.1,
        Math.min(1, body.lerped.distanceTo(body.translation())),
      );
      // `1 - e^(-k·dt)` rather than the raw `k·dt`: with k up to 50, the product
      // passes 1 as soon as a frame takes longer than 20ms, and `Vector3.lerp`
      // with alpha > 1 overshoots its target. Every overshoot widens `distance`,
      // which raises k again, so a single hitched frame diverges the smoothed
      // point — measured at ~1e50 — and it never recovers, leaving the band
      // rendered from garbage coordinates near the clip. The exponential form is
      // bounded below 1 for any delta, and matches the old feel at 60fps.
      const smoothing = minSpeed + distance * (maxSpeed - minSpeed);
      body.lerped.lerp(body.translation(), 1 - Math.exp(-smoothing * delta));
    });

    const j1Body = j1.current as LerpedRigidBody;
    const j2Body = j2.current as LerpedRigidBody;

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2Body.lerped ?? j2Body.translation());
    curve.points[2].copy(j1Body.lerped ?? j1Body.translation());
    curve.points[3].copy(fixed.current.translation());
    band.current?.geometry?.setPoints(curve.getPoints(32));

    // The rigid body keeps its original restoring torque, so the whole assembly
    // — including the strap's clip — stays face-forward while it swings.
    ang.copy(card.current.angvel() as THREE.Vector3);
    rot.copy(card.current.rotation() as unknown as THREE.Vector3);
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);

    // The idle spin is a plain mesh rotation rather than angular velocity, so it
    // can be scoped to the card and its clamp and leave the clip untouched.
    // Rotating about the local Y axis works at any height: the axis is the
    // vertical line through x = 0, z = 0, which is where the clamp sits.
    if (spin.current) {
      spinRate.current = THREE.MathUtils.lerp(
        spinRate.current,
        dragged ? 0 : IDLE_SPIN_SPEED,
        1 - Math.exp(-SPIN_RAMP * delta),
      );
      spin.current.rotation.y += spinRate.current * delta;
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[3, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => interactive && setHovered(true)}
            onPointerOut={() => interactive && setHovered(false)}
            onPointerUp={(event) => {
              if (!interactive) return;
              (event.target as HTMLElement)?.releasePointerCapture?.(event.pointerId);
              setDragged(false);
            }}
            onPointerDown={(event) => {
              if (!interactive || !card.current) return;
              (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);
              setDragged(
                new THREE.Vector3()
                  .copy(event.point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
          >
            {/* Split at the strap's clip: `clamp` (y 0.93–1.12) is riveted to
                the card and turns with it, while `clip` (y 1.12–1.23) is the
                ring the strap threads through and must stay with the strap. */}
            <group ref={spin}>
              <mesh geometry={nodes.card.geometry}>
                <meshPhysicalMaterial
                  {...(materials.base as THREE.MeshPhysicalMaterial)}
                  map={cardTexture}
                />
              </mesh>
              <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            </group>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          transparent
          opacity={0.9}
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB);
useTexture.preload(BAND_TEXTURE);
useTexture.preload(CARD_TEXTURE);

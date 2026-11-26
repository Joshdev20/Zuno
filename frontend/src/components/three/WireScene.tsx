import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
  TorusKnotGeometry,
  WireframeGeometry,
} from 'three';
import { createStage } from './stage';

const INK = 0x7b5cff;
const DUST = 0x6fd3c7;

interface WireSceneProps {
  /** `cluster` is the hero shells; `knot` is the compact method-section object. */
  variant?: 'cluster' | 'knot';
}

export function WireScene({ variant = 'cluster' }: WireSceneProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;

    return createStage(mount, (scene) => {
      const group = new Group();
      scene.add(group);

      const geometry =
        variant === 'knot'
          ? new WireframeGeometry(new TorusKnotGeometry(1.2, 0.34, 48, 6))
          : new WireframeGeometry(new IcosahedronGeometry(2.05, 1));

      const primary = new LineSegments(
        geometry,
        new LineBasicMaterial({
          color: new Color(INK),
          transparent: true,
          opacity: variant === 'knot' ? 0.55 : 0.42,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(primary);

      const shell =
        variant === 'knot'
          ? null
          : new LineSegments(
              new WireframeGeometry(new IcosahedronGeometry(2.9, 0)),
              new LineBasicMaterial({
                color: new Color(INK),
                transparent: true,
                opacity: 0.16,
                blending: AdditiveBlending,
                depthWrite: false,
              }),
            );
      if (shell) group.add(shell);

      const count = variant === 'knot' ? 220 : 420;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const radius = variant === 'knot' ? 2.2 + Math.random() * 2.2 : 3.4 + Math.random() * 3.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
        positions[i * 3 + 2] = radius * Math.cos(phi) * 0.5;
      }
      const dustGeometry = new BufferGeometry();
      dustGeometry.setAttribute('position', new BufferAttribute(positions, 3));
      const dust = new Points(
        dustGeometry,
        new PointsMaterial({
          color: new Color(DUST),
          size: variant === 'knot' ? 0.04 : 0.045,
          transparent: true,
          opacity: 0.5,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(dust);

      if (variant === 'cluster') {
        // Keeps the cluster over the mock rather than the headline.
        group.position.x = 1.55;
      }

      return (elapsed, pointer) => {
        if (variant === 'knot') {
          group.rotation.set(elapsed * 0.22 + pointer.y * 0.3, elapsed * 0.3 + pointer.x * 0.4, 0);
        } else {
          primary.rotation.set(elapsed * 0.06 + pointer.y * 0.18, elapsed * 0.09 + pointer.x * 0.22, 0);
          shell?.rotation.set(-elapsed * 0.04 - pointer.y * 0.1, -elapsed * 0.05 - pointer.x * 0.14, 0.4);
          dust.rotation.y = elapsed * 0.02 + pointer.x * 0.08;
        }
      };
    });
  }, [variant]);

  return <div className={variant === 'knot' ? 'knot-field' : 'hero-field'} ref={host} aria-hidden="true" />;
}

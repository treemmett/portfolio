import { FC, useCallback, useEffect, useRef } from 'react';
import styles from './Quantum.module.scss';
import { useWindowDimensions } from '@utils/useWindowDimensions';

class Point {
  public x: number;

  public xOrigin: number;

  public y: number;

  public yOrigin: number;

  public closest: Point[] = [];

  public color: string;

  public radius: number;

  constructor(
    width: number,
    height: number,
    x: number,
    y: number,
    private ctx: CanvasRenderingContext2D
  ) {
    this.x = x + (Math.random() * width) / 20;
    this.y = y + (Math.random() * height) / 20;
    this.xOrigin = x;
    this.yOrigin = y;
    this.radius = 2 + Math.random() * 2;
    this.color = 'rgba(255, 255, 255, 0.3)';
    this.draw();
  }

  public setClosest(points: Point[]): this {
    this.closest = points;
    return this;
  }

  public draw() {
    this.closest.forEach((closePoint) => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(closePoint.x, closePoint.y);
      this.ctx.strokeStyle = `rgb(156, 217, 249)`;
      this.ctx.stroke();
    });

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = `rgb(156, 217, 249)`;
    this.ctx.fill();
  }
}

function getDistance(p1: Point, p2: Point): number {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

export const Quantum: FC = () => {
  const ref = useRef<HTMLCanvasElement>();
  const points = useRef<Point[]>([]);
  const ctx = useRef<CanvasRenderingContext2D>();
  const [width, height] = useWindowDimensions();

  const animateFrame = useCallback(() => {
    if (!ctx.current) return;

    ctx.current.clearRect(0, 0, width, height);
    points.current.forEach((p) => p.draw());
    requestAnimationFrame(animateFrame);
  }, [width, height]);

  useEffect(() => {
    if (!ref.current) return;

    ctx.current = ref.current.getContext('2d');

    for (let x = 0; x < window.innerWidth; x += window.innerWidth / 20) {
      for (let y = 0; y < window.innerHeight; y += window.innerHeight / 20) {
        points.current.push(new Point(window.innerWidth, window.innerHeight, x, y, ctx.current));
      }
    }

    // find the 5 closest points
    points.current.forEach((point) => {
      const closest = [];
      points.current.forEach((point2) => {
        if (point !== point2) {
          let placed = false;

          for (let i = 0; i < 5; i += 1) {
            if (!placed) {
              if (closest[i] === undefined) {
                closest[i] = point2;
                placed = true;
                break;
              }
            }
          }

          if (placed) return;

          for (let i = 0; i < 5; i += 1) {
            if (getDistance(point, point2) < getDistance(point, closest[i])) {
              closest[i] = point2;
              break;
            }
          }
        }
      });
      point.setClosest(closest);
    });
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;

    animateFrame();
  }, [animateFrame, ref]);

  return <canvas className={styles.canvas} height={height} ref={ref} width={width} />;
};

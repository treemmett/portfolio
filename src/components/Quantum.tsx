/* eslint-disable max-classes-per-file */
import { FC, useEffect, useRef } from 'react';
import styles from './Quantum.module.scss';
import { isBrowser } from '@utils/isBrowser';

function getDistance(p1: Point, p2: Point): number {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

function pixelRatio(): number {
  if (!isBrowser()) return 1;

  return window.devicePixelRatio || 1;
}

class Point {
  public x: number;

  public xOrigin: number;

  public y: number;

  public yOrigin: number;

  public closest: Point[] = [];

  public color: string;

  public radius: number;

  public targetX: number;

  public targetY: number;

  constructor(width: number, height: number, x: number, y: number, private quantum: Quantum) {
    this.x = x + (Math.random() * width) / 20;
    this.y = y + (Math.random() * height) / 20;
    this.xOrigin = x;
    this.yOrigin = y;
    this.radius = 2 + Math.random() * 2;
    this.color = 'rgba(255, 255, 255, 0.3)';
    this.newTarget();
  }

  public setClosest(points: Point[]): this {
    this.closest = points;
    return this;
  }

  public move() {
    const directionX = this.x < this.targetX ? 1 : -1;
    const directionY = this.y < this.targetY ? 1 : -1;

    this.x += Point.step * directionX;
    this.y += Point.step * directionY;

    if (
      (directionX === 1 && this.x > this.targetX) ||
      (directionX === -1 && this.x < this.targetX)
    ) {
      this.x = this.targetX;
    }

    if (
      (directionY === 1 && this.y > this.targetY) ||
      (directionY === -1 && this.y < this.targetY)
    ) {
      this.y = this.targetY;
    }

    if (this.y === this.targetY && this.x === this.targetX) {
      this.newTarget();
    }
  }

  public draw() {
    this.closest.forEach((closePoint) => {
      this.quantum.ctx.beginPath();
      this.quantum.ctx.moveTo(this.x, this.y);
      this.quantum.ctx.lineTo(closePoint.x, closePoint.y);
      this.quantum.ctx.strokeStyle = `rgb(156, 217, 249)`;
      this.quantum.ctx.stroke();
    });

    this.quantum.ctx.beginPath();
    this.quantum.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.quantum.ctx.fillStyle = `rgb(156, 217, 249)`;
    this.quantum.ctx.fill();
    this.move();
  }

  public newTarget() {
    this.targetX = this.xOrigin - 50 + Math.random() * 100;
    this.targetY = this.yOrigin - 50 + Math.random() * 100;
  }

  public static step = 1;
}

class Quantum {
  public points: Point[] = [];

  public canvas: HTMLCanvasElement;

  public ctx: CanvasRenderingContext2D;

  public frameID = 0;

  constructor() {
    const w = isBrowser() ? window.innerWidth * pixelRatio() : 0;
    const h = isBrowser() ? window.innerHeight * pixelRatio() : 0;

    for (let x = 0; x < w + w / 20; x += w / 20) {
      for (let y = 0; y < h + h / 20; y += h / 20) {
        this.points.push(new Point(w, h, x, y, this));
      }
    }

    // find the 5 closest points
    this.points.forEach((point) => {
      const closest = [];
      this.points.forEach((point2) => {
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
  }

  public initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.setAttribute('width', (window.innerWidth * pixelRatio()).toString());
    canvas.setAttribute('height', (window.innerHeight * pixelRatio()).toString());
    this.frame();

    return () => {
      cancelAnimationFrame(this.frameID);
    };
  }

  private frame() {
    this.ctx.clearRect(0, 0, window.innerWidth * pixelRatio(), window.innerHeight * pixelRatio());
    this.points.forEach((p) => p.draw());
    this.frameID = requestAnimationFrame(() => this.frame());
  }
}

export const QuantumCanvas: FC = () => {
  const ref = useRef<HTMLCanvasElement>();
  const quantum = useRef(new Quantum());

  useEffect(() => quantum.current.initialize(ref.current), [ref]);

  return <canvas className={styles.canvas} ref={ref} />;
};

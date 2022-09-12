/* eslint-disable max-classes-per-file */
import { FC, useEffect, useRef } from 'react';
import styles from './Quantum.module.scss';
import { isBrowser } from '@utils/isBrowser';

function getDistance(p1: Pick<Point, 'x' | 'y'>, p2: Pick<Point, 'x' | 'y'>): number {
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

  public radius: number;

  public targetX: number;

  public targetY: number;

  constructor(width: number, height: number, x: number, y: number, private quantum: Quantum) {
    this.x = x + (Math.random() * width) / 20;
    this.y = y + (Math.random() * height) / 20;
    this.xOrigin = x;
    this.yOrigin = y;
    this.radius = 2 + Math.random() * 2 * pixelRatio();
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

  public draw(x: number, y: number) {
    let line = 0.01;
    let circle = 0.1;

    const distance = Math.abs(getDistance({ x, y }, this));

    if (distance < 1000) {
      line = 0.6;
      circle = 1;
    } else if (distance < 4000) {
      line = 0.3;
      circle = 0.6;
    } else if (distance < 20000) {
      line = 0.1;
      circle = 0.3;
    } else if (distance < 40000) {
      line = 0.02;
      circle = 0.1;
    }

    this.closest.forEach((closePoint) => {
      this.quantum.ctx.beginPath();
      this.quantum.ctx.moveTo(this.x, this.y);
      this.quantum.ctx.lineTo(closePoint.x, closePoint.y);
      this.quantum.ctx.strokeStyle = `rgba(156, 217, 249, ${line})`;
      this.quantum.ctx.stroke();
    });

    this.quantum.ctx.beginPath();
    this.quantum.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.quantum.ctx.fillStyle = `rgba(156, 217, 249, ${circle})`;
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

  public mouseX: number;

  public mouseY: number;

  constructor() {
    const w = isBrowser() ? window.innerWidth * pixelRatio() : 0;
    const h = isBrowser() ? window.innerHeight * pixelRatio() : 0;
    this.mouseX = w / 2;
    this.mouseY = h / 2;

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
    window.addEventListener('mousemove', this.mouseListener);
    this.frame();

    return () => {
      cancelAnimationFrame(this.frameID);
      window.removeEventListener('mousemove', this.mouseListener);
    };
  }

  private frame() {
    this.ctx.clearRect(0, 0, window.innerWidth * pixelRatio(), window.innerHeight * pixelRatio());
    this.points.forEach((p) => p.draw(this.mouseX, this.mouseY));
    this.frameID = requestAnimationFrame(() => this.frame());
  }

  private mouseListener = (e: MouseEvent) => {
    this.mouseX = e.clientX * pixelRatio();
    this.mouseY = e.clientY * pixelRatio();
  };
}

export const QuantumCanvas: FC = () => {
  const ref = useRef<HTMLCanvasElement>();
  const quantum = useRef(new Quantum());

  useEffect(() => quantum.current.initialize(ref.current), [ref]);

  return <canvas className={styles.canvas} ref={ref} />;
};

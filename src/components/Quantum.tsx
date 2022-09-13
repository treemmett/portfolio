/* eslint-disable max-classes-per-file */
import { FC, useEffect, useRef } from 'react';
import styles from './Quantum.module.scss';
import { isBrowser } from '@utils/isBrowser';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';

function getDistance(p1: Pick<Point, 'x' | 'y'>, p2: Pick<Point, 'x' | 'y'>): number {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

function getQuinticEase(
  currentProgress: number,
  start: number,
  distance: number,
  steps: number
): number {
  let newProgress = currentProgress;
  newProgress /= steps / 2;
  if (newProgress < 1) {
    return (distance / 2) * newProgress ** 5 + start;
  }
  newProgress -= 2;
  return (distance / 2) * (newProgress ** 5 + 2) + start;
}

function pixelRatio(): number {
  if (!isBrowser()) return 1;

  return window.devicePixelRatio || 1;
}

class Point {
  public x: number;

  public y: number;

  public originX: number;

  public originY: number;

  public targetX: number;

  public targetY: number;

  public closest: Point[] = [];

  public radius: number;

  public step = 0;

  public steps: number;

  constructor(width: number, height: number, x: number, y: number, private quantum: Quantum) {
    this.x = x + (Math.random() * width) / 20;
    this.y = y + (Math.random() * height) / 20;
    this.originX = x;
    this.originY = y;
    this.radius = 2 + Math.random() * 2 * pixelRatio();
    this.newTarget();

    // start with random velocity
    this.step = Math.floor(this.steps * Math.random());
  }

  public setClosest(points: Point[]): this {
    this.closest = points;
    return this;
  }

  public move() {
    this.x = getQuinticEase(this.step, this.x, this.targetX - this.x, this.steps);
    this.y = getQuinticEase(this.step, this.y, this.targetY - this.y, this.steps);

    this.step += 1;

    if (this.y === this.targetY && this.x === this.targetX) {
      this.newTarget();
    }
  }

  public draw(x: number, y: number, darkMode: boolean) {
    let line = 0;
    let circle = 0;

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
    } else if (distance < 60000) {
      line = 0.02;
      circle = 0.1;
    }

    const color = (opacity: number) =>
      darkMode ? `rgba(156, 217, 249, ${opacity})` : `rgba(171, 42, 97, ${opacity})`;

    this.closest.forEach((closePoint) => {
      this.quantum.ctx.beginPath();
      this.quantum.ctx.moveTo(this.x, this.y);
      this.quantum.ctx.lineTo(closePoint.x, closePoint.y);
      this.quantum.ctx.strokeStyle = color(line);
      this.quantum.ctx.stroke();
    });

    this.quantum.ctx.beginPath();
    this.quantum.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.quantum.ctx.fillStyle = color(circle);
    this.quantum.ctx.fill();
    this.move();
  }

  public newTarget() {
    this.step = 0;
    this.steps = 100 + Math.random() * 100;
    this.targetX = this.originX - 50 + Math.random() * 100;
    this.targetY = this.originY - 50 + Math.random() * 100;
  }
}

class Quantum {
  public points: Point[] = [];

  public canvas: HTMLCanvasElement;

  public ctx: CanvasRenderingContext2D;

  public frameID = 0;

  public mouseX: number;

  public mouseY: number;

  public darkMode: boolean;

  constructor() {
    const w = isBrowser() ? window.innerWidth * pixelRatio() : 0;
    const h = isBrowser() ? window.innerHeight * pixelRatio() : 0;
    this.mouseX = w / 2;
    this.mouseY = h / 2;

    for (let x = 0; x < w + w / 30; x += w / 30) {
      for (let y = 0; y < h + h / 30; y += h / 30) {
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
    this.darkMode = isDarkMode();
    const unsubscribe = listenForDarkModeChange((d) => {
      this.darkMode = d;
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(this.frameID);
      window.removeEventListener('mousemove', this.mouseListener);
    };
  }

  private frame() {
    this.ctx.clearRect(0, 0, window.innerWidth * pixelRatio(), window.innerHeight * pixelRatio());
    this.points.forEach((p) => p.draw(this.mouseX, this.mouseY, this.darkMode));
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

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

function ease(currentProgress: number, start: number, distance: number, steps: number) {
  let progress = currentProgress;
  progress /= steps / 2;
  if (progress < 1) {
    return (distance / 2) * progress ** 3 + start;
  }
  progress -= 2;
  return (distance / 2) * (progress ** 3 + 2) + start;
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

  public opacityBase: number;

  constructor(width: number, height: number, x: number, y: number, private quantum: Quantum) {
    this.x = x + (Math.random() * width) / 20;
    this.y = y + (Math.random() * height) / 20;
    this.originX = x;
    this.originY = y;
    this.radius = 2 + Math.random() * 2 * pixelRatio();
    this.opacityBase = 50000 + 75000 * Math.random();
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

  public draw(targets: Pick<Point, 'x' | 'y'>[], darkMode: boolean) {
    const distance = Math.min(...targets.map((target) => Math.abs(getDistance(target, this))));

    const opacity = (this.opacityBase - distance) / 100000;

    const color = (o: number) =>
      darkMode ? `rgba(156, 217, 249, ${o})` : `rgba(171, 42, 97, ${o})`;

    this.closest.forEach((closePoint) => {
      this.quantum.ctx.beginPath();
      this.quantum.ctx.moveTo(this.x, this.y);
      this.quantum.ctx.lineTo(closePoint.x, closePoint.y);
      this.quantum.ctx.strokeStyle = color(opacity / 2);
      this.quantum.ctx.stroke();
    });

    this.quantum.ctx.beginPath();
    this.quantum.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.quantum.ctx.fillStyle = color(opacity);
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

class Spotlight {
  public step = 0;

  public steps: number;

  public targetX: number;

  public targetY: number;

  public originX: number;

  public originY: number;

  public x: number;

  public y: number;

  constructor() {
    this.x = window.innerWidth * pixelRatio();
    this.y = window.innerHeight * pixelRatio();
    this.newTarget();
  }

  public frame() {
    this.x = ease(this.step, this.originX, this.targetX - this.originX, this.steps);
    this.y = ease(this.step, this.originY, this.targetY - this.originY, this.steps);
    this.step += 1;

    if (this.step >= this.steps) {
      this.newTarget();
    }
  }

  private newTarget() {
    this.step = 0;
    this.steps = 200;
    this.targetX = window.innerWidth * pixelRatio() * Math.random();
    this.targetY = window.innerHeight * pixelRatio() * Math.random();
    this.originX = this.x;
    this.originY = this.y;
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

  public spotlight: Spotlight;

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
    this.spotlight = new Spotlight();
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
    this.spotlight.frame();
    this.points.forEach((p) =>
      p.draw([{ x: this.mouseX, y: this.mouseY }, this.spotlight], this.darkMode)
    );

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

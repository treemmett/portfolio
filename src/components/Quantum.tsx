/* eslint-disable max-classes-per-file */
import { FC, useEffect, useRef } from 'react';
import styles from './Quantum.module.scss';
import { isBrowser } from '@utils/isBrowser';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';

function getDistance(p1: Pick<Particle, 'x' | 'y'>, p2: Pick<Particle, 'x' | 'y'>): number {
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

class Particle {
  public x: number;

  public y: number;

  public originX: number;

  public originY: number;

  public targetX: number;

  public targetY: number;

  public closest: Particle[] = [];

  public radius: number;

  public step = 0;

  public steps: number;

  public opacityBase: number;

  public static darkMode = isDarkMode();

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

  public setClosest(particles: Particle[]): this {
    this.closest = particles;
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

  public draw() {
    const distance = Math.min(
      ...[this.quantum, this.quantum.spotlight].map((target) => Math.abs(getDistance(target, this)))
    );

    const opacity = (this.opacityBase - distance) / 100000;

    const color = (o: number) =>
      Particle.darkMode ? `rgba(156, 217, 249, ${o})` : `rgba(171, 42, 97, ${o})`;

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

class Potential {
  public y: number;

  private target: number;

  private origin: number;

  private step: number;

  private steps: number;

  constructor(private baseY: number, public x: number) {
    this.steps = Math.floor(Math.random() * 75 + 75);
    this.y = this.randomY();
    this.newTarget();
    this.step = Math.floor(this.steps * Math.random());
  }

  private randomY() {
    return this.baseY + Math.random() * this.steps - 50 * pixelRatio();
  }

  public newTarget() {
    this.step = 0;
    this.origin = this.y;
    this.target = this.randomY();
    this.steps = Math.floor(Math.random() * 75 + 75);
  }

  public frame() {
    this.y = ease(this.step, this.origin, this.target - this.origin, this.steps);
    this.step += 1;

    if (this.step >= 100) {
      this.newTarget();
    }
  }
}

class Field {
  private potentials: Potential[] = [];

  constructor(public baseY: number, private quantum: Quantum) {
    const w = window.innerWidth * pixelRatio();

    for (let x = 0; x < w + w / 30; x += w / 30) {
      this.potentials.push(new Potential(this.baseY, x));
    }
  }

  public draw() {
    this.quantum.ctx.beginPath();
    this.quantum.ctx.moveTo(0, this.potentials[0].y);
    this.potentials.forEach((potential) => {
      this.quantum.ctx.lineTo(potential.x, potential.y);
      potential.frame();
    });
    this.quantum.ctx.strokeStyle = 'rgb(244, 159, 10)';
    this.quantum.ctx.stroke();
  }
}

class Quantum {
  public particles: Particle[] = [];

  public fields: Field[] = [];

  public canvas: HTMLCanvasElement;

  public ctx: CanvasRenderingContext2D;

  public frameID = 0;

  public x: number;

  public y: number;

  public spotlight: Spotlight;

  constructor() {
    const w = isBrowser() ? window.innerWidth * pixelRatio() : 0;
    const h = isBrowser() ? window.innerHeight * pixelRatio() : 0;
    this.x = w / 2;
    this.y = h / 2;

    for (let x = 0; x < w + w / 30; x += w / 30) {
      for (let y = 0; y < h + h / 30; y += h / 30) {
        this.particles.push(new Particle(w, h, x, y, this));
      }
    }

    // find the 5 closest particles
    this.particles.forEach((particle) => {
      const closest = [];
      this.particles.forEach((particle2) => {
        if (particle === particle2) return;

        for (let i = 0; i < 5; i += 1) {
          if (closest[i] === undefined) {
            closest[i] = particle2;
            return;
          }
        }

        for (let i = 0; i < 5; i += 1) {
          if (getDistance(particle, particle2) < getDistance(particle, closest[i])) {
            closest[i] = particle2;
            break;
          }
        }
      });
      particle.setClosest(closest);
    });
  }

  public initialize(canvas: HTMLCanvasElement) {
    const h = window.innerHeight * pixelRatio();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.setAttribute('width', (window.innerWidth * pixelRatio()).toString());
    canvas.setAttribute('height', h.toString());
    window.addEventListener('mousemove', this.mouseListener);

    for (let y = h; y > h / 2; y -= 75) {
      this.fields.push(new Field(y, this));
    }

    this.spotlight = new Spotlight();
    this.frame();
    const unsubscribe = listenForDarkModeChange((d) => {
      Particle.darkMode = d;
    });

    return () => {
      this.fields = [];
      unsubscribe();
      cancelAnimationFrame(this.frameID);
      window.removeEventListener('mousemove', this.mouseListener);
    };
  }

  private frame() {
    this.ctx.clearRect(0, 0, window.innerWidth * pixelRatio(), window.innerHeight * pixelRatio());
    this.spotlight.frame();
    this.fields.forEach((p) => p.draw());
    this.particles.forEach((p) => p.draw());

    this.frameID = requestAnimationFrame(() => this.frame());
  }

  private mouseListener = (e: MouseEvent) => {
    this.x = e.clientX * pixelRatio();
    this.y = e.clientY * pixelRatio();
  };
}

export const QuantumCanvas: FC = () => {
  const ref = useRef<HTMLCanvasElement>();
  const quantum = useRef(new Quantum());

  useEffect(() => quantum.current.initialize(ref.current), [ref]);

  return <canvas className={styles.canvas} ref={ref} />;
};

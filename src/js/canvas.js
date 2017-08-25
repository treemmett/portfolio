export function drawCanvas(){
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  const stars = [];
  const starTrail = [];
  const starFlickerMargin = 0.6;

  let mouse = {x: 0, y: 0};

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
  }
  init();

  class Star{
    constructor(){
      this.realX = Math.random() * canvas.width;
      this.realY = Math.random() * canvas.height;
      this.x = this.realX;
      this.y = this.realY;

      this.realRadius = Math.random() + 0.2;
      this.radius = Math.random() * this.realRadius;
      this.grow = Math.random() > 0.5;
      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = 'white';
      c.fill();
    }

    update(){
      if(this.grow){
        if(this.radius < this.realRadius + starFlickerMargin){
          this.radius += 0.01;
        }else{
          this.grow = !this.grow;
        }
      }else{
        if(this.radius > this.realRadius - starFlickerMargin && this.radius > 0.1){
          this.radius -= 0.01;
        }else{
          this.grow = !this.grow;
        }
      }

      this.draw();
    }
  }

  class StarTrail{
    constructor(x, y){
      this.x = x;
      this.y = y;
      this.vX = (Math.random() - 0.5) * 3;
      this.vY = (Math.random() - 0.5) * 3;
      this.radius = Math.random() + 0.5;
      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = 'white';
      c.fill();
    }

    update(){
      this.x += this.vX;
      this.y += this.vY;
      this.radius -= 0.03;

      if(this.radius > 0){
        this.draw();
      }
    }
  }

  for(let i = 0; i < 100; i++){
    stars.push(new Star());
  }

  function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Draw stars
    for(let i in stars){
      stars[i].update();
    }

    //Draw trail
    for(let i in starTrail){
      if(starTrail[i].x < canvas.width && starTrail[i].y < canvas.height && starTrail[i].radius > 0){
        starTrail[i].update();
      }else{
        starTrail.splice(i, 1);
      }
    }

    //Draw sun
    c.beginPath();
    c.arc(0, 0, 100, 0, Math.PI * 2, false);
    c.fillStyle = '#feeb08';
    c.save();
    c.shadowBlur = 5;
    c.shadowOffsetY = 25;
    c.shadowOffsetX = 25;
    c.shadowColor = '#feeb08';
    c.restore();
    c.fill();

  }
  animate();

  window.addEventListener('resize', init);

  canvas.addEventListener('mousemove', (e)=>{
    mouse.x = e.layerX;
    mouse.y = e.layerY;

    starTrail.push(new StarTrail(e.layerX, e.layerY));
  });
}

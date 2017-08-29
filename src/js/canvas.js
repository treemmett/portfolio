export function drawCanvas(){
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  const stars = [];
  const shootingStars = [];
  const flickerStars = [];
  const starFlickerMargin = 0.6;

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
  }
  init();

  class Star{
    constructor(){
      this.x = Math.random() * canvas.width * 2;
      this.y = Math.random() * canvas.height * 2;

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

  class ShootingStar{
    constructor(){
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vX = (Math.random() - 0.5) * 10;
      this.vY = (Math.random() - 0.5) * 10;
      this.alpha = 1;

      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.alpha, 0, Math.PI * 2, false);
      c.fillStyle = 'rgba(255, 255, 255, '+this.alpha+')';
      c.fill();
    }

    update(){
      this.alpha -= 0.02;
      this.x += this.vX;
      this.y += this.vY;

      if(this.alpha > 0){
        this.draw();
      }
    }
  }

  class FlickerStars{
    constructor(){
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.realRadius = Math.random() * 2;
      this.radius = 0.1;
      this.grow = true;
      this.growthRate = (Math.random() * 0.05) + 0.01;
      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = 'rgba(255, 255, 255, '+this.radius+')';
      c.fill();
    }

    update(){
      if(this.grow){
        if(this.radius < this.realRadius){
          this.radius += this.growthRate;
        }else{
          this.grow = false;
        }
      }else{
        if(this.radius > 0){
          this.radius -= this.growthRate;
        }
      }

      if(this.radius > 0){
        this.draw();
      }
    }
  }

  //Initial star renders
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

    //Update shooting stars
    for(let i in shootingStars){
      if(shootingStars[i].alpha > 0){
        shootingStars[i].update();
      }else{
        shootingStars.splice(i, 1);
      }
    }

    //Draw flickering stars
    if(Math.random() < 0.15){
      flickerStars.push(new FlickerStars());
    }

    //Update flickering stars
    for(let i in flickerStars){
      if(flickerStars[i].radius > 0){
        flickerStars[i].update();
      }else{
        flickerStars.splice(i, 1);
      }
    }

    //Create shooting stars
    if(Math.random() < 0.01){
      shootingStars.push(new ShootingStar());
    }

  }
  animate();

  window.addEventListener('resize', init);
}

window.addEventListener('load', function(){
  const canvas = document.getElementById('mesh');
  const c = canvas.getContext('2d');
  let mouse = {x: 0, y: 0};
  let animationFrame = 0;
  let radius;
  let animation;

  class Mesh{
    constructor(){
      this.modifier = 1;
      this.waveLength = 1;
      this.polygons = 75;
      this.step = Math.PI * 2 / this.polygons;
    }

    update(){
      //Set animation speed
      let speed = animationFrame * 0.1;

      //Mouse effect
      if(Math.abs(mouse.x - canvas.width / 2) < radius + 50 && Math.abs(mouse.y - canvas.height / 2) < radius + 50){
        speed = animationFrame * 0.05;
        this.waveLength = 2;

        //Add to this.modifier
        if(this.modifier < 3){
          this.modifier += 1/6;
        }
      }else{
        this.waveLength = 1;
        this.modifier = 1;
      }

      //Calculate mesh vectors
      this.sine = [];
      for(let i = 0; i < this.polygons; i++) {
        this.sine.push(Math.sin(i / this.waveLength + speed) * this.modifier);
      }
      this.draw();
    }

    draw(){
      //Create gradient
      const grad = c.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/2, canvas.width/2, canvas.height, 0);
      grad.addColorStop(0, '#0497FF');
      grad.addColorStop(1, '#00ff99');

      //Draw mesh
      c.beginPath();
      for(let theta = 0;  theta < Math.PI * 2;  theta += this.step) {
        let point = this.sine[(theta/this.step).toFixed(0)];
        let x = canvas.width / 2 + (radius + point) * Math.cos(theta);
        let y = canvas.height / 2 + (radius + point) * Math.sin(theta);
        c.lineTo(x,y);
      }
      c.closePath();
      c.fillStyle = grad;
      c.fill();
    }
  }

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
    radius = Math.min(canvas.width / 4.5, canvas.height / 4.5);
  }
  init();

  const mesh = new Mesh();

  function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);

    mesh.update();

    animationFrame++;
    animation = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', init);
  canvas.addEventListener('mousemove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
});

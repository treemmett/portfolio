export function drawCanvas(){
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  let waves = [];
  let animation;

  //Mesh variables
  let radius;
  let animationFrame = 0;
  let modifier = 1;
  let waveLength = 1;
  const polygons = 75;
  const step = Math.PI * 2 / polygons;

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
    radius = Math.min(canvas.width / 4.5, canvas.height / 4.5);
  }
  init();

  class Wave{
    constructor(){
      this.points = [];
      this.noPoints = Math.random() < 0.6 ? 3 : 2;
      this.finished = false;

      //Setup initial points
      this.points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vX: (Math.random() - 0.5) / 4,
        vY: (Math.random() - 0.5) / 4,
        alpha: 0
      });
    }

    draw(){
      //Draw circle
      for(let i in this.points){
        c.beginPath();
        c.arc(this.points[i].x, this.points[i].y, 3, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,'+this.points[i].alpha*2+')';
        c.fill();
      }

      //Draw line
      c.beginPath();
      for(let i in this.points){
        c.lineTo(this.points[i].x, this.points[i].y);
        c.strokeStyle = 'rgba(255, 255, 255, '+this.points[i].alpha+')';
        c.stroke();
      }
    }

    update(){
      const point = this.points[this.points.length - 1];

      //Move point
      for(let i in this.points){
        this.points[i].x += this.points[i].vX;
        this.points[i].y += this.points[i].vY;
      }

      //Remove alpha
      if(this.finished){
        for(let i in this.points){
          this.points[i].alpha -= 0.015;
        }
        return this.draw();
      }

      //Set finished state
      if(this.points.length >= this.noPoints && point.alpha >= 1){
        this.finished = true;
      }

      //Add alpha
      if(point.alpha < 1){
        point.alpha += 0.01;
      }else

      //Add new point
      if(this.points.length < this.noPoints){
        this.addPoint();
      }

      this.draw();
    }

    addPoint(){
      const oldX = this.points[this.points.length - 1].x;
      const oldY = this.points[this.points.length - 1].y;
      const radius = Math.random() * 100 + 20;
      const angle = Math.random() * 360;

      this.points.push({
        x: oldX + radius * Math.cos(angle),
        y: oldY + radius * Math.sin(angle),
        vX: (Math.random() - 0.5) / 4,
        vY: (Math.random() - 0.5) / 4,
        alpha: 0
      });
    }
  }

  //Add first wave
  waves.push(new Wave());

  function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Update waves
    for(let i in waves){
      waves[i].update();
    }

    //Delete old waves
    for(let i in waves){
      if(waves[i].finished && waves[i].points[0].alpha < 0){
        waves.splice(i, 1);
      }
    }

    //Roll dice to add new wave
    if(Math.random() < 0.02){
      waves.push(new Wave());
    }

    //Calculate mesh vectors
    let sine = [];
    let rotation = animationFrame*0.1;
    for(let i = 0; i < polygons; i++) {
      sine.push(Math.sin(i / waveLength + rotation) * modifier);
    }

    //Create gradient
    const grad = c.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/2, canvas.width/2, canvas.height, 0);
    grad.addColorStop(0, '#0497FF');
    grad.addColorStop(1, '#00ff99');

    //Draw mesh
    c.beginPath();
    for(let theta = 0;  theta < Math.PI * 2;  theta += step) {
      let point = sine[(theta/step).toFixed(0)];
      let x = canvas.width / 2 + (radius + point) * Math.cos(theta);
      let y = canvas.height / 2 + (radius + point) * Math.sin(theta);
      c.lineTo(x,y);
    }
    c.closePath();
    c.fillStyle = grad;
  	c.fill();

    animationFrame++;
    animation = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', init);
}

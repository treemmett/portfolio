export function drawCanvas(){
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  let waves = [];

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
  }
  init();

  class Wave{
    constructor(){
      this.points = [];
      this.noPoints = Math.random() * 2 + 2;
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
      //Move point
      for(let i in this.points){
        this.points[i].x += this.points[i].vX;
        this.points[i].y += this.points[i].vY;
      }

      if(this.finished){
        //Decrease alpha for all point
        for(let i in this.points){
          this.points[i].alpha -= 0.01;
        }

        //Delete wave if alpha is 0
        if(this.points[0].alpha <= 0){
          this.delete();
        }

      }else if(this.points[this.points.length - 1].alpha < 1){
        //Increase alpha for current point
        this.points[this.points.length - 1].alpha += 0.01;

      }else if(this.points.length < this.noPoints){
        //Add new point
        this.addPoint();

      }else{
        //All points added, start fade out
        this.finished = true;
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

    delete(){
      const index = waves.indexOf(this);
      waves.splice(index, 1);
    }
  }

  let count = 0;

  //Add first wave
  waves.push(new Wave());

  function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    for(let i in waves){
      waves[i].update();
    }

    //Roll dice to add new wave
    if(Math.random() < 0.02){
      waves.push(new Wave());
    }

    //Paint circle
    const poly = 70;
    const step = 2 * Math.PI / poly;
    const length = 2 * Math.PI;
    const radius = Math.min(canvas.height / 4.6, canvas.width / 4.6);

    let sine = [];
    let wavelength = 1.2;
    let rotation = count * 0.1;
    let ungulator = 1;

    for(let i = 0; i < poly; i++){
      sine.push(Math.sin(i/wavelength + rotation) * ungulator);
    }

    c.beginPath();
    for(let theta = 0; theta < length; theta += step){
      let point = sine[(theta / step).toFixed(0)];
      let x = canvas.width / 2 + (radius + point) * Math.cos(theta);
      let y = canvas.height / 2 + (radius + point) * Math.sin(theta);
      c.lineTo(x, y);
    }
    c.closePath();

    const grad = c.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/2, canvas.width/2, canvas.height, 0);
    grad.addColorStop(0, '#0497FF');
    grad.addColorStop(1, '#00ff99');
    c.fillStyle = grad;
    c.fill();
    count++;
  }
  animate();

  window.addEventListener('resize', init);
}

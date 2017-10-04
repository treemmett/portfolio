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
      if(this.finished){
        //Decrease alpha for all point
        for(let i in this.points){
          this.points[i].alpha -= 0.01;
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
        alpha: 0
      });
    }
  }

  //Add first wave
  waves.push(new Wave());

  function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    for(let i in waves){
      waves[i].update();
    }

    //Roll dice to add new wave
    if(Math.random() < 0.01){
      waves.push(new Wave());
    }
  }
  animate();

  window.addEventListener('resize', init);
}

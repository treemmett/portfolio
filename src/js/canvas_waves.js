window.addEventListener('load', function(){
  const canvas = document.getElementById('background');
  const c = canvas.getContext('2d');
  c.scale(0.5, 0.5);
  let waves = [];
  let animation;

  function init(){
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = (
      c.webkitBackingStorePixelRatio ||
      c.mozBackingStorePixelRatio ||
      c.msBackingStorePixelRatio ||
      c.oBackingStorePixelRatio ||
      c.backingStorePixelRatio || 1
    );

    //Determine scaling ratio
    const ratio = devicePixelRatio / backingStoreRatio;

    //Get device dimensions
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;

    if(devicePixelRatio !== backingStoreRatio){
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }else{
      //Normal 1:1 scale
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '';
      canvas.style.height = '';
    }
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

    animation = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', init);
});

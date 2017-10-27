window.addEventListener('load', function(){
  const canvas = document.getElementById('mesh');
  const c = canvas.getContext('2d');
  let meshes = [];
  let animationFrame = 0;
  let radius = 0;

  class Mesh{
    constructor(i){
      this.modifier = i;
      this.waveLength = i;
      this.polygons = 75;
      this.step = Math.PI * 2 / this.polygons;
    }

    update(){
      //Set animation speed
      let speed = animationFrame * 0.02;

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
      c.strokeStyle = grad;
      c.stroke();
    }
  }

  function init(){
    canvas.height = document.body.clientHeight;
    canvas.width = document.body.clientWidth;
    radius = Math.min(canvas.width / 4.5, canvas.height / 4.5);
  }
  init();

  //Setup meshes
  for(let i = 0; i < 4; i++){
    meshes.push(new Mesh(i+1));
  }

  function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Update meshes
    meshes.forEach(mesh=>mesh.update());

    animationFrame++;
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', init);
});

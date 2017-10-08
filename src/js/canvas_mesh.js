window.addEventListener('load', function(){
  const canvas = document.getElementById('mesh');
  const c = canvas.getContext('2d');
  let mouse = {x: 0, y: 0};
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

  function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Set animation speed
    let speed = animationFrame * 0.1;

    //Mouse effect
    if(Math.abs(mouse.x - canvas.width / 2) < radius + 50 && Math.abs(mouse.y - canvas.height / 2) < radius + 50){
      speed = animationFrame * 0.05;
      waveLength = 2;

      //Add to modifier
      if(modifier < 3){
        modifier += 1/6;
      }
    }else{
      waveLength = 1;
      modifier = 1;
    }

    //Calculate mesh vectors
    let sine = [];
    for(let i = 0; i < polygons; i++) {
      sine.push(Math.sin(i / waveLength + speed) * modifier);
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
  canvas.addEventListener('mousemove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
});

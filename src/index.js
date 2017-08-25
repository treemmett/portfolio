import './index.scss';

function drawCanvas(){
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

const contactF = new class{

  checkInput(){
    let success = true;

    for(let i = 0; i < document.forms.contact.elements.length; i++){
      const input = document.forms.contact.elements[i];

      switch(input.name){
        case 'contact_e': {
          if(!input.value.match(/\S+\@\S+\.\S{2,}/)){
            success = false;
          }
          input.value = input.value.trim();
          break;
        }

        case 'contact_p': {
          const val = input.value.replace(/\D/g, '');

          let a = val.slice(0,3);
          let b = val.slice(3,6);
          let c = val.slice(6,10);

          if(b){
            a+='-';
          }

          if(c){
            b+='-';
          }

          input.value = a+b+c;

          if(val.length !== 10){
            success = false;
          }
          break;
        }

        default: {
          if(input.value.trim() === ''){
            success = false;
          }
          break;
        }
      }
    }

    if(success){
      document.querySelector('.contact .btn').classList.remove('disabled');
    }else{
      document.querySelector('.contact .btn').classList.add('disabled');
    }

    return success;
  }

  submit(){
    if(!contactF.checkInput()){
      return;
    }

    let data = {};
    let inputs = document.forms.contact.elements;

    for(let i = 0; i < inputs.length; i++){
      data[inputs[i].name] = inputs[i].value.trim();
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/contact/', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onload = function(){
      contactF.message(xhr.response ? 'Message was successfully sent' : 'An error occurred. Please try again later.');
    }
    xhr.onerror = function(){
      contactF.message('An error occurred. Please try again later.');
    }
    xhr.send(JSON.stringify(data));
  }

  message(msg){
    const wrap = document.querySelector('.form_wrap');
    const cont = document.createElement('div');
    cont.style.height = wrap.clientHeight+'px';
    cont.style.boxSizing = 'border-box';
    cont.style.paddingTop = '1em';
    cont.style.fontSize = '2em';
    cont.innerHTML = msg;
    wrap.parentElement.append(cont);
    wrap.remove();
  }
}

window.addEventListener('load', ()=>{
  //Draw canvas
  drawCanvas();

  //Add contact events
  document.querySelector('.contact .btn').addEventListener('click', contactF.submit);
  for(let i = 0; i < document.forms.contact.elements.length; i++){
    document.forms.contact.elements[i].addEventListener('input', contactF.checkInput);
  }

  //Load reCAPTCHA
  if(grecaptcha){
    grecaptcha.render(document.getElementById('grecaptcha'), {
      sitekey: '6Le7mywUAAAAABwwS54ZzT4Xb129TTH1pvT7OnPl',
      callback: contactF.checkInput,
      'expired-callback': contactF.checkInput
    });
  }
});

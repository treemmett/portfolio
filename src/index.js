import './index.scss';

const drawCanvasOld = () => {
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  const colors = ['#2F2933', '#01A2A6', '#29D9C2', '#BDF271', '#FFFFA6'];
  let height;
  let width;
  let allCircles = [];

  let mouse = {
    x: undefined,
    y: undefined
  };

  class Circle{
    constructor(radius = 30, color = 'black'){
      this.x = Math.random() * (width - radius * 2) + radius;
      this.y = Math.random() * (height - radius * 2) + radius;
      this.dx = (Math.random() - 0.5) * 2;
      this.dy = (Math.random() - 0.5) * 2;
      this.bg = color;
      this.realRadius = radius;
      this.radius = radius;
      this.range = 50;
      this.color = c.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color;
      c.fill();
    }

    update(){
      if(this.x + this.radius > width || this.x - this.radius < 0){
        this.dx = -this.dx;
      }

      if(this.y + this.radius > height || this.y - this.radius < 0){
        this.dy = -this.dy;
      }

      if(this.x + this.range > mouse.x && this.x - this.range < mouse.x && this.y + this.range > mouse.y && this.y - this.range < mouse.y){
        if(this.radius < this.realRadius + 20){
          this.radius += 1;
        }
      }else{
        if(this.radius > this.realRadius){
          this.radius -= 1;
        }
      }

      this.x += this.dx;
      this.y += this.dy;
      this.draw();
    }
  }

  function init(){
    allCircles = [];
    height = document.documentElement.clientHeight;
    width = document.documentElement.clientWidth;
    canvas.height = height;
    canvas.width = width;

    for(let i = 0; i < 1000; i++){
      allCircles.push(new Circle(Math.random() * 10 + 1));
    }
  }
  init();

  function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, width, height);
    for(let cir in allCircles){
      allCircles[cir].update();
    }
  }
  animate();

  canvas.addEventListener('mousemove', (e)=>{
    mouse.x = e.layerX;
    mouse.y = e.layerY;
  });

  canvas.addEventListener('mouseout', ()=>{
    mouse = {x: undefined, y: undefined}
  });

  window.addEventListener('resize', init)
}

const drawCanvas = () => {
  const canvas = document.querySelector('canvas'),
        c = canvas.getContext('2d');

  let points = [],
      margin = 50,
      colors = ['#01A2A6', '#29D9C2', '#BDF271', '#FFFFA6'],
      circles = [],
      mouse = {x: undefined, y: undefined};

  function init(){
    canvas.height = document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth;
    c.fillStyle = '#263248';
    c.fillRect(0, 0, canvas.width, canvas.height);
    points = [];
  }
  init();

  class Circle{
    constructor(x, y){
      this.radius = (Math.random() * 30) + 5;
      this.x = x;
      this.y = y;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.vX = (Math.random() - 0.5) * 5;
      this.vY = (Math.random() - 0.5) * 5;
      this.draw();
    }

    draw(){
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.strokeStyle = this.color;
      c.stroke();
    }

    update(){
      this.x += this.vX;
      this.y += this.vY;
      this.radius -= 0.8;
      if(this.radius > 0){
        this.draw();
      }
    }
  }

  function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#263248';
    c.fillRect(0, 0, canvas.width, canvas.height);
    for(let c in circles){
      if(circles[c].radius < 0){
        circles.splice(c, 1);
      }else{
        circles[c].update();
      }
    }
  }
  animate();

  canvas.addEventListener('mousemove', (e)=>{
    for(let i = 0; i < 2; i++){
      circles.push(new Circle(e.layerX, e.layerY));
    }
  });
}

const scrollEffect = () => {
  const scroll = document.body.scrollTop || document.documentElement.scrollTop;
  const banner = document.getElementsByClassName('banner')[0];
  const nav = document.getElementsByClassName('nav')[0];

  if(banner){
    banner.style.backgroundPositionY = -scroll * .07 +'px';

    if(banner.getBoundingClientRect().bottom < nav.clientHeight){
      nav.classList.remove('transparent');
    }else{
      nav.classList.add('transparent');
    }
  }
}

const navScroll = (i) => {
  const start = window.pageYOffset;
  const stop = document.getElementsByTagName('section')[0].offsetTop - document.getElementsByClassName('nav')[0].clientHeight;
  const distance = Math.max(start, stop) - Math.min(start, stop);

  if(i > start)
    return;

  if(start < stop){
    window.scrollBy(0, 10);
    window.setTimeout(function(){navScroll(start)}, 600 / distance);
  }
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
  //Add banner effects
  scrollEffect();
  document.getElementsByClassName('anchor')[0].classList.add('act');
  document.getElementsByClassName('anchor')[0].addEventListener('click', navScroll);
  window.addEventListener('scroll', scrollEffect);

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

window.addEventListener('DOMContentLoaded', ()=>{
  //Draw canvas
  drawCanvas();
});

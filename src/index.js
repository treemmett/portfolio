import './index.scss';
if(process.env.NODE_ENV !== 'production')
  require('file-loader!./index.html');

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

const checkContact = (e) => {
  const inputs = document.forms['contact'].elements;
  let isFilled = false;

  if(typeof e === 'object' && e.target.name === 'contact_p'){
    const value = e.target.value.replace(/\D/g, '');

    let a = value.slice(0,3);
    let b = value.slice(3,6);
    let c = value.slice(6,10);

    if(b){
      a+='-';
    }
    if(c){
      b+='-';
    }

    e.target.value = a+b+c;
  }

  for(let i = 0; i < inputs.length; i++){
    if(inputs[i].value.trim() !== ''){
      isFilled = true;
    }else{
      isFilled = false;
      break;
    }
  }

  isFilled ? document.querySelector('.contact .btn').classList.remove('disabled') : document.querySelector('.contact .btn').classList.add('disabled');
}

const submitContact = () => {
  const inputs = document.forms['contact'].elements;
  let form = {};

  for(let i = 0; i < inputs.length; i++){
    if(inputs[i].value.trim() === ''){
      return;
    }else{
      form[inputs[i].name] = inputs[i].value.trim();
    }
  }

  const x = new XMLHttpRequest();
  x.open('POST', '/api/contact/', true);
  x.onload = ()=>{
    let response;
    const messageElement = document.querySelector('.contact .message');

    try{
      response = JSON.parse(x.response);
    }catch(e){
      messageElement.classList.remove('true');
      messageElement.classList.add('false');
      messageElement.innerHTML = 'Failed to read response';
      console.error(e);
      return;
    }

    messageElement.classList.remove(!response.success);
    messageElement.classList.add(response.success);
    messageElement.innerHTML = response.message;
  }
  x.send(JSON.stringify(form));
}

window.addEventListener('load', ()=>{
  
  //Add banner effects
  scrollEffect();
  document.getElementsByClassName('anchor')[0].classList.add('act');
  document.getElementsByClassName('anchor')[0].addEventListener('click', navScroll);
  window.addEventListener('scroll', scrollEffect);

  //Add events for contact form
  const inputs = document.forms['contact'].elements;
  for(let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener('input', checkContact);
  }
  document.querySelector('.contact .btn').addEventListener('click', submitContact);

  //Load reCAPTCHA
  if(grecaptcha){
    grecaptcha.render(document.getElementById('grecaptcha'), {
      sitekey: '6Le7mywUAAAAABwwS54ZzT4Xb129TTH1pvT7OnPl',
      callback: checkContact,
      'expired-callback': checkContact
    });
  }
});

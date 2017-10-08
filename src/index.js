import './js/canvas_waves';
import './js/canvas_mesh';
import ContactForm from './js/contactForm';

import './index.scss';

const contactF = new ContactForm(document.forms.contact);

function resizeCaptcha(){
  const recap = document.getElementById('grecaptcha');
  const wrap = recap.parentElement;
  const btn = wrap.querySelector('.btn');

  const scale = wrap.clientWidth / recap.clientWidth;

  if(btn.getBoundingClientRect().top !== recap.getBoundingClientRect().top && scale < 1){
    recap.style.transform = 'scale('+scale+')';
  }else{
    recap.style.transform = 'scale(1)';
  }
}

window.addEventListener('load', ()=>{
  //Add contact events
  document.querySelector('.contact .btn').addEventListener('click', ()=>{contactF.submit()});
  for(let i = 0; i < document.forms.contact.elements.length; i++){
    document.forms.contact.elements[i].addEventListener('input', ()=>{contactF.checkInput()});
  }

  //Load reCAPTCHA
  if(grecaptcha){
    grecaptcha.render(document.getElementById('grecaptcha'), {
      sitekey: '6Lea3iwUAAAAAHaZPlnEhUVb-nCOYFrzO93Ac52t',
      size: 'invisible',
      badge: 'inline',
      callback: ()=>{contactF.submit()}
    });

    resizeCaptcha();
  }
});

window.addEventListener('resize', ()=>{
  resizeCaptcha();
});

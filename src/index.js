import {drawCanvas} from './js/canvas';
import ContactForm from './js/contactForm';

import './index.scss';

const contactF = new ContactForm(document.forms.contact);

window.addEventListener('load', ()=>{
  //Draw canvas
  drawCanvas();

  //Add contact events
  document.querySelector('.contact .btn').addEventListener('click', ()=>{contactF.submit()});
  for(let i = 0; i < document.forms.contact.elements.length; i++){
    document.forms.contact.elements[i].addEventListener('input', ()=>{contactF.checkInput()});
  }

  //Load reCAPTCHA
  if(grecaptcha){
    grecaptcha.render(document.getElementById('grecaptcha'), {
      sitekey: '6Le7mywUAAAAABwwS54ZzT4Xb129TTH1pvT7OnPl',
      callback: ()=>{contactF.checkInput()},
      'expired-callback': ()=>{contactF.checkInput()}
    });
  }
});

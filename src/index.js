import './js/canvas_waves';
import './js/canvas_mesh';
import './js/notification';
import './js/banner';
import ContactForm from './js/contactForm';

import './index.scss';

const contactF = new ContactForm(document.forms.contact);

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
  }
});

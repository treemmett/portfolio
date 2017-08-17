import './index.scss';

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

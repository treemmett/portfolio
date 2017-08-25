export default class ContactForm{
  constructor(form){
    if(!form || !(form instanceof HTMLElement)){
      throw new Error('Missing required element');
    }

    this.formElement = form;
  }

  checkInput(){
    let success = true;

    for(let i = 0; i < this.formElement.elements.length; i++){
      const input = this.formElement.elements[i];

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
      this.formElement.querySelector('.btn').classList.remove('disabled');
    }else{
      this.formElement.querySelector('.contact .btn').classList.add('disabled');
    }

    return success;
  }

  submit(){
    if(!this.checkInput()){
      return;
    }

    let data = {};
    let inputs = this.formElement.elements;

    for(let i = 0; i < inputs.length; i++){
      data[inputs[i].name] = inputs[i].value.trim();
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/contact/', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onload = ()=>{
      this.message(xhr.response ? 'Message was successfully sent' : 'An error occurred. Please try again later.');
    }
    xhr.onerror = ()=>{
      this.message('An error occurred. Please try again later.');
    }
    xhr.send(JSON.stringify(data));
  }

  message(msg){
    const wrap = this.formElement.querySelector('.form_wrap');
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

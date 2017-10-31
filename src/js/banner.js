window.addEventListener('DOMContentLoaded', function(){
  //Copy email to clipboard
  document.getElementById('email').addEventListener('click', function(){
    const email = document.createElement('input');
    email.style.position = 'fixed';
    email.style.opacity = '0';
    email.value = 'hello@tregan.me';
    document.body.appendChild(email);
    email.select();
    document.execCommand('copy');
    notification('Email copied to clipboard');
    email.remove();
  });

  document.querySelector('.banner .header').addEventListener('mouseenter', lineIn);
  function lineIn(force){
    //Add line to DOM
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.marginRight = '100%';
    this.querySelector('.under').appendChild(line);

    //Add exit event
    this.addEventListener('mouseleave', lineOut);

    //Toggle animation
    setTimeout(function(){line.style = ''}, 0);

    function lineOut(){
      //Remove exit event
      this.removeEventListener('mouseleave', lineOut);

      //Set remove event
      line.addEventListener('transitionend', function(e){
        if(e.propertyName === 'margin-left'){
          this.remove();
        }
      });

      //Toggle animation
      setTimeout(function(){line.style.marginLeft = '100%';}, 0);
    }
  }
});

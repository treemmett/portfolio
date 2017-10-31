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

  //Header effect
  document.querySelector('.banner .header').addEventListener('mouseenter', function(){
    //Remove existing line
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.marginRight = '100%';
    document.querySelector('.banner .header').appendChild(line);

    //Toggle animation
    setTimeout(function(){
      line.style = '';
    }, 0);

    //Add exit event
    document.querySelector('.banner .header').addEventListener('mouseleave', exit);
    function exit(){
      line.style.marginLeft = '100%';
      this.removeEventListener('mouseleave', exit);

      //Find animation time
      const reg = /margin.* (\d+.?\d+?)s/i;
      const time = getComputedStyle(line).transition.match(reg)[1] * 1000;

      //Set timer until line removal
      setTimeout(function(){line.remove()}, time);
    }

  });
});

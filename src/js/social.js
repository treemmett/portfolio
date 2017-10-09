//Copy email to clipboard
window.addEventListener('DOMContentLoaded', function(){
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
});

//Add email to body
window.addEventListener('load', function(){
  const email = document.createElement('input');
  email.value = 'hello@tregan.me';
  document.body.append(email);

  //Copy email to clipboard
  document.getElementById('email').addEventListener('click', function(){
    email.select();
    document.execCommand('copy');
  });
});

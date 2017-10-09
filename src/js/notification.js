window.notification = function(msg){
  //Add notification container
  if(!document.querySelector('.notifications')){
    const container = document.createElement('div');
    container.classList.add('notifications');
    document.body.appendChild(container);
  }

  //Add notification
  const toast = document.createElement('div');
  toast.classList.add('toast', 'hidden');
  const toastMessage = document.createTextNode(msg);
  toast.appendChild(toastMessage);
  document.querySelector('.notifications').appendChild(toast);
  const transition = getComputedStyle(toast).transition.match(/margin-left ([0-9.]+)/)[1] * 1000;
  const duration = 5000;

  //Fade in animation
  setTimeout(function(){
    toast.classList.remove('hidden');
  }, 1);

  //Fade out
  setTimeout(function(){
    toast.classList.add('hidden');
  }, 1 + duration + transition);

  //Remove toast
  setTimeout(function(){
    toast.remove();
  }, 1 + duration + transition * 2);
}

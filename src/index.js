import './index.scss';
if(process.env.NODE_ENV !== 'production')
  require('file-loader!./index.html');

const scrollEffect = () => {
  const scroll = document.body.scrollTop || document.documentElement.scrollTop;
  const banner = document.getElementsByClassName('banner')[0];
  const nav = document.getElementsByClassName('nav')[0];

  if(banner){
    banner.style.backgroundPositionY = -scroll * .07 +'px';

    if(banner.getBoundingClientRect().bottom < nav.clientHeight){
      nav.classList.remove('transparent');
    }else{
      nav.classList.add('transparent');
    }
  }
}

const navScroll = (i) => {
  const start = window.pageYOffset;
  const stop = document.getElementsByTagName('section')[0].offsetTop - document.getElementsByClassName('nav')[0].clientHeight;
  const distance = Math.max(start, stop) - Math.min(start, stop);

  if(i > start)
    return;

  if(start < stop){
    window.scrollBy(0, 10);
    window.setTimeout(function(){navScroll(start)}, 600 / distance);
  }
}

window.addEventListener('load', ()=>{
  scrollEffect();
  document.getElementsByClassName('anchor')[0].classList.add('act');
  document.getElementsByClassName('anchor')[0].addEventListener('click', navScroll);
  window.addEventListener('scroll', scrollEffect);
});

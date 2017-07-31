import './index.css';

const scrollEffect = () => {
  const scroll = document.body.scrollTop || document.documentElement.scrollTop;
  const banner = document.getElementById('banner');

  if(banner)
    banner.style.backgroundPosition = '50% calc(50% - '+scroll/15+'px)';
}

window.addEventListener('load', ()=>{
  scrollEffect();
  document.getElementById('nav').addEventListener('click', navScroll);
});

window.addEventListener('scroll', scrollEffect);

const navScroll = (i) => {
  const start = window.pageYOffset;
  const stop = document.getElementsByClassName('article')[0].offsetTop;
  const distance = Math.max(start, stop) - Math.min(start, stop);

  if(i > start)
    return;

  if(start < stop){
    window.scrollBy(0, 10);
    window.setTimeout(function(){navScroll(start)}, 800 / distance);
  }
}

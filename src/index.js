import './index.css';

const scrollEffect = () => {
  const scroll = document.body.scrollTop || document.documentElement.scrollTop;
  const banner = document.getElementById('banner');

  if(banner)
    banner.style.backgroundPosition = '50% calc(50% - '+scroll/15+'px)';
}

window.addEventListener('load', ()=>{
  scrollEffect();
});

window.addEventListener('scroll', scrollEffect);

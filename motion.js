/* Motion is progressive: the page remains readable without this file. */
(() => {
  'use strict';
  const one = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const animate = (el, frames, options) => {
    if (!preference.matches && el?.animate) el.animate(frames, options);
  };
  if (!preference.matches) document.documentElement.classList.add('enhanced-motion');
  // Automatic carousels stop off screen, in a background tab, during
  // keyboard/pointer exploration and inside a dialog. No pause buttons.
  function autoplay(root, next, delay) {
    const reasons = new Set();
    let timer, inView = false;
    const refresh = () => {
      clearTimeout(timer);
      const blocked = preference.matches || document.hidden || !inView || reasons.size || document.querySelector('dialog[open]');
      if (!blocked) timer = setTimeout(() => { next(); refresh(); }, delay);
      root.dataset.autoplay = blocked ? 'paused' : 'playing';
    };
    const setReason = (name, on) => { on ? reasons.add(name) : reasons.delete(name); refresh(); };
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; refresh(); }, {threshold:.12});
    observer.observe(root);
    root.addEventListener('mouseenter', () => { if (finePointer.matches) setReason('pointer',true); });
    root.addEventListener('mouseleave', () => setReason('pointer',false));
    root.addEventListener('focusin', () => setReason('focus',true));
    root.addEventListener('focusout', () => queueMicrotask(() => setReason('focus',root.contains(document.activeElement))));
    root.addEventListener('touchstart', () => setReason('touch',true), {passive:true});
    root.addEventListener('touchend', () => { setReason('touch',false); }, {passive:true});
    root.addEventListener('touchcancel', () => setReason('touch',false), {passive:true});
    preference.addEventListener('change',refresh);
    document.addEventListener('visibilitychange',refresh);
    new MutationObserver(refresh).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    return {reset:refresh};
  }

  let galleryController;
  function startGallery() {
    if (galleryController) return;
    galleryController = autoplay(one('.photo-gallery'),() => changeSlide(current+1,false),5200);
  }
  document.addEventListener('galleryready',startGallery);
  if (typeof gallery !== 'undefined' && gallery.length) startGallery();
  document.addEventListener('gallerychange', e => {
    if (e.detail.manual) galleryController?.reset();
    const image = one('#gallery-image');
    animate(image,[{opacity:.35,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
    const track=one('#gallery-thumbs'), active=track.querySelector('.active');
    if (active) {
      const left=active.offsetLeft-track.offsetLeft;
      if (left<track.scrollLeft || left+active.clientWidth>track.scrollLeft+track.clientWidth) track.scrollTo({left:Math.max(0,left-track.clientWidth/2+active.clientWidth/2),behavior:preference.matches?'auto':'smooth'});
    }
    const next=gallery[(e.detail.index+1)%gallery.length];
    if (next) { const preload=new Image();preload.src=`assets/${next.src}.webp`; }
  });

  // Build one dot for each distinct reachable position; recalculate on resize.
  function dotNavigation(track, holder, itemSelector, label, onUpdate) {
    let positions=[], scheduled=false;
    const getIndex = () => positions.reduce((best,p,i) => Math.abs(p-track.scrollLeft)<Math.abs(positions[best]-track.scrollLeft)?i:best,0);
    const update = () => {
      scheduled=false;const index=getIndex();
      [...holder.children].forEach((b,i) => {
        b.classList.toggle('active',i===index);
        if(i===index)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
      });
      onUpdate?.(index,positions.length);
    };
    const go = i => {
      if (!positions.length)return;
      const index=(i+positions.length)%positions.length;
      track.scrollTo({left:positions[index],behavior:preference.matches?'auto':'smooth'});
    };
    const build = () => {
      const items=[...track.querySelectorAll(itemSelector)], max=Math.max(0,track.scrollWidth-track.clientWidth);
      positions=[];
      items.forEach(item=>{
        const p=Math.min(max,item.offsetLeft);
        if(!positions.length || p-positions.at(-1)>5)positions.push(p);
      });
      holder.replaceChildren(...positions.map((p,i)=>{
        const b=document.createElement('button');b.className='carousel-dot';b.type='button';
        b.setAttribute('aria-label',`${label} ${i+1}`);b.addEventListener('click',()=>go(i));return b;
      }));
      update();
    };
    track.addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(update);scheduled=true;}},{passive:true});
    new ResizeObserver(build).observe(track);
    build();
    return {go,next:()=>go(getIndex()+1),previous:()=>go(getIndex()-1),build};
  }
  let videoNavigation, videoController;
  function startVideoDots() {
    if(videoNavigation)return;
    videoNavigation=dotNavigation(one('#video-track'),one('#video-dots'),'.video-card','Ver grupo de vídeos',(index,total)=>{
      one('#video-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    });
    videoController=autoplay(one('.video-carousel'),videoNavigation.next,5200);
    one('#video-dots').addEventListener('click',()=>videoController.reset());
    all('.video-prev,.video-next').forEach(button=>button.addEventListener('click',()=>videoController.reset()));
    setupSilentPreviews();
  }
  document.addEventListener('videosready',startVideoDots);
  if(one('.video-card'))startVideoDots();

  function setupSilentPreviews() {
    const track=one('#video-track'), region=one('.video-carousel');
    const clips=[...track.querySelectorAll('.video-preview')], visible=new Set();
    let regionVisible=false;
    function syncPreviews() {
      const canPlay=regionVisible && !document.hidden && !preference.matches && !document.querySelector('dialog[open]');
      clips.forEach(clip=>{
        // Preview files also have their audio stream removed at encode time.
        clip.defaultMuted=true;clip.muted=true;clip.volume=0;
        const show=canPlay && visible.has(clip);
        if(show){
          if(!clip.hasAttribute('src'))clip.src=clip.dataset.preview;
          if(clip.paused)clip.play().catch(()=>{clip.closest('.video-card').classList.remove('preview-active');});
        }else{
          clip.pause();clip.closest('.video-card').classList.remove('preview-active');
        }
      });
    }
    clips.forEach(clip=>{
      clip.defaultMuted=true;clip.muted=true;clip.volume=0;
      clip.addEventListener('playing',()=>{
        if(regionVisible&&!document.hidden&&!preference.matches&&visible.has(clip)&&!document.querySelector('dialog[open]'))clip.closest('.video-card').classList.add('preview-active');
        else{clip.pause();clip.closest('.video-card').classList.remove('preview-active');}
      });
      clip.addEventListener('error',()=>clip.closest('.video-card').classList.remove('preview-active'));
    });
    new IntersectionObserver(entries=>{
      regionVisible=entries[0].isIntersecting;syncPreviews();
    },{threshold:.08}).observe(region);
    const cardObserver=new IntersectionObserver(entries=>{
      entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));syncPreviews();
    },{root:track,threshold:.12});
    clips.forEach(clip=>cardObserver.observe(clip));
    document.addEventListener('visibilitychange',syncPreviews);
    preference.addEventListener('change',syncPreviews);
    new MutationObserver(syncPreviews).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    one('#video-dialog').addEventListener('close',syncPreviews);
  }
  const reviewTrack=one('#reviews-track');
  const reviewNav=dotNavigation(reviewTrack,one('#review-dots'),'.quote','Ver avaliações a partir da posição');
  const reviewsController=autoplay(one('.reviews-carousel'),reviewNav.next,6500);
  one('#review-prev').addEventListener('click',()=>{reviewNav.previous();reviewsController.reset();});
  one('#review-next').addEventListener('click',()=>{reviewNav.next();reviewsController.reset();});
  reviewTrack.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.key==='ArrowRight'?reviewNav.next():reviewNav.previous();reviewsController.reset();}
  });

  // Word reveals preserve inline marks, intentional line breaks and headings.
  all('h2').forEach(heading=>{
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    let index=0;
    nodes.forEach(node=>{
      const fragment=document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word=>{
        if(!word.trim()){fragment.append(document.createTextNode(word));return;}
        const span=document.createElement('span');span.className='word-reveal';
        span.style.setProperty('--word-delay',`${Math.min(index++*55,450)}ms`);
        const inner=document.createElement('span');inner.textContent=word;span.append(inner);fragment.append(span);
      });node.replaceWith(fragment);
    });
  });
  const textObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('text-visible');textObserver.unobserve(e.target);}
  }),{threshold:.2});
  all('h2').forEach(h=>textObserver.observe(h));
  const surfaceObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('surface-visible');surfaceObserver.unobserve(e.target);}
  }),{threshold:.1});
  all('.benefits .container>div,.materials,.final-cta,.quote-form,.video-carousel').forEach((el,i)=>{
    el.classList.add('motion-surface');el.style.setProperty('--surface-delay',`${i%4*65}ms`);surfaceObserver.observe(el);
  });

  // One animation frame for the scroll progress, image parallax and hero depth.
  const hero=one('.hero'), background=one('.hero-bg');
  const surfaces=all('.project-card .image-frame,.storefront');
  let frame=false;
  function renderMotion() {
    frame=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    one('.scroll-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;
    one('#header').classList.toggle('scrolled',scrollY>30);
    if(preference.matches){background.style.transform='';surfaces.forEach(s=>s.style.setProperty('--parallax-y','0px'));return;}
    const rect=hero.getBoundingClientRect();
    if(rect.bottom>0 && rect.top<innerHeight){
      const depth=innerWidth>600?Math.max(-70,Math.min(100,-rect.top*.16)):0;
      background.style.transform=`translate3d(0,${depth}px,0)`;
    }
    surfaces.forEach(surface=>{
      const r=surface.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){const y=Math.max(-13,Math.min(13,(innerHeight/2-r.top-r.height/2)*.035));surface.style.setProperty('--parallax-y',`${y}px`);}
    });
  }
  const requestRender=()=>{if(!frame){frame=true;requestAnimationFrame(renderMotion);}};
  addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);
  preference.addEventListener('change',()=>{
    document.documentElement.classList.toggle('enhanced-motion',!preference.matches);
    if(preference.matches){document.getAnimations().forEach(a=>{try{if(a.effect?.getComputedTiming().iterations===Infinity)a.cancel();else a.finish();}catch{a.cancel();}});}
    requestRender();
  });requestRender();

  // Subtle tilt and a cursor-following light on service and project cards.
  all('.solution-card,.project-card,.video-card,.quote').forEach(card=>bindPointer(card));
  function bindPointer(card){
    card.addEventListener('pointermove',e=>{
      if(!finePointer.matches||preference.matches)return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--pointer-x',`${x*100}%`);card.style.setProperty('--pointer-y',`${y*100}%`);
      card.style.setProperty('--tilt-x',`${(y-.5)*-3}deg`);card.style.setProperty('--tilt-y',`${(x-.5)*3}deg`);
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  }
  document.addEventListener('videosready',()=>all('.video-card').forEach(bindPointer));
  // The form reacts to focus, while ordinary field and submission behavior stays native.
  one('#quote-form').addEventListener('focusin',()=>one('#quote-form').classList.add('form-engaged'));
  one('#quote-form').addEventListener('focusout',()=>queueMicrotask(()=>one('#quote-form').classList.toggle('form-engaged',one('#quote-form').contains(document.activeElement))));
})();

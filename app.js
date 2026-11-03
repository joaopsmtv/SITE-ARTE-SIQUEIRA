'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const services = [
  {name:'Impressão 3D',image:'02',short:'Projetos personalizados com alto nível de detalhe.',description:'Da ideia ao objeto: criamos peças tridimensionais sob medida para apresentar, decorar e dar forma ao que você imagina.',features:['Peças decorativas e projetos personalizados','Protótipos e modelos para apresentação','Dimensões, materiais e acabamento definidos no orçamento']},
  {name:'Impressão UV',image:'03',short:'Cores vibrantes e alta durabilidade em diversos materiais.',description:'Impressão de alta definição que transforma superfícies em novas possibilidades para a sua marca, com cores vivas e riqueza de detalhes.',features:['Impressão em materiais como PVC, acrílico e MDF','Painéis, placas e peças personalizadas','Avaliação do material e aplicação para cada projeto']},
  {name:'Letras caixa & LED',image:'04',short:'Mais destaque para a sua marca, dia e noite.',description:'Volume, presença e luz para tornar a sua marca parte do ambiente. Desenvolvemos letras e soluções de iluminação para fachadas e interiores.',features:['Letras caixa e letreiros personalizados','Iluminação LED e lightboxes','Projeto adequado à identidade da sua marca']},
  {name:'Adesivos & lonas',image:'05',short:'Personalização de ambientes, frotas, fachadas e muito mais.',description:'Leve sua identidade para onde ela precisa estar. Soluções de comunicação visual para transformar ambientes, divulgar campanhas e destacar negócios.',features:['Adesivos para ambientes e veículos','Lonas, banners e comunicação de fachadas','Medidas e aplicações sob consulta']}
];
services.push({name:'Corte a Laser',image:'trabalho-08',short:'Precisão para transformar ideias em peças únicas.',description:'Cortes personalizados para dar forma a peças, detalhes e projetos de comunicação visual.',features:['Peças personalizadas para sua marca','Acabamentos e formatos sob medida','Consulte materiais, medidas e aplicações com a equipe']});
$('#solution-grid').innerHTML = services.slice(0,4).map((s,i)=>`<article class="solution-card reveal"><div class="image-frame"><img src="assets/${s.image}.webp" alt="${s.name} — exemplo de aplicação" loading="lazy" width="700" height="560"></div><div class="solution-body"><div><h3>${s.name}</h3><p>${s.short}</p></div><button class="round-arrow" data-service="${i}" aria-label="Conhecer ${s.name}">${arrow}</button></div></article>`).join('');
const menu = $('#navigation'), menuToggle = $('.menu-toggle'), dropdown = $('.dropdown'), solutionsToggle = $('.solutions-toggle');
function closeMenu(){menu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menu');dropdown.classList.remove('open');solutionsToggle.setAttribute('aria-expanded','false')}
menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
solutionsToggle.addEventListener('click',()=>{const open=dropdown.classList.toggle('open');solutionsToggle.setAttribute('aria-expanded',String(open))});
document.addEventListener('click',e=>{if(!dropdown.contains(e.target)){dropdown.classList.remove('open');solutionsToggle.setAttribute('aria-expanded','false')}if(e.target.closest('nav a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const serviceDialog=$('#service-dialog');let selectedService=0;
$$('[data-service]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();selectedService=Number(el.dataset.service);const s=services[selectedService];$('#service-image').src=`assets/${s.image}.webp`;$('#service-image').alt=s.name;$('#service-title').textContent=s.name;$('#service-description').textContent=s.description;$('#service-features').replaceChildren(...s.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));closeMenu();serviceDialog.showModal()}));
$('#service-cta').addEventListener('click',()=>{$('#service-select').value=services[selectedService].name;serviceDialog.close();setTimeout(()=>$('#quote-form input').focus({preventScroll:true}),500)});
const lightbox=$('#lightbox');
function showImage(src,title){$('#lightbox-image').src=src;$('#lightbox-image').alt=title;$('#lightbox-title').textContent=title;lightbox.showModal()}
$$('[data-image]').forEach(el=>el.addEventListener('click',()=>showImage(el.dataset.image,el.dataset.title)));
$$('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{document.body.style.overflow=''});new MutationObserver(()=>{if(d.open)document.body.style.overflow='hidden'}).observe(d,{attributes:true,attributeFilter:['open']})});
let gallery=[], current=0;
function renderGallery(){
  $('#gallery-thumbs').innerHTML=gallery.map((g,i)=>`<button class="thumb ${i===0?'active':''}" aria-label="Ver ${g.title}" aria-pressed="${i===0}" data-index="${i}"><img src="assets/${g.src}.webp" alt="" loading="lazy"></button>`).join('');
  $$('.thumb').forEach(b=>b.addEventListener('click',()=>changeSlide(Number(b.dataset.index))));
  changeSlide(0,false);
  document.dispatchEvent(new Event('galleryready'));
}
function changeSlide(index,manual=true){if(!gallery.length)return; current=(index+gallery.length)%gallery.length;const g=gallery[current];$('#gallery-image').src=`assets/${g.src}.webp`;$('#gallery-image').alt=g.alt;$('#gallery-label').textContent=g.title;$('#gallery-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;$$('.thumb').forEach((b,i)=>{b.classList.toggle('active',i===current);b.setAttribute('aria-pressed',String(i===current))});document.dispatchEvent(new CustomEvent('gallerychange',{detail:{index:current,manual}}))}
fetch('assets/gallery.json').then(r=>{if(!r.ok)throw Error('gallery');return r.json()}).then(data=>{gallery=data;renderGallery()}).catch(()=>{$('#gallery-count').textContent='';$('#gallery-thumbs').textContent='Não foi possível carregar a galeria. Recarregue a página.'});
$('.prev').addEventListener('click',()=>changeSlide(current-1));$('.next').addEventListener('click',()=>changeSlide(current+1));$('.gallery-photo').addEventListener('click',()=>{if(gallery[current])showImage(`assets/${gallery[current].src}.webp`,gallery[current].title)});
$('.gallery-main').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changeSlide(current-1)}if(e.key==='ArrowRight'){e.preventDefault();changeSlide(current+1)}});
let touchX=null;$('.gallery-main').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});$('.gallery-main').addEventListener('touchend',e=>{if(touchX!==null){const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>50)changeSlide(current+(delta<0?1:-1));touchX=null}},{passive:true});
const videoDialog=$('#video-dialog'), videoPlayer=$('#service-video'), videoTrack=$('#video-track');
fetch('assets/videos.json').then(r=>{if(!r.ok)throw Error('videos');return r.json()}).then(videos=>{
 videoTrack.innerHTML=videos.map((v,i)=>`<button class="video-card" data-video="${i}" aria-label="Reproduzir ${v.title}"><img src="${v.poster}" alt="" loading="lazy"><video class="video-preview" data-preview="${v.preview}" poster="${v.poster}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback></video><span class="video-play"><svg><use href="#play"/></svg></span><span class="video-card-name">${v.title}</span></button>`).join('');
 $$('.video-card').forEach(b=>b.addEventListener('click',()=>{const v=videos[Number(b.dataset.video)];videoPlayer.src=v.src;videoPlayer.poster=v.poster;videoPlayer.muted=false;videoPlayer.volume=1;$('#video-title').textContent=v.title;videoDialog.showModal();videoPlayer.play().catch(()=>{})}));
 document.dispatchEvent(new Event('videosready'));
}).catch(()=>{videoTrack.textContent='Não foi possível carregar os vídeos. Recarregue a página.'});
videoDialog.addEventListener('close',()=>{videoPlayer.pause();videoPlayer.removeAttribute('src');videoPlayer.load()});
function moveVideos(direction){videoTrack.scrollBy({left:direction*(videoTrack.querySelector('.video-card')?.getBoundingClientRect().width+20||300),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
$('.video-prev').addEventListener('click',()=>moveVideos(-1));$('.video-next').addEventListener('click',()=>moveVideos(1));
videoTrack.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveVideos(e.key==='ArrowRight'?1:-1)}});
function updateVideoArrows(){ $('.video-prev').disabled=videoTrack.scrollLeft<5;$('.video-next').disabled=videoTrack.scrollLeft+videoTrack.clientWidth>=videoTrack.scrollWidth-5 }
videoTrack.addEventListener('scroll',updateVideoArrows,{passive:true});new ResizeObserver(updateVideoArrows).observe(videoTrack);
$('#quote-form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,data=new FormData(form);if(data.get('website'))return;
 const msg=`Olá, Arte Siqueira! Gostaria de solicitar um orçamento.\n\nNome: ${data.get('nome').trim()}\nE-mail: ${data.get('email').trim()}\nWhatsApp: ${data.get('telefone').trim()}\nServiço: ${data.get('servico')}\n\nMeu projeto:\n${data.get('projeto').trim()}`;
 const url=`https://wa.me/5561984110003?text=${encodeURIComponent(msg)}`;
 const win=window.open(url,'_blank');if(win)win.opener=null;
 const status=$('#form-status');status.replaceChildren();const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent='Abrir WhatsApp';link.style.textDecoration='underline';status.append(document.createTextNode('Envie a mensagem no WhatsApp para concluir a conversa. '),link);
 const emailStatus=document.createElement('span');emailStatus.className='email-status';emailStatus.textContent='Encaminhando cópia por e-mail…';status.append(emailStatus);
 const button=form.querySelector('[type=submit]');button.disabled=true;
 try{
  const response=await fetch('https://formsubmit.co/ajax/artesiqueira1@hotmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:data.get('nome').trim(),email:data.get('email').trim(),WhatsApp:data.get('telefone').trim(),Serviço:data.get('servico'),Projeto:data.get('projeto').trim(),_subject:'Novo orçamento — Site Arte Siqueira',_cc:'artesiqueira2@hotmail.com',_template:'table',_url:location.href}),signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw Error('email');
  emailStatus.textContent='Solicitação de cópia por e-mail recebida pelo serviço de envio.';
 }catch{emailStatus.textContent='Não foi possível confirmar o envio da cópia por e-mail. Continue pelo WhatsApp ou envie para artesiqueira1@hotmail.com.';}finally{button.disabled=false}
});
$('#year').textContent=new Date().getFullYear();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){if(!reduced.matches)document.documentElement.classList.add('motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));const activeObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.nav-link[href]').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`))}),{rootMargin:'-15% 0px -55% 0px',threshold:0});$$('main section[id]').forEach(el=>activeObserver.observe(el))}
reduced.addEventListener('change',()=>{if(reduced.matches)document.documentElement.classList.remove('motion')});

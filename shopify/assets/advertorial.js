(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Lazy-load + play the loop video only when scrolled into view (poster shows until then; stays paged out under reduced-motion) */
  (function(){
    var lv=document.querySelector('.loop-video'); if(!lv||reduce||!('IntersectionObserver'in window))return;
    var lio=new IntersectionObserver(function(en,ob){en.forEach(function(e){
      if(e.isIntersecting){ if(!lv.src){lv.src=lv.getAttribute('data-src');} lv.play&&lv.play().catch(function(){}); ob.unobserve(lv); }
    })},{rootMargin:'200px 0px'});
    lio.observe(lv);
  })();

  /* progress hairline */
  var bar=document.getElementById('progress');
  var onScroll=function(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';
  };
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  var rvEls=document.querySelectorAll('.rv,.stg,.scalein,.wordrev,.linemask');
  if(reduce||!('IntersectionObserver'in window)){
    rvEls.forEach(function(e){e.classList.add('in')});
  }else{
    document.querySelectorAll('.stg').forEach(function(g){
      [].forEach.call(g.children,function(c,i){c.style.transitionDelay=(i*0.08)+'s'});
    });
    // wrap words for word-reveal
    document.querySelectorAll('.wordrev p').forEach(function(p){
      var t=p.textContent;p.textContent='';
      t.split(/(\s+)/).forEach(function(tok){
        if(tok.trim()===''){p.appendChild(document.createTextNode(tok));}
        else{var s=document.createElement('span');s.className='w';s.textContent=tok;p.appendChild(s);}
      });
    });
    var io=new IntersectionObserver(function(en,ob){
      en.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');
        if(e.target.classList.contains('wordrev')){
          e.target.querySelectorAll('.w').forEach(function(w,i){w.style.transitionDelay=(i*0.05)+'s'});
        }
        if(e.target.classList.contains('linemask')){
          e.target.querySelectorAll('span i').forEach(function(l,i){l.style.transitionDelay=(i*0.22)+'s'});
        }
        ob.unobserve(e.target);
      });
    },{threshold:0.16,rootMargin:'0px 0px -7% 0px'});
    rvEls.forEach(function(e){io.observe(e)});
  }

  /* count-up */
  var runCount=function(el){
    var target=parseInt(el.getAttribute('data-count'),10),suf=el.getAttribute('data-suffix')||'';
    if(reduce){el.innerHTML=target+suf;return;}
    var dur=1200,start=null;
    (function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/dur,1),e=1-Math.pow(1-p,3);
      el.innerHTML=Math.round(target*e)+suf;if(p<1)requestAnimationFrame(step);})(performance.now());
  };
  var counters=document.querySelectorAll('[data-count]');
  if('IntersectionObserver'in window){
    var cio=new IntersectionObserver(function(en,ob){en.forEach(function(e){if(e.isIntersecting){runCount(e.target);ob.unobserve(e.target);}})},{threshold:0.6});
    counters.forEach(function(c){cio.observe(c)});
  }else counters.forEach(function(c){c.innerHTML=c.getAttribute('data-count')+(c.getAttribute('data-suffix')||'')});

  /* rosacea flush progression */
  var strip=document.getElementById('rosacea');
  if(strip){
    var plates=strip.querySelectorAll('.plate-portrait');
    var levels=[0.28,0.55,0.8,1];
    var setAll=function(upTo){plates.forEach(function(p,i){p.style.setProperty('--flush', i<=upTo?levels[i]:0)});};
    if(reduce){plates.forEach(function(p,i){p.style.setProperty('--flush',levels[i])});}
    else if('IntersectionObserver'in window){
      var done=false;
      var sio=new IntersectionObserver(function(en,ob){en.forEach(function(e){
        if(e.isIntersecting&&!done){done=true;var i=0;(function adv(){setAll(i);if(i<3){i++;setTimeout(adv,900);}})();ob.unobserve(e.target);}
      })},{threshold:0.4});
      sio.observe(strip);
    }else plates.forEach(function(p,i){p.style.setProperty('--flush',levels[i])});
  }

  /* "I was neither" gentle pulse */
  var neither=document.getElementById('neither');
  if(neither&&!reduce&&'IntersectionObserver'in window){
    var nio=new IntersectionObserver(function(en,ob){en.forEach(function(e){if(e.isIntersecting){
      neither.animate([{background:'#F8EBEF'},{background:'#C4718E',color:'#fff'},{background:'#F8EBEF',color:'#7A3A54'}],{duration:900,easing:'ease'});
      ob.unobserve(e.target);}})},{threshold:0.9});
    nio.observe(neither);
  }

  /* carousel dots + one-time nudge */
  var car=document.getElementById('carousel');
  if(car){
    var track=car.querySelector('.ctrack'),cards=track.children,dots=document.querySelectorAll('#cdots button');
    var gap=16;
    var upd=function(){var w=cards[0].offsetWidth+gap;var idx=Math.round(car.scrollLeft/w);idx=Math.max(0,Math.min(idx,dots.length-1));dots.forEach(function(b,i){b.classList.toggle('on',i===idx)});};
    var t;car.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(upd,80)},{passive:true});
    dots.forEach(function(b,i){b.addEventListener('click',function(){car.scrollTo({left:i*(cards[0].offsetWidth+gap),behavior:reduce?'auto':'smooth'})})});
    if(!reduce&&'IntersectionObserver'in window){
      var touched=false;car.addEventListener('scroll',function(){touched=true},{passive:true,once:true});
      var nio2=new IntersectionObserver(function(en,ob){en.forEach(function(e){if(e.isIntersecting){setTimeout(function(){if(!touched)car.classList.add('do-nudge')},3000);ob.unobserve(e.target);}})},{threshold:0.6});
      nio2.observe(car);
    }
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click',function(){
      var it=btn.parentElement,open=it.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      btn.querySelector('.sign').textContent=open?'−':'+';
    });
  });

  /* CTA analytics stub (Phase 2: Meta Pixel Lead/AddToCart + GA4 cta_click) */
  document.querySelectorAll('[data-cta]').forEach(function(a){
    a.addEventListener('click',function(){var p=a.getAttribute('data-cta');
      if(window.console)console.log('[cta_click]',p==='main'?'AddToCart':'Lead','position='+p);});
  });
})();

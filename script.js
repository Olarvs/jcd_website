document.addEventListener('DOMContentLoaded',function(){
  // Year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if(navToggle && nav){
    navToggle.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      nav.style.display = open ? 'block' : '';
    });
  }

  // Contact form basic validation (no network submission)
  const form = document.getElementById('contact-form');
  const msg = document.getElementById('form-msg');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if(!name || !email || !message){
        msg.textContent = 'Please complete all fields.';
        return;
      }
      // Very small email check
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        msg.textContent = 'Please enter a valid email address.';
        return;
      }
      msg.textContent = 'Thanks — your message has been noted (demo).';
      form.reset();
    });
  }

  // Mission & Vision Modal
  const mvBtn = document.getElementById('mv-btn');
  const mvModal = document.getElementById('mv-modal');
  const closeBtn = document.getElementById('close-mv');
  
  if(mvBtn && mvModal){
    mvBtn.addEventListener('click', ()=>{
      mvModal.classList.add('active');
    });
    
    closeBtn.addEventListener('click', ()=>{
      mvModal.classList.remove('active');
    });
    
    mvModal.addEventListener('click', (e)=>{
      if(e.target === mvModal){
        mvModal.classList.remove('active');
      }
    });
  }

  // See More Services
  const seeMoreBtn = document.getElementById('see-more-btn');
  if(seeMoreBtn){
    let showingAll = false;
    seeMoreBtn.addEventListener('click', ()=>{
      const hiddenServices = document.querySelectorAll('.services-hidden');
      showingAll = !showingAll;
      
      hiddenServices.forEach(service => {
        if(showingAll){
          service.classList.add('visible');
        } else {
          service.classList.remove('visible');
        }
      });
      
      seeMoreBtn.textContent = showingAll ? 'Show Less' : 'See All Services';
    });
  }

  // Team Carousel (infinite loop)
  (function(){
    const teamTrack = document.getElementById('team-track');
    const teamPrev = document.getElementById('team-prev');
    const teamNext = document.getElementById('team-next');
    if(!teamTrack || !teamPrev || !teamNext) return;

    let originals = Array.from(teamTrack.querySelectorAll('.person'));
    if(originals.length === 0) return;

    let perPage = 1;
    let totalPages = 1;
    let currentPage = 0;
    let resizeTimer = null;

    function getPerPage(){
      return window.innerWidth > 1024 ? 4 : window.innerWidth > 768 ? 2 : 1;
    }

    let itemWidth = 0;
    let gapWidth = 0;
    let totalItems = 0;
    let originalCount = originals.length; // store count of original lawyers

    function build(){
      // reset
      teamTrack.innerHTML = '';
      perPage = getPerPage();
      const orig = originals.map(n => n.cloneNode(true));
      const prepend = orig.slice(-perPage).map(n => n.cloneNode(true));
      const append = orig.slice(0, perPage).map(n => n.cloneNode(true));

      const frag = document.createDocumentFragment();
      prepend.forEach(n => frag.appendChild(n));
      orig.forEach(n => frag.appendChild(n));
      append.forEach(n => frag.appendChild(n));
      teamTrack.appendChild(frag);

      totalItems = teamTrack.children.length;
      totalPages = Math.max(1, Math.ceil(orig.length / perPage));
      currentPage = 0;

      // measure sizes after layout and set initial transform in pixels
      requestAnimationFrame(()=>{
        const first = teamTrack.querySelector('.person');
        if(first){
          itemWidth = first.offsetWidth;
        } else {
          itemWidth = 0;
        }
        const cs = getComputedStyle(teamTrack);
        gapWidth = parseFloat(cs.gap || cs.columnGap || '0') || 0;

        const startOffsetPx = perPage * (itemWidth + gapWidth);
        teamTrack.style.transition = 'none';
        teamTrack.style.transform = `translateX(-${startOffsetPx}px)`;
        requestAnimationFrame(()=>{ teamTrack.style.transition = 'transform 0.45s ease'; });

        // show/hide buttons
        if(totalPages <= 1){
          teamPrev.style.display = 'none';
          teamNext.style.display = 'none';
        } else {
          teamPrev.style.display = '';
          teamNext.style.display = '';
        }
      });
    }

    function goToPage(page){
      // translate using pixel measurements for accurate fit
      const targetPx = perPage * (itemWidth + gapWidth) + page * perPage * (itemWidth + gapWidth);
      teamTrack.style.transform = `translateX(-${targetPx}px)`;
      currentPage = page;
    }

    teamNext.addEventListener('click', ()=>{
      currentPage++;
      goToPage(currentPage);
    });

    teamPrev.addEventListener('click', ()=>{
      currentPage--;
      goToPage(currentPage);
    });

    teamTrack.addEventListener('transitionend', ()=>{
      // when moved past last page
      if(currentPage >= totalPages){
        currentPage = 0;
        const resetOffsetPx = perPage * (itemWidth + gapWidth) + currentPage * perPage * (itemWidth + gapWidth);
        teamTrack.style.transition = 'none';
        teamTrack.style.transform = `translateX(-${resetOffsetPx}px)`;
        requestAnimationFrame(()=>{ teamTrack.style.transition = 'transform 0.45s ease'; });
      }
      // when moved before first page
      if(currentPage < 0){
        currentPage = totalPages - 1;
        const resetOffsetPx = perPage * (itemWidth + gapWidth) + currentPage * perPage * (itemWidth + gapWidth);
        teamTrack.style.transition = 'none';
        teamTrack.style.transform = `translateX(-${resetOffsetPx}px)`;
        requestAnimationFrame(()=>{ teamTrack.style.transition = 'transform 0.45s ease'; });
      }
    });

    // rebuild on resize
    window.addEventListener('resize', ()=>{
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(()=>{
        // rebuild originals remain same
        build();
      }, 150);
    });

    // initial build
    build();

    // Autoplay (infinite) — advances automatically, pauses on hover/focus
    const teamCarouselEl = teamTrack.parentElement;
    const autoplayDelay = 3500;
    let autoplayTimer = null;
    function startAutoplay(){
      stopAutoplay();
      // only autoplay when there's more than one page
      const per = getPerPage();
      const totalPages = Math.ceil(originals.length / per);
      if(totalPages <= 1) return;
      autoplayTimer = setInterval(()=>{ teamNext.click(); }, autoplayDelay);
    }
    function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; } }

    // expose functions globally for view-all button to control
    window.stopTeamAutoplay = stopAutoplay;
    window.startTeamAutoplay = startAutoplay;

    // pause on hover/focus to improve usability
    if(teamCarouselEl){
      teamCarouselEl.addEventListener('mouseenter', stopAutoplay);
      teamCarouselEl.addEventListener('mouseleave', startAutoplay);
      teamCarouselEl.addEventListener('focusin', stopAutoplay);
      teamCarouselEl.addEventListener('focusout', startAutoplay);
    }

    // start autoplay
    startAutoplay();
  })();

  // View All Lawyers
  const viewAllBtn = document.getElementById('view-all-lawyers-btn');
  const teamCarousel = document.querySelector('.team-carousel');
  const teamTrack = document.getElementById('team-track');
  if(viewAllBtn && teamCarousel && teamTrack){
    let showingAll = false;
    viewAllBtn.addEventListener('click', ()=>{
      showingAll = !showingAll;
      const allPersons = teamTrack.querySelectorAll('.person');
      
      if(showingAll){
        teamCarousel.classList.add('expanded');
        viewAllBtn.textContent = 'View Carousel';
        // stop autoplay when viewing all
        if(window.stopTeamAutoplay) window.stopTeamAutoplay();
        // show only original lawyers (hide clones)
        // clones are: first perPage items (prepend) and last perPage items (append)
        const perPage = window.innerWidth > 1024 ? 4 : window.innerWidth > 768 ? 2 : 1;
        allPersons.forEach((person, idx)=>{
          // hide prepended clones (first perPage items) and appended clones (last perPage items)
          if(idx < perPage || idx >= allPersons.length - perPage){
            person.style.display = 'none';
          } else {
            person.style.display = '';
          }
        });
      } else {
        teamCarousel.classList.remove('expanded');
        viewAllBtn.textContent = 'View All Lawyers';
        // resume autoplay when back to carousel
        if(window.startTeamAutoplay) window.startTeamAutoplay();
        // show all (clones will be hidden by overflow anyway in carousel mode)
        allPersons.forEach(person => person.style.display = '');
      }
    });
  }

  // Lawyer Modal
  const lawyerModal = document.getElementById('lawyer-modal');
  const closeLawyerBtn = document.getElementById('close-lawyer-modal');
  
  if(lawyerModal && closeLawyerBtn){
    const allLawyers = document.querySelectorAll('.person');
    const lawyerData = {
      'Rita Linda V. Jimeno': { 
        role: 'Managing Partner', 
        credentials: `<strong>Education:</strong><br>Bachelor of Laws, University of the Philippines (Batch 1985, among top 15% of graduates)<br>Master of Laws, San Beda University (Batch 2018)<br><br><strong>Expertise:</strong><br>Corporate and Family Law<br><br><strong>Professional Roles:</strong><br>• Vice Dean, Centro Escolar School of Law & Jurisprudence<br>• Professorial Lecturer, Philippine Judicial Academy<br>• Professor of Law, San Beda College of Law Alabang<br>• Arbitrator, International Chamber of Commerce, International Court of Arbitration<br>• Mediator, Court of Appeals & Regional Trial Courts (accredited by Supreme Court & Philippine Judicial Academy)<br><br><strong>Government & Institutional Roles:</strong><br>• 1st Filipino Director, Executive Council of International Criminal Bar representing Asia (2003-2007)<br>• President, Philippine Bar Association (2004-2005)<br>• Director, University of the Philippines Alumni Association (2006-2009; 2009-2012)<br>• Vice President for Constitutional Reforms, Philippine Constitution Association (2008-2010)<br>• Member, Technical Panel for Legal Education, Commission on Higher Education<br>• Member, Supreme Court's Sub-Committee on Rule Revisions<br>• Co-Chair, Committee on Judicial Reforms, Constitutional Consultative Commission<br>• Co-Chair, Membership Committee, ASEAN Law Association<br><br><strong>Other Roles:</strong><br>• Legal Counsel, Philippine Chamber of Commerce & Industry<br>• Columnist, Manila Standard (weekly column: "Out of the Box")<br>• Lecturer, Mandatory Continuing Legal Education for Lawyers (MCLE)<br>• Co-author, Benchbook for Philippine Judges (2009 edition)<br>• Rehabilitation Receiver, United BF Homeowner's Association` 
      },
      'Nicanor B. Jimeno': { 
        role: 'Senior Partner', 
        credentials: `<strong>Education:</strong><br>Bachelor of Laws, University of the Philippines (Batch 1974)<br><br><strong>Expertise:</strong><br>Labor Law, Labor Relations, Collective Bargaining Agreements and all labor-related matters<br>Civil Cases, Land Registration and other fields of law practice<br><br><strong>Experience:</strong><br>• 41 years in active practice of law<br><br><strong>Professional Roles:</strong><br>• Accredited Mediator, Court of Appeals<br>• Professor of Labor Law and Relations, Centro Escolar University, College of Law<br>• Vice President for Constitutional Reforms, Philippine Constitution Association (2008-2010)` 
      },
      'Antonio C. Cope': { 
        role: 'Partner', 
        credentials: `<strong>Education:</strong><br>Bachelor of Laws, University of the East (Batch 1976)<br>BA Political Science, MLQU (1972, Magna Cum Laude)<br><br><strong>Bar Achievement:</strong><br>• Bar Topnotcher, UE College of Law<br><br><strong>Expertise:</strong><br>Prosecution and defense of Criminal cases<br>Litigation of Civil cases<br><br><strong>Professional Roles:</strong><br>• Accredited Mediator, Philippine Judicial Academy<br>• President, Amando Cope College in Bicol` 
      },
      'Michael E. David': { 
        role: 'Partner', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, University of Sto. Tomas (Batch 2001)<br><br><strong>Academic Achievement:</strong><br>• Graduated in the top 8 of his class at UST College of Law<br><br><strong>Expertise:</strong><br>Intellectual Property Law<br>Litigation and Trial advocacy in Civil, Criminal, Labor and Intellectual Property cases<br><br><strong>Experience:</strong><br>• Litigation and Trial Lawyer handling various cases across multiple practice areas` 
      },
      'Karen Olivia V. Jimeno': { 
        role: 'Junior Partner', 
        credentials: `<strong>Education:</strong><br>Bachelor of Laws, University of the Philippines (Batch 2005, Cum Laude)<br>Master of Laws, Harvard Law School (Batch 2011)<br>Master of Development Practice certified in Engineering & Business for Sustainability, University of California-Berkeley (Batch 2020)<br><br><strong>Honors:</strong><br>• Fulbright Scholar (2018-2020)` 
      },
      'Nikki Sarah V. Jimeno': { 
        role: 'Junior Partner', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, University of the Philippines (Batch 2008)<br>Master of Laws in Comparative Constitutional Law, Central European University (Batch 2018)` 
      },
      'Angela Marie A. Almalbis': { 
        role: 'Senior Associate', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, Centro Escolar University (Batch 2020, Valedictorian)` 
      },
      'Alissa Andrea E. Llangco': { 
        role: 'Senior Associate', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, San Beda University, Manila (Batch 2020)`  
      },
      'Yrah M. Cruz': { 
        role: 'Senior Associate', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, San Beda University, Manila (Batch 2020)` 
      },
      'Vance Ivor A. Escaro': { 
        role: 'Senior Associate', 
        credentials: `<strong>Education:</strong><br>Juris Doctor, Centro Escolar University (Batch 2016)` 
      }
    };
    
    allLawyers.forEach(lawyer => {
      lawyer.addEventListener('click', ()=>{
        const name = lawyer.querySelector('h4')?.textContent || 'Lawyer';
        // const initials = lawyer.querySelector('.avatar')?.textContent || 'LV';
        const info = lawyerData[name] || { role: 'Attorney', credentials: 'Legal professional at Jimeno Cope & David Law Offices.' };
        const imgEl = lawyer.querySelector('img');
        const avatar = document.getElementById('lawyer-avatar');

        avatar.src = imgEl ? imgEl.src : '';
        avatar.alt = name;
        // document.getElementById('lawyer-avatar').textContent = initials;
        document.getElementById('lawyer-name').textContent = name;
        document.getElementById('lawyer-role').textContent = info.role;
        document.getElementById('lawyer-credentials').innerHTML = `<div>${info.credentials}</div>`;
        
        lawyerModal.classList.add('active');
      });
    });
    
    closeLawyerBtn.addEventListener('click', ()=>{
      lawyerModal.classList.remove('active');
    });
    
    lawyerModal.addEventListener('click', (e)=>{
      if(e.target === lawyerModal){
        lawyerModal.classList.remove('active');
      }
    });
  }

});

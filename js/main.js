// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // Global Preloader Removal (for pages without animation.js)
  const preloader = document.getElementById('preloader');
  if (preloader && !document.getElementById('heroCanvas')) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 800);
      }, 1500); // 1.5s for brand visibility
    });
    // Fallback
    setTimeout(() => {
      if (!preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 800);
      }
    }, 2500);
  }

  // 1. NAVBAR SCROLL BEHAVIOR
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // 2. HAMBURGER MOBILE MENU
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  // 3. SCROLL ANIMATIONS (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger if within same parent grid
        setTimeout(() => {
          entry.target.classList.add('active');
        }, (index % 4) * 100);
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. TESTIMONIALS CAROUSEL
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  if (slides.length > 0 && dots.length > 0) {
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    };

    slideInterval = setInterval(nextSlide, 4000);

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(index);
        slideInterval = setInterval(nextSlide, 4000);
      });
    });
  }

  // 5. PRODUCTS PAGE FILTER - Now handled by separate pages (carpets-rugs.html, cushions.html, etc.)
  // Filter buttons are now <a> links that navigate to the relevant page.

  // 6. STICKY ACTIVE NAV LINK
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
      
      // Highlight the parent dropdown-toggle if this link is inside a dropdown
      const dropdownContent = link.closest('.dropdown-content');
      if (dropdownContent) {
        const toggle = dropdownContent.parentElement.querySelector('.dropdown-toggle');
        if (toggle) {
          toggle.classList.add('active');
        }
      }
    }
  });

  // 7. LOGO CLICK PRELOADER
  const logos = document.querySelectorAll('.logo');
  logos.forEach(logo => {
    logo.addEventListener('click', (e) => {
      const href = logo.getAttribute('href');
      if (href && href !== '#' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (preloader) {
          preloader.classList.remove('fade-out');
          preloader.style.display = 'flex';
          preloader.style.opacity = '1';
          preloader.style.visibility = 'visible';
          setTimeout(() => {
            window.location.href = href;
          }, 600);
        } else {
          window.location.href = href;
        }
      }
    });
  });

  // 8. SMOOTH SCROLL (For anchor links)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // close mobile menu if open
        if (menuToggle && menuToggle.classList.contains('open')) {
           menuToggle.click();
        }
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 8. CONTACT FORM VALIDATION
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      
      const inputs = contactForm.querySelectorAll('.form-control[required]');
      inputs.forEach(input => {
        const group = input.closest('.form-group');
        const pattern = input.getAttribute('pattern');
        const value = input.value.trim();
        
        if (!value) {
          isValid = false;
          group.classList.add('has-error');
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
           isValid = false;
           group.classList.add('has-error');
           group.querySelector('.error-msg').textContent = "Please enter a valid email address";
        } else {
          group.classList.remove('has-error');
        }
        
        input.addEventListener('input', () => group.classList.remove('has-error'), {once:true});
      });

      if (isValid) {
        // Formspree API call
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        const formData = new FormData(contactForm);

        fetch(contactForm.action, {
          method: contactForm.method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            document.getElementById('successMsg').classList.add('show');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            setTimeout(() => {
              document.getElementById('successMsg').classList.remove('show');
            }, 5000);
          } else {
            response.json().then(data => {
              if (Object.hasOwn(data, 'errors')) {
                alert(data["errors"].map(error => error["message"]).join(", "));
              } else {
                alert("Oops! There was a problem submitting your form");
              }
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            });
          }
        })
        .catch(error => {
          alert("Oops! There was a problem submitting your form");
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
      }
    });
  }

  // 9. HORIZONTAL SCROLL CAROUSEL
  const horizontalTrack = document.getElementById('horizontalTrack');
  const featuredCategories = document.getElementById('featuredCategories');

  if (horizontalTrack && featuredCategories && window.gsap && window.ScrollTrigger) {
    const cards = gsap.utils.toArray('.slide-card');
    
    // Set initial un-focused state
    gsap.set(cards, { scale: 0.95, opacity: 0.8, filter: "none" });
    
    let getScrollAmount = () => horizontalTrack.scrollWidth - window.innerWidth;

    const tween = gsap.to(horizontalTrack, {
      x: () => -getScrollAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: featuredCategories,
        start: "center center",
        end: () => "+=" + getScrollAmount(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    cards.forEach((card, index) => {
      // Scale up when coming to center
      gsap.to(card, {
        scale: 1,
        opacity: 1,
        filter: "none",
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: "center 75%", 
          end: "center 50%",
          scrub: true,
        }
      });
      
      // Scale down when leaving center
      gsap.to(card, {
        scale: 0.95,
        opacity: 0.8,
        filter: "none",
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: "center 50%", 
          end: "center 25%",
          scrub: true,
        }
      });
      
      // Toggle class for content reveal
      ScrollTrigger.create({
        trigger: card,
        containerAnimation: tween,
        start: "center 65%",
        end: "center 35%",
        toggleClass: "focused"
      });
    });
  }

  // 10. PRODUCT EXPLORE SELECTOR MODAL
  const exploreProductsBtn = document.getElementById('exploreProductsBtn');
  const productModal = document.getElementById('productModal');
  const closeProductModal = document.getElementById('closeProductModal');

  if (exploreProductsBtn && productModal) {
    exploreProductsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      productModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Animate with GSAP if available
      if (window.gsap) {
        gsap.fromTo('.product-modal-container',
          { scale: 0.95, y: 30, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
        gsap.fromTo('.product-modal-header > *',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
        gsap.fromTo('.product-modal-card',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        );
      }
    });
  }

  if (productModal && closeProductModal) {
    const closeModal = () => {
      if (window.gsap) {
        gsap.to('.product-modal-container', {
          scale: 0.95,
          y: 20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      } else {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    closeProductModal.addEventListener('click', closeModal);

    // Close on clicking outside the modal container
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeModal();
      }
    });

    // Close on Esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && productModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

});

// Add simple fadeIn keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

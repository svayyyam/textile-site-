/**
 * GSAP ScrollTrigger Sequence Animation 
 * Frames 77 to 300 mapped to body scroll
 * Optimized Two-Stage Background Preloading Pipeline
 */

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("heroCanvas");
const context = canvas.getContext("2d");

// Constants
const startFrame = 77;
const endFrame = 300;
const totalFramesCount = endFrame - startFrame + 1; // 224 frames
const images = [];
const imageSequence = {
  frame: 0
};

console.log(`Animation script initializing... Target Range: ${startFrame} - ${endFrame}`);

// State
let isAnimationReady = false;

// Preloader elements
const preloader = document.getElementById("preloader");
const preloaderText = document.getElementById("preloader-text");

// Resize canvas dynamically
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if(isAnimationReady) {
    render();
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial Setup

// Preload Images using two-stage pipeline
function preloadImages() {
  console.log(`Setting up image placeholders for ${totalFramesCount} frames...`);
  
  // 1. Initialize image placeholders
  for (let i = startFrame; i <= endFrame; i++) {
    const img = new Image();
    img.isLoaded = false;
    images.push(img);
  }

  // 2. Load the first batch (15 frames) aggressively to show the page instantly
  const initialBatchCount = Math.min(15, totalFramesCount);
  let loadedInitialCount = 0;

  console.log(`Aggressively preloading first ${initialBatchCount} critical frames...`);

  for (let i = 0; i < initialBatchCount; i++) {
    const frameNum = startFrame + i;
    const frameIndex = frameNum.toString().padStart(3, '0');
    const img = images[i];

    img.onload = () => {
      img.isLoaded = true;
      loadedInitialCount++;
      checkInitialBatch();
    };

    img.onerror = () => {
      img.isError = true;
      img.isLoaded = true;
      loadedInitialCount++;
      console.error(`FAILED to load critical frame: ezgif-frame-${frameIndex}.jpg`);
      checkInitialBatch();
    };

    img.src = `assets/animation/ezgif-frame-${frameIndex}.jpg`;
  }

  function checkInitialBatch() {
    if (loadedInitialCount === initialBatchCount && !isAnimationReady) {
      console.log("Critical batch loaded! Fading out preloader immediately.");
      isAnimationReady = true;

      // Remove preloader instantly for an extremely fast First Contentful Paint (FCP)
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 600);
      }

      // Render first frame immediately
      render();

      // Init GSAP ScrollTrigger
      initScrollTrigger();

      // Load remaining frames sequentially in background (doesn't block network or UI thread)
      loadRemainingFrames();
    }
  }

  // 3. Load remaining frames sequentially in the background
  function loadRemainingFrames() {
    let currentIndex = initialBatchCount;

    function loadNext() {
      if (currentIndex >= totalFramesCount) {
        console.log("All background frames loaded successfully!");
        return;
      }

      const frameNum = startFrame + currentIndex;
      const frameIndex = frameNum.toString().padStart(3, '0');
      const img = images[currentIndex];

      img.onload = () => {
        img.isLoaded = true;
        currentIndex++;
        // Use requestAnimationFrame to yield control back to the browser for butter-smooth rendering
        requestAnimationFrame(loadNext);
      };

      img.onerror = () => {
        img.isError = true;
        img.isLoaded = true;
        currentIndex++;
        requestAnimationFrame(loadNext);
      };

      img.src = `assets/animation/ezgif-frame-${frameIndex}.jpg`;
    }

    // Start background queue loading
    loadNext();
  }
}

// Initial image preload kick-off
preloadImages();


// Render function with 'Object-Fit: Cover' and smart nearest-frame fallback
function render() {
  const targetFrame = imageSequence.frame;
  let img = images[targetFrame];
  
  if (!img) return;

  // Fallback: If target frame is not loaded yet, render the closest loaded frame!
  if (!img.isLoaded) {
    let found = false;
    
    // 1. Search backwards for nearest loaded frame
    for (let i = targetFrame - 1; i >= 0; i--) {
      if (images[i] && images[i].isLoaded) {
        img = images[i];
        found = true;
        break;
      }
    }
    
    // 2. Search forwards if backward search yielded nothing
    if (!found) {
      for (let i = targetFrame + 1; i < totalFramesCount; i++) {
        if (images[i] && images[i].isLoaded) {
          img = images[i];
          found = true;
          break;
        }
      }
    }
  }

  // Render context
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Render error placeholder
  if (img.isError) {
    context.fillStyle = "#EADCCB";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(47, 42, 38, 0.2)";
    context.font = "italic 24px 'DM Sans', sans-serif";
    context.textAlign = "center";
    const actualFrameNum = startFrame + targetFrame;
    context.fillText(`[Missing Asset] assets/animation/ezgif-frame-${actualFrameNum.toString().padStart(3, '0')}.jpg`, canvas.width / 2, canvas.height / 2);
    return;
  }

  // Cover calculation (object-fit: cover for <canvas>)
  const canvasAspect = canvas.width / canvas.height;
  const imageAspect = img.width / img.height;
  
  let renderWidth, renderHeight, renderX, renderY;

  if (canvasAspect > imageAspect) {
    renderWidth = canvas.width;
    renderHeight = canvas.width / imageAspect;
    renderX = 0;
    renderY = (canvas.height - renderHeight) / 2;
  } else {
    renderWidth = canvas.height * imageAspect;
    renderHeight = canvas.height;
    renderX = (canvas.width - renderWidth) / 2;
    renderY = 0;
  }

  context.drawImage(img, renderX, renderY, renderWidth, renderHeight);
}


function initScrollTrigger() {
  console.log("Initializing ScrollTrigger for 77-300 range...");
  
  gsap.to(imageSequence, {
    frame: totalFramesCount - 1,
    snap: { frame: 1 },
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5
    },
    onUpdate: render
  });
}

/**
 * GSAP ScrollTrigger Sequence Animation 
 * Frames 77 to 300 mapped to body scroll
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
let loadedFrames = 0;
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

// Preload Images
function preloadImages() {
  console.log(`Starting image preload for ${totalFramesCount} frames (from ${startFrame})...`);
  
  for (let i = startFrame; i <= endFrame; i++) {
    const img = new Image();
    
    // Create zero-padded frame number: 077, 078, ... 300
    const frameIndex = i.toString().padStart(3, '0');
    // We request the real image path
    img.src = `assets/animation/ezgif-frame-${frameIndex}.jpg`;

    img.onload = () => {
      loadedFrames++;
      checkIfReady();
    };

    // Error handling
    img.onerror = () => {
      loadedFrames++;
      console.error(`FAILED to load asset: assets/animation/ezgif-frame-${frameIndex}.jpg`);
      img.isError = true;
      checkIfReady();
    };

    images.push(img);
  }
}

// Check if all targeted frames loaded
function checkIfReady() {
  if (loadedFrames === totalFramesCount && !isAnimationReady) {
    console.log("Specified sequence range loaded successfully.");
    isAnimationReady = true;

    // Remove preloader
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 1200);
      }, 3000); // Increased to 3s for better brand visibility
    }

    // Render first frame immediately
    render();

    // Init GSAP
    initScrollTrigger();
  }
}

// Initial image preload kick-off
preloadImages();


// Render function with 'Object-Fit: Cover' logic
function render() {
  const img = images[imageSequence.frame];
  
  if (!img) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Error placeholder
  if (img.isError) {
    context.fillStyle = "#EADCCB";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(47, 42, 38, 0.2)";
    context.font = "italic 24px 'DM Sans', sans-serif";
    context.textAlign = "center";
    const actualFrameNum = startFrame + imageSequence.frame;
    context.fillText(`[Missing Asset] assets/animation/ezgif-frame-${actualFrameNum.toString().padStart(3, '0')}.jpg`, canvas.width / 2, canvas.height / 2);
    return;
  }

  // Cover calculation
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

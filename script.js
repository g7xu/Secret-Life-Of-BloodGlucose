document.addEventListener("DOMContentLoaded", function() {
  gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

 
  let $path = document.querySelector(".mat"),

  $logo = document.querySelector(".bowl"),
  $fork = document.querySelector(".fork"),
  $knife = document.querySelector(".knife");

  let tl = gsap.timeline({ repeat: 0, repeatDelay: 0.5 });
const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

// Set initial positions (move fork left and knife right)
gsap.set($fork, { x: "-100%" });
gsap.set($knife, { x: "100%" });

tl.to($path, { duration: 0.8, attr: { d: start }, ease: "power2.in" })
  .to($path, { duration: 0.4, attr: { d: end }, ease: "power2.out" })
  .from($logo, { duration: 0.8, y: 75 }, "-=0.8") 
  .to([$fork, $knife], { duration: 0.8, x: 0 }, "-=0.3"); // Move fork & knife to center

// Starts the animation
tl.play();
});



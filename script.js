document.addEventListener("DOMContentLoaded", function() {
  gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

  /* Main navigation */
  let panelsSection = document.querySelector("#panels"),
    panelsContainer = document.querySelector("#panels-container"),
    tween;
  document.querySelectorAll(".anchor").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      let targetElem = document.querySelector(e.target.getAttribute("href")),
        y = targetElem;
      if (targetElem && panelsContainer.isSameNode(targetElem.parentElement)) {
        let totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start,
          totalMovement = (panels.length - 1) * targetElem.offsetWidth;
        y = Math.round(tween.scrollTrigger.start + (targetElem.offsetLeft / totalMovement) * totalScroll);
      }
      gsap.to(window, {
        scrollTo: {
          y: y,
          autoKill: false
        },
        duration: 1
      });
    });
  });
  
  /* Panels */
  const panels = gsap.utils.toArray("#panels-container .panel");
  tween = gsap.to(panels, {
    xPercent: -100 * ( panels.length - 1 ),
    ease: "none",
    scrollTrigger: {
      trigger: "#panels-container",
      pin: true,
      start: "top top",
      scrub: 1,
      snap: {
        snapTo: 1 / (panels.length - 1),
        inertia: true,
        duration: {min: 0.1, max: 0.1}
      },
      end: () =>  "+=" + (panelsContainer.offsetWidth - innerWidth)
    }
  });

  let $path = document.querySelector(".mat"),
    $logo = document.querySelector(".bowl"),
    $fork = document.querySelector(".fork"),
    $knife = document.querySelector(".knife");

let tl = gsap.timeline({ repeat: 1, repeatDelay: 0.5 }); 

const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

tl.to($path, { duration: 0.8, attr: { d: start }, ease: "power2.in" })
  .to($path, { duration: 0.4, attr: { d: end }, ease: "power2.out" })
  .from($logo, { duration: 0.8, y: 75 }, "-=0.8")  // ✅ Moves bowl first
  .from([$fork, $knife], { duration: 0.8, y: 75, stagger: 0 }, "-=0.3"); 

// Start animation
tl.play();

});
document.addEventListener("DOMContentLoaded", function() {
  gsap.registerPlugin(ScrollToPlugin, Observer, ScrollTrigger);

 
  let $path = document.querySelector(".mat"),
  $plate = document.querySelector(".plate"),
  $fork = document.querySelector(".fork"),
  $knife = document.querySelector(".knife"),
  introSection = document.querySelector("#intro");

  function playAnimation() {
    let tl = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
    const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

    // Set initial positions (move fork left and knife right)
    
    gsap.set($fork, { x: "-100%", opacity: 0 });
    gsap.set($knife, { x: "100%", opacity: 0 });

    tl.to($path, { duration: 0.8, attr: { d: start }, ease: "power2.in" })
      .to($path, { duration: 0.4, attr: { d: end }, ease: "power2.out" })
      .from($plate, { duration: 0.8, y: 75, opacity: 1 }, "-=0.8") 
      .to([$fork, $knife], { duration: 0.8, x: 0, opacity: 1 }, "-=0.3");

    tl.play();
}

window.onload = playAnimation;

ScrollTrigger.create({
  trigger: introSection,
  start: "top 50%",  
  onEnterBack: () => {
    playAnimation();
  },
});


gsap.to('progress', {
  value: 100,
  ease: 'none',
  scrollTrigger: { scrub: 0.3 }
});


let sections = gsap.utils.toArray("section");

sections.forEach((section) => {
    gsap.set(section, { opacity: 0 }); // Start all sections as invisible

    ScrollTrigger.create({
        trigger: section,
        start: "top 80%", // When section is 80% into the viewport, start fading in
        end: "top 30%", // Fully faded in when section reaches 30% of viewport
        scrub: true, // Smooth transition
        onEnter: () => {
            gsap.to(section, { opacity: 1, duration: 0.8, ease: "power2.out" });
        },
    });
});

let section = document.getElementById('question'),
    title = document.getElementById('title'),
    mark = title.querySelector("span"),
    dot = document.querySelector(".dot");

gsap.set(dot, {
  width: "140vmax", // ensures it fills every part of the screen. 
  height: "140vmax",
  xPercent: -50, // center the dot in the section area
  yPercent: -50,
  top: "50%",
  left: "50%"
});



let tl1 = gsap.timeline({
		scrollTrigger: {
			trigger: section,
			start: "top top",
			end: "bottom top",
			scrub: 1.5, 
			pin: section,
			pinSpacing: true,
      invalidateOnRefresh: true,
		},	
		defaults: { ease: "none" }
	});

tl1
  .to(title, { opacity: 1 })
  .fromTo(dot, {
      scale: 0,
      x: () => {
        let markBounds = mark.getBoundingClientRect(),
            px = markBounds.left + markBounds.width * 0.40; // dot is about 54% from the left of the bounds of the character
        return px - section.getBoundingClientRect().width / 2;
      },
      y: () => {
         let markBounds = mark.getBoundingClientRect(),
            py = markBounds.top + markBounds.height * 0.73; // dot is about 73% from the top of the bounds of the character
        return py - section.getBoundingClientRect().height / 2;
      }
   }, { 
    x: 0,
    y: 0,
    ease: "power3.in",
    scale: 1
});

});
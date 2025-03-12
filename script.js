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

let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        snap: {
            snapTo: (progress) => {
                let sectionOffsets = sections.map((section) => section.offsetTop / document.body.scrollHeight);
                return sectionOffsets.reduce((prev, curr) => 
                    Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
                );
            },
            duration: 0.5,
            ease: "power1.inOut"
        }
    }
});

// Make sure only one section is visible at a time
sections.forEach((section, index) => {
    ScrollTrigger.create({
        trigger: section,
        start: "top 10%", // Change this depending on when you want the fade to happen
        end: "bottom 70%",
        onEnter: () => {
            gsap.to(sections, { opacity: 0, duration: 0.5 }); // Hide all sections
            gsap.to(section, { opacity: 1, duration: 0.5 }); // Show only current section
        },
        onLeaveBack: () => {
            gsap.to(sections, { opacity: 0, duration: 0.5 });
            gsap.to(section, { opacity: 1, duration: 0.5 });
        }
    });
});
});





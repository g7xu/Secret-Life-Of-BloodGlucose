document.addEventListener("DOMContentLoaded", function() {
  gsap.registerPlugin(ScrollToPlugin, Observer, ScrollTrigger);

 
  let $path = document.querySelector(".mat"),
  $plate = document.querySelector(".plate"),
  $fork = document.querySelector(".fork"),
  $knife = document.querySelector(".knife"),
  homeButton = document.querySelector("#home"),
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

if (homeButton) {
    homeButton.addEventListener("click", function (e) {
        playAnimation();
    });
}

ScrollTrigger.create({
  trigger: introSection,
  start: "top 70%",  // Animation runs when the intro section is halfway visible
  onEnterBack: () => {
    playAnimation();
  },
});



gsap.to('progress', {
  value: 100,
  ease: 'none',
  scrollTrigger: { scrub: 0.3 }
});

let sections = gsap.utils.toArray("section:not(#intro)");
sections.forEach((section) => {
  ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => section.classList.add("section-visible"),
      onLeaveBack: () => section.classList.remove("section-visible"),
  });
});


gsap.to(sections, {
  scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      snap: {
          snapTo: (progress, self) => {
              let snapPoints = sections.map(section => section.offsetTop / document.body.scrollHeight);
              let closest = snapPoints.reduce((prev, curr) =>
                  Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
              );
              return closest;
          },
          duration: 0.5,
          ease: "power1.inOut",
      },
      scrub: 1
  }
});


});





(function () {
  const once = true;
  if (!window.__inViewIO) {
    window.__inViewIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          if (once) window.__inViewIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  }
  window.initInViewAnimations = function (selector = ".animate-on-scroll") {
    document.querySelectorAll(selector).forEach((el) => {
      window.__inViewIO.observe(el);
    });
  };
  document.addEventListener("DOMContentLoaded", () => initInViewAnimations());
})();

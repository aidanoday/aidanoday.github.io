// Make SVG accessible but not keyboard-focusable
document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById("peekaboo");
  if (nav) {
    var svg = nav.querySelector("svg");
    if (svg) {
      // Don't add tabindex so SVG is not in tab order
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Home logo");
    }

    // Ensure nav links are always in tab order even when nav is hidden
    var links = nav.querySelectorAll("a");
    links.forEach(function(link, index) {
      // Give explicit tabindex to ensure nav links come first
      link.setAttribute("tabindex", index + 1);

      // Show nav when any link receives focus
      link.addEventListener("focus", function() {
        nav.style.top = "0";
      });
    });
  }
});

// Scroll-based show/hide behavior
var prevScrollpos = window.pageYOffset;

window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  var nav = document.getElementById("peekaboo");

  // Don't hide nav when an element inside has focus
  if (nav && !nav.matches(':focus-within')) {
    if (prevScrollpos > currentScrollPos) {
      nav.style.top = "0";
    } else {
      nav.style.top = "-100px";
    }
  }
  prevScrollpos = currentScrollPos;
}
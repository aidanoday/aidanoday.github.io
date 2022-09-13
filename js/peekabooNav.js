
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("peekaboo").style.top = "0";
  } else {
    document.getElementById("peekaboo").style.top = "-75px";
  }
  prevScrollpos = currentScrollPos;
}
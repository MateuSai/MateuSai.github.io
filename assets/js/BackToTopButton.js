var backToTopButton = document.getElementById("backToTopButton");

function scrollUp() {
    window.scroll({
        top: 0, behavior: 'smooth'
    });
    console.log("hi");
}

function checkScroll() {
    if (window.scrollY >= 100) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
}
window.addEventListener("scroll", checkScroll);
window.addEventListener("resize", checkScroll);
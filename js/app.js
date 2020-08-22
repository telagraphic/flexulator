let tabs = document.querySelectorAll(".formula__tabs-button");
let sections = document.querySelectorAll(".formula__tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", e => {
    e.preventDefault();
    removeActiveTab();
    addActiveTab(tab);
  });
})

const removeActiveTab = () => {
  tabs.forEach(tab => {
    tab.classList.remove("is-active");
  });
  sections.forEach(section => {
    section.classList.remove("is-active");
  });
}

const addActiveTab = tab => {
  tab.classList.add("is-active");
  let id = tab.getAttribute("data-id");
  id = `#${id}`;
  const matchingSection = document.querySelector(id);
  matchingSection.classList.add("is-active");
}

if (window.innerWidth >= 688) {
  gsap.timeline({
      repeat: -1,
      repeatDelay: 1
    })
    .from('.grow-animation__item', {
      width: '7rem',
      duration: 2,
      delay: 1,
      ease: 'slow'
    })
    .to('.grow-animation__item', {
      width: '33.33%',
      duration: 2,
      ease: 'slow'
    });
} else {
  gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    })
    .from('.grow-animation__item', {
      width: '3rem',
      duration: 2,
      delay: 1,
      ease: 'slow'
    })
    .to('.grow-animation__item', {
      width: '33.33%',
      duration: 2,
      ease: 'slow'
    });
}

gsap.timeline({
    repeat: -1,
    repeatDelay: 2
  })
  .to('.shrink-animation__item', {
    width: '37.33%',
    duration: 2,
    ease: 'slow'
  })
  .to('.shrink-animation__item', {
    width: '30.66%',
    duration: 2,
    delay: 1,
    ease: 'slow'
  });

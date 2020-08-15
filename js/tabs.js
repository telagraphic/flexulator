const tabs = document.querySelectorAll(".formula__tabs-button");
const sections = document.querySelectorAll(".formula__tab-content");

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
  console.log(matchingSection);
  matchingSection.classList.add("is-active");
}

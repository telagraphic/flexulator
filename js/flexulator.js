import newFlexItemObject from './flexItem.js';

let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);
let selectClassName = e => document.getElementsByClassName(e);

const flexulator = {
  elements: {
    container: null,
    flexItems: null,
    dashboard: null
  },
  flexValues: {
    width: 0,
    flexBasisTotal: 0,
    remainingSpace: 0
  },
  flexItems: [],

  initialize: function(container) {
    flexulator.elements.container = select(container);
    flexulator.elements.dashboard = select('.flexulator__dashboard');
    flexulator.updateWidth();
    flexulator.updateFlexItems();
    flexulator.updateFlexTotalBasis();
    flexulator.updateRemainingSpace();
    flexulator.updateContainer();
    flexulator.createFlexItems();
    flexulator.updateFlexItemsValues();
    flexulator.updateResize();
  },
  updateWidth: function () {
    flexulator.flexValues.width = flexulator.elements.container.clientWidth;
  },
  updateFlexItems: function () {
    flexulator.elements.flexItems = [...flexulator.elements.container.querySelectorAll('.flex-item')];
  },
  updateFlexTotalBasis: function () {
    let flexBasisTotal = flexulator.elements.flexItems.reduce((basisSum, flexItem) => {
      return basisSum + parseInt(flexItem.style.flexBasis);
    }, 0);

    flexulator.flexValues.flexBasisTotal = flexBasisTotal;
  },
  updateRemainingSpace: function() {
    flexulator.flexValues.remainingSpace = flexulator.flexValues.width - flexulator.flexValues.flexBasisTotal;
  },
  updateContainer: function() {
    let width = flexulator.elements.dashboard.querySelector('.dashboard__container-width');
    let flexBasisTotal = flexulator.elements.dashboard.querySelector('.dashboard__total-flex-basis');
    let remainingSpace = flexulator.elements.dashboard.querySelector('.dashboard__flex-remaining-space');

    width.textContent = flexulator.flexValues.width;
    flexBasisTotal.textContent = flexulator.flexValues.flexBasisTotal;
    remainingSpace.textContent = flexulator.flexValues.remainingSpace;
  },
  createFlexItems: function() {
    flexulator.elements.flexItems.forEach(item => {
      let [...flexStyles] = [item.style.flexGrow, item.style.flexShrink, item.style.flexBasis.replace('px', '')];
      let newFlexItem = flexulator.newFlexItem();
      newFlexItem.initialize(item);
      newFlexItem.updateItemStyles(flexStyles);
      newFlexItem.updateItemForm(item.clientWidth, flexStyles);
      flexulator.flexItems.push(newFlexItem);
    })

    console.log(flexulator.flexItems);
  },
  newFlexItem: function () {
    return newFlexItemObject();
  },
  updateFlexItemsValues: function () {
    flexulator.flexItems.forEach(item => {
      item.updateItemFlexulations({
        width: flexulator.flexValues.width,
        flexBasisTotal: flexulator.flexValues.flexBasisTotal,
        remainingSpace: flexulator.flexValues.remainingSpace
      },
      {}
      );
    });

    flexulator.flexItems.forEach(item => {
      item.writeItemFlexulations();
    });
  },
  updateResize: function() {
    window.addEventListener('resize', function(event) {
      flexulator.updateWidth();
      flexulator.updateRemainingSpace();
      flexulator.updateContainer();
      flexulator.updateFlexItemsValues();
    })
  }
}


flexulator.initialize('.flexulator__items-container');
console.log(flexulator);

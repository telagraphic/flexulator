export let select = e => document.querySelector(e);
export let selectAll = e => document.querySelectorAll(e);
export let selectClassName = e => document.getElementsByClassName(e);


// let flexItem = {
//   style: {
//     grow: 0,
//     shrink: 0,
//     flexBasis: 0
//   },
//   form: {
//     width: 0,
//     grow: 0,
//     shrink: 0,
//     flexBasis: 0
//   },
//   elements: { // reference the DOM elements
//     self: null,
//     form: {
//       width: null,
//       grow: null,
//       shrink: null,
//       flexBasis: null
//     },
//     flexulations: {
//       container: {
//         width: null,
//         flexBasisTotal: null,
//         remainingSpace: null,
//       },
//       grow: {},
//       shrink: {}
//     }
//   },
//   selectors: {
//     form: {
//       width: null,
//       grow: null,
//       shrink: null,
//       flexBasis: null
//     },
//     flexulations: {
//       container: {
//         width: '.flex-item__flexulations-container-width',
//         flexBasisTotal: '.flex-item__flexulations-total-flex-basis',
//         remainingSpace: '.flex-item__flexulations-grow-remaining-space',
//       },
//       grow: {
//         growValue: '.flex-item__flexulations-grow-value',
//         growTotal: '.flex-item__flexulations-grow-total',
//         growSpace: '.flex-item__flexulations-grow-space',
//         growWith: '.flex-item__flexulations-grow-width',
//         growItemBasis: '.flex-item__flexulations-grow-item-basis',
//         growComputerWidth: '.flex-item__flexulations-grow-item-computed-width'
//       },
//       shrink: {
//         shrinkValue: '.flex-item__flexulations-shrink-value',
//         shrinkItemBasis: '.flex-item__flexulations-shrink-item-basis',
//         shrinkTotalBasis: '.flex-item__flexulations-shrink-total-basis',
//         shrinkQuotient: 'flex-item__flexulations-shrink-quotient',
//         shrinkComputedWidth: 'flex-item__flexulations-shrink-width'
//       }
//     }
//   },
//   flexulations: { // state calculations for read and write
//     container: {
//       width: 0,
//       flexBasisTotal: 0,
//       remainingSpace: 0
//     },
//     grow: {
//       containerWidth: 0,
//       totalBasis: 0,
//       remainingSpace: 0,
//       growItem: 0,
//       growTotal: 0,
//       growSpace: 0,
//       itemBasis: 0,
//       growWidth: 0
//     },
//     shrink: {
//       containerWidth: 0,
//       totalFlexBasis: 0,
//       remainingSpace: 0,
//       shrinkItem: 0,
//       itemBasis: 0,
//       shrinkTotalBasis: 0,
//       shrinkFactor: 0,
//       shrinkWidth: 0
//     }
//   },
//
//   initialize: function (itemElement) {
//     flexItem.elements.self = itemElement;
//     flexItem.getChildrenElements();
//   },
//   updateItemStyles: function (flexStyles) {
//     flexItem.style.grow = flexStyles[0];
//     flexItem.style.shrink = flexStyles[1];
//     flexItem.style.flexBasis = flexStyles[2];
//   },
//   updateItemForm: function(itemWidth, formValues) {
//     flexItem.form.width = itemWidth;
//     flexItem.form.grow = formValues[0];
//     flexItem.form.shrink = formValues[1];
//     flexItem.form.flexBasis = formValues[2];
//   },
//   getChildrenElements: function () {
//     flexItem.elements.flexulations.container.width = flexItem.elements.self.querySelector(flexItem.selectors.flexulations.container.width);
//     flexItem.elements.flexulations.container.flexBasisTotal = flexItem.elements.self.querySelector(flexItem.selectors.flexulations.container.flexBasisTotal);
//     flexItem.elements.flexulations.container.remainingSpace = flexItem.elements.self.querySelector(flexItem.selectors.flexulations.container.remainingSpace);
//   },
//   updateItemFlexulations: function (containerValues, flexValues) {
//     flexItem.flexulations.container.width = containerValues.width;
//     flexItem.flexulations.container.flexBasisTotal = containerValues.flexBasisTotal;
//     flexItem.flexulations.container.remainingSpace = containerValues.remainingSpace;
//   },
//   writeItemFlexulations: function () {
//     flexItem.elements.flexulations.container.width.textContent = flexItem.flexulations.container.width;
//     flexItem.elements.flexulations.container.flexBasisTotal.textContent = flexItem.flexulations.container.flexBasisTotal;
//     flexItem.elements.flexulations.container.remainingSpace.textContent = flexItem.flexulations.container.remainingSpace;
//   }
// }

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
    return {
      style: {
        grow: 0,
        shrink: 0,
        flexBasis: 0
      },
      form: {
        width: 0,
        grow: 0,
        shrink: 0,
        flexBasis: 0
      },
      elements: { // reference the DOM elements
        self: null,
        form: {
          width: null,
          grow: null,
          shrink: null,
          flexBasis: null
        },
        flexulations: {
          container: {
            width: null,
            flexBasisTotal: null,
            remainingSpace: null,
          },
          grow: {},
          shrink: {}
        }
      },
      selectors: {
        form: {
          width: null,
          grow: null,
          shrink: null,
          flexBasis: null
        },
        flexulations: {
          container: {
            width: '.flex-item__flexulations-container-width',
            flexBasisTotal: '.flex-item__flexulations-total-flex-basis',
            remainingSpace: '.flex-item__flexulations-grow-remaining-space',
          },
          grow: {
            growValue: '.flex-item__flexulations-grow-value',
            growTotal: '.flex-item__flexulations-grow-total',
            growSpace: '.flex-item__flexulations-grow-space',
            growWith: '.flex-item__flexulations-grow-width',
            growItemBasis: '.flex-item__flexulations-grow-item-basis',
            growComputerWidth: '.flex-item__flexulations-grow-item-computed-width'
          },
          shrink: {
            shrinkValue: '.flex-item__flexulations-shrink-value',
            shrinkItemBasis: '.flex-item__flexulations-shrink-item-basis',
            shrinkTotalBasis: '.flex-item__flexulations-shrink-total-basis',
            shrinkQuotient: 'flex-item__flexulations-shrink-quotient',
            shrinkComputedWidth: 'flex-item__flexulations-shrink-width'
          }
        }
      },
      flexulations: { // state calculations for read and write
        container: {
          width: 0,
          flexBasisTotal: 0,
          remainingSpace: 0
        },
        grow: {
          containerWidth: 0,
          totalBasis: 0,
          remainingSpace: 0,
          growItem: 0,
          growTotal: 0,
          growSpace: 0,
          itemBasis: 0,
          growWidth: 0
        },
        shrink: {
          containerWidth: 0,
          totalFlexBasis: 0,
          remainingSpace: 0,
          shrinkItem: 0,
          itemBasis: 0,
          shrinkTotalBasis: 0,
          shrinkFactor: 0,
          shrinkWidth: 0
        }
      },

      initialize: function (itemElement) {
        this.elements.self = itemElement;
        this.getChildrenElements();
      },
      updateItemStyles: function (flexStyles) {
        this.style.grow = flexStyles[0];
        this.style.shrink = flexStyles[1];
        this.style.flexBasis = flexStyles[2];
      },
      updateItemForm: function(itemWidth, formValues) {
        this.form.width = itemWidth;
        this.form.grow = formValues[0];
        this.form.shrink = formValues[1];
        this.form.flexBasis = formValues[2];
      },
      getChildrenElements: function () {
        this.elements.flexulations.container.width = this.elements.self.querySelector(this.selectors.flexulations.container.width);
        this.elements.flexulations.container.flexBasisTotal = this.elements.self.querySelector(this.selectors.flexulations.container.flexBasisTotal);
        this.elements.flexulations.container.remainingSpace = this.elements.self.querySelector(this.selectors.flexulations.container.remainingSpace);
      },
      updateItemFlexulations: function (containerValues, flexValues) {
        this.flexulations.container.width = containerValues.width;
        this.flexulations.container.flexBasisTotal = containerValues.flexBasisTotal;
        this.flexulations.container.remainingSpace = containerValues.remainingSpace;
      },
      writeItemFlexulations: function () {
        this.elements.flexulations.container.width.textContent = this.flexulations.container.width;
        this.elements.flexulations.container.flexBasisTotal.textContent = this.flexulations.container.flexBasisTotal;
        this.elements.flexulations.container.remainingSpace.textContent = this.flexulations.container.remainingSpace;
      }
    }
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

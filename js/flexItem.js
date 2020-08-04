export default function newthisObject() {
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
}

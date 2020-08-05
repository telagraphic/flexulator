export default function newFlexItemObject() {
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
        grow: {
          value: null,
          total: null,
          space: null,
          width: null,
          basis: null,
          growWidth: null,
          computedWidth: null
        },
        shrink: {
          value: null,
          basis: null,
          basisTotal: null,
          factor: null,
          computedWidth: null
        }
      }
    },
    selectors: {
      form: {
        width: '.flex-item__width',
        grow: '.flex-item__grow-value',
        shrink: '.flex-item__shrink-value',
        flexBasis: '.flex-item__basis-value'
      },
      flexulations: {
        container: {
          width: '.flex-item__flexulations-container-width',
          flexBasisTotal: '.flex-item__flexulations-total-flex-basis',
          remainingSpace: '.flex-item__flexulations-remaining-space',
        },
        grow: {
          value: '.flex-item__flexulations-grow-value',
          total: '.flex-item__flexulations-grow-total',
          space: '.flex-item__flexulations-grow-space',
          width: '.flex-item__flexulations-grow-width',
          basis: '.flex-item__flexulations-grow-item-basis',
          computedWidth: '.flex-item__flexulations-grow-item-computed-width'
        },
        shrink: {
          value: '.flex-item__flexulations-shrink-value',
          basis: '.flex-item__flexulations-shrink-item-basis',
          basisTotal: '.flex-item__flexulations-shrink-total-basis',
          factor: '.flex-item__flexulations-shrink-quotient',
          computedWidth: '.flex-item__flexulations-shrink-width'
        }
      }
    },
    flexulations: { // state calculations for read and write
      container: {
        width: 0,
        flexBasisTotal: 0,
        remainingSpace: 0
      },
      form: {
        width: 0,
        grow: 0,
        shrink: 0,
        basis: 0
      },
      itemWidth: 0,
      grow: {
        containerWidth: 0,
        totalBasis: 0,
        remainingSpace: 0,
        value: 0,
        total: 0,
        space: 0,
        itemBasis: 0,
        growWidth: 0,
        computedWidth: 0
      },
      shrink: {
        containerWidth: 0,
        totalFlexBasis: 0,
        remainingSpace: 0,
        value: 0,
        itemBasis: 0,
        basisTotal: 0,
        factor: 0,
        computedWidth: 0
      }
    },

    initialize: function (itemElement) {
      this.elements.self = itemElement;
      this.getChildrenElements();
      this.updateFlexItemGrow();
    },
    updateItemStyles: function (flexStyles) {
      this.style.grow = parseFloat(flexStyles[0]);
      this.style.shrink = parseFloat(flexStyles[1]);
      this.style.flexBasis = parseFloat(flexStyles[2]);

      this.flexulations.grow.value = parseFloat(flexStyles[0])
      this.flexulations.shrink.value = parseFloat(flexStyles[1])
      this.flexulations.grow.itemBasis = parseFloat(flexStyles[2])
      this.flexulations.shrink.itemBasis = parseFloat(flexStyles[2])
    },
    updateItemForm: function(itemWidth, formValues) {
      this.form.width = parseFloat(itemWidth);
      this.form.grow = parseFloat(formValues[0]);
      this.form.shrink = parseFloat(formValues[1]);
      this.form.flexBasis = parseFloat(formValues[2]);
    },
    getChildrenElements: function () {
      this.elements.flexulations.container.width = [...this.elements.self.querySelectorAll(this.selectors.flexulations.container.width)];
      this.elements.flexulations.container.flexBasisTotal = [...this.elements.self.querySelectorAll(this.selectors.flexulations.container.flexBasisTotal)];
      this.elements.flexulations.container.remainingSpace = [...this.elements.self.querySelectorAll(this.selectors.flexulations.container.remainingSpace)];

      this.elements.form.width = this.elements.self.querySelector(this.selectors.form.width);
      this.elements.form.grow = this.elements.self.querySelector(this.selectors.form.grow);
      this.elements.form.shrink = this.elements.self.querySelector(this.selectors.form.shrink);
      this.elements.form.flexBasis = this.elements.self.querySelector(this.selectors.form.flexBasis);

      this.elements.flexulations.grow.value = this.elements.self.querySelector(this.selectors.flexulations.grow.value);
      this.elements.flexulations.grow.total = this.elements.self.querySelector(this.selectors.flexulations.grow.total);
      this.elements.flexulations.grow.space = this.elements.self.querySelector(this.selectors.flexulations.grow.space);
      this.elements.flexulations.grow.width = [...this.elements.self.querySelectorAll(this.selectors.flexulations.grow.width)];
      this.elements.flexulations.grow.basis = this.elements.self.querySelector(this.selectors.flexulations.grow.basis);
      this.elements.flexulations.grow.computedWidth = this.elements.self.querySelector(this.selectors.flexulations.grow.computedWidth);

      this.elements.flexulations.shrink.value = this.elements.self.querySelector(this.selectors.flexulations.shrink.value);
      this.elements.flexulations.shrink.basis = this.elements.self.querySelector(this.selectors.flexulations.shrink.basis);
      this.elements.flexulations.shrink.basisTotal = this.elements.self.querySelector(this.selectors.flexulations.shrink.basisTotal);
      this.elements.flexulations.shrink.factor = [...this.elements.self.querySelectorAll(this.selectors.flexulations.shrink.factor)];
      this.elements.flexulations.shrink.computedWidth = this.elements.self.querySelector(this.selectors.flexulations.shrink.computedWidth);
    },
    updateItemFlexulations: function (containerValues, flexValues) {
      this.flexulations.container.width = containerValues.width;
      this.flexulations.container.flexBasisTotal = containerValues.flexBasisTotal;
      this.flexulations.container.remainingSpace = containerValues.remainingSpace;

      this.updateFlexItemGrow();
      this.updatedGrowWidth();
      this.updateItemWidth();
      this.updateShrinkValue();
      this.updateShrinkComputedWidth();
      // this.updateShrinkFactor();
    },
    writeItemFlexulations: function () {
      this.elements.flexulations.container.width.forEach(width => width.textContent = this.flexulations.container.width);
      this.elements.flexulations.container.flexBasisTotal.forEach(flexBasisTotal => flexBasisTotal.textContent = this.flexulations.container.flexBasisTotal);
      this.elements.flexulations.container.remainingSpace.forEach(remainingSpace => remainingSpace.textContent = this.flexulations.container.remainingSpace);

      this.elements.form.width.textContent = this.elements.form.width.clientWidth;

      this.elements.flexulations.grow.value.textContent = this.flexulations.grow.value;
      this.elements.flexulations.grow.total.textContent = this.flexulations.grow.total;


      this.elements.flexulations.grow.width.forEach(width => width.textContent = this.flexulations.grow.growWidth);
      this.elements.flexulations.grow.basis.textContent = this.flexulations.grow.itemBasis;
      this.elements.flexulations.grow.computedWidth.textContent = this.flexulations.itemWidth;
    },
    updateFlexItemGrow: function () {
      this.flexulations.grow.value = this.style.grow;
    },
    updateFlexGrowTotal: function(totalGrow) {
      this.flexulations.grow.total = totalGrow;
    },
    updatedGrowWidth: function() {
      let growWidth = parseFloat((this.flexulations.grow.value / this.flexulations.grow.total), 10) * parseFloat(this.flexulations.container.remainingSpace, 10);
      this.flexulations.grow.growWidth = parseInt(growWidth.toFixed(0));
    },
    updateItemWidth: function () {
      this.flexulations.itemWidth = this.elements.self.clientWidth;
    },
    updateShrinkValue: function () {
      this.elements.flexulations.shrink.value.textContent = this.flexulations.shrink.value;
      this.elements.flexulations.shrink.basis.textContent = this.form.flexBasis;
    },
    returnItemShrinkBasis: function() {
      return this.flexulations.shrink.itemBasis * this.flexulations.shrink.value;
    },
    updateShrinkBasisTotal: function(shrinkBasisTotal) {
      this.flexulations.shrink.basisTotal = shrinkBasisTotal;
      this.elements.flexulations.shrink.basisTotal.textContent = this.flexulations.shrink.basisTotal;
      this.updateShrinkFactor();
      this.updateShrinkComputedWidth();
    },
    updateShrinkFactor: function() {
      let shrinkQuotient = this.flexulations.shrink.itemBasis * this.flexulations.shrink.value;
      this.flexulations.shrink.factor = parseFloat(shrinkQuotient) / parseFloat(this.flexulations.shrink.basisTotal);
      this.elements.flexulations.shrink.factor.forEach(element => element.textContent = this.flexulations.shrink.factor.toFixed(2));
    },
    updateShrinkComputedWidth: function() {
      let shrinkComputedWidth = this.flexulations.shrink.factor.toFixed(2) * this.flexulations.container.remainingSpace;
      this.elements.flexulations.shrink.computedWidth.textContent = shrinkComputedWidth.toFixed(0);
    }

  }
}

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
    elements: {
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
          width: null,
          basis: null,
          growWidth: null,
          computedWidth: null
        },
        shrink: {
          value: null,
          basis: null,
          basisTotal: null,
          valueBasisProduct: null,
          factor: null,
          computedWidth: null,
          computedPositiveWidth: null
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
          width: '.flex-item__flexulations-grow-width',
          basis: '.flex-item__flexulations-grow-item-basis',
          computedWidth: '.flex-item__flexulations-grow-item-computed-width'
        },
        shrink: {
          value: '.flex-item__flexulations-shrink-value',
          basis: '.flex-item__flexulations-shrink-item-basis',
          basisTotal: '.flex-item__flexulations-shrink-total-basis',
          valueBasisTotal: '.flex-item__flexulations-shrink-value-basis-total',
          factor: '.flex-item__flexulations-shrink-quotient',
          computedWidth: '.flex-item__flexulations-shrink-width',
          computedPositiveWidth: '.flex-item__flexulations-shrink-width-postive',
          finalWidth: '.flex-item__flexulations-shrink-final-width'
        }
      }
    },
    flexulations: {
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
        value: 0,
        total: 0,
        itemBasis: 0,
        width: 0,
        computedWidth: 0
      },
      shrink: {
        value: 0,
        itemBasis: 0,
        basisTotal: 0,
        valueBasisTotal: 0,
        factor: 0,
        computedWidth: 0
      }
    },
    initialize: function (flexItem) {
      this.elements.self = flexItem;
      this.getChildrenElements();
      this.updateItemStyles([flexItem.style.flexGrow, flexItem.style.flexShrink, flexItem.style.flexBasis.replace('px', '')]);
      this.updateItemForm(flexItem.clientWidth, [flexItem.style.flexGrow, flexItem.style.flexShrink, flexItem.style.flexBasis.replace('px', '')]);
      this.updateItemShrinkBasis();
      this.updateShrinkBasisTotal();
      this.updateFlexItemGrow();
      this.writeItemFlexulations();
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
    select: function(selector) {
      return this.elements.self.querySelector(selector);
    },
    selectAll: function(selector) {
      return [...this.elements.self.querySelectorAll(selector)];
    },
    getChildrenElements: function () {
      this.elements.flexulations.container.width = this.selectAll(this.selectors.flexulations.container.width);
      this.elements.flexulations.container.flexBasisTotal = this.selectAll(this.selectors.flexulations.container.flexBasisTotal);
      this.elements.flexulations.container.remainingSpace = this.selectAll(this.selectors.flexulations.container.remainingSpace);
      this.elements.form.width = this.select(this.selectors.form.width);
      this.elements.form.grow = this.select(this.selectors.form.grow);
      this.elements.form.shrink = this.select(this.selectors.form.shrink);
      this.elements.form.flexBasis = this.select(this.selectors.form.flexBasis);
      this.elements.flexulations.grow.value = this.select(this.selectors.flexulations.grow.value);
      this.elements.flexulations.grow.total = this.select(this.selectors.flexulations.grow.total);
      this.elements.flexulations.grow.width = this.selectAll(this.selectors.flexulations.grow.width);
      this.elements.flexulations.grow.basis = this.select(this.selectors.flexulations.grow.basis);
      this.elements.flexulations.grow.computedWidth = this.select(this.selectors.flexulations.grow.computedWidth);
      this.elements.flexulations.shrink.value = this.select(this.selectors.flexulations.shrink.value);
      this.elements.flexulations.shrink.basis = this.select(this.selectors.flexulations.shrink.basis);
      this.elements.flexulations.shrink.basisTotal = this.select(this.selectors.flexulations.shrink.basisTotal);
      this.elements.flexulations.shrink.valueBasisTotal = this.selectAll(this.selectors.flexulations.shrink.valueBasisTotal);
      this.elements.flexulations.shrink.factor = this.selectAll(this.selectors.flexulations.shrink.factor);
      this.elements.flexulations.shrink.computedWidth = this.select(this.selectors.flexulations.shrink.computedWidth);
      this.elements.flexulations.shrink.computedPositiveWidth = this.select(this.selectors.flexulations.shrink.computedPositiveWidth);
      this.elements.flexulations.shrink.finalWidth = this.select(this.selectors.flexulations.shrink.finalWidth);
    },
    updateItemContainerFlexulations: function (containerValues) {
      this.flexulations.container.width = containerValues.width;
      this.flexulations.container.flexBasisTotal = containerValues.flexBasisTotal;
      this.flexulations.container.remainingSpace = containerValues.remainingSpace;

      this.updateFlexItemGrow();
      this.updatedGrowWidth();
      this.updateItemWidth();
      this.updateShrinkComputedWidth();
    },
    writeItemFlexulations: function () {
      this.elements.flexulations.container.width.forEach(width => width.textContent = this.flexulations.container.width);
      this.elements.flexulations.container.flexBasisTotal.forEach(flexBasisTotal => flexBasisTotal.textContent = this.flexulations.container.flexBasisTotal);
      this.elements.flexulations.container.remainingSpace.forEach(remainingSpace => remainingSpace.textContent = this.flexulations.container.remainingSpace);
      this.elements.form.width.textContent = this.elements.form.width.clientWidth;
      this.elements.form.flexBasis.textContent = this.flexulations.form.basis;
      this.elements.flexulations.grow.value.textContent = this.flexulations.grow.value;
      this.elements.flexulations.grow.total.textContent = this.flexulations.grow.total;
      this.elements.flexulations.grow.width.forEach(width => width.textContent = this.flexulations.grow.width);
      this.elements.flexulations.grow.basis.textContent = this.flexulations.grow.itemBasis;
      this.elements.flexulations.grow.computedWidth.textContent = this.flexulations.itemWidth;
      this.elements.flexulations.shrink.value.textContent = this.flexulations.shrink.value;
      this.elements.flexulations.shrink.basis.textContent = this.flexulations.shrink.itemBasis;
      this.elements.flexulations.shrink.basisTotal.textContent = this.flexulations.shrink.basisTotal;
      this.elements.flexulations.shrink.valueBasisTotal.forEach(element => element.textContent = this.flexulations.shrink.valueBasisTotal);
      this.elements.flexulations.shrink.factor.forEach(element => element.textContent = this.flexulations.shrink.factor.toFixed(6));
      this.elements.flexulations.shrink.computedWidth.textContent = this.flexulations.shrink.computedWidth;
      this.elements.flexulations.shrink.computedPositiveWidth.textContent = this.flexulations.shrink.computedWidth.replace('-', '');
      this.elements.flexulations.shrink.finalWidth.textContent = this.elements.form.width.clientWidth;
    },
    updateFlexItemGrow: function () {
      this.flexulations.grow.value = this.style.grow;
    },
    updateFlexGrowTotal: function(totalGrow) {
      this.flexulations.grow.total = totalGrow;
      this.writeItemFlexulations();
    },
    updatedGrowWidth: function() {
      let growWidth = parseFloat((this.flexulations.grow.value / this.flexulations.grow.total), 10) * parseFloat(this.flexulations.container.remainingSpace, 10);
      this.flexulations.grow.width = parseInt(growWidth.toFixed(0));
    },
    updateItemWidth: function () {
      this.flexulations.itemWidth = this.elements.self.clientWidth;
    },
    updateItemShrinkBasis: function() {
      this.flexulations.shrink.valueBasisTotal = this.flexulations.shrink.value * this.flexulations.shrink.itemBasis;
    },
    returnItemShrinkBasis: function() {
      return this.flexulations.shrink.valueBasisTotal;
    },
    updateShrinkBasisTotal: function(shrinkBasisTotal) {
      this.flexulations.shrink.basisTotal = shrinkBasisTotal;
      this.elements.flexulations.shrink.basisTotal.textContent = shrinkBasisTotal;
      this.updateShrinkFactor();
      this.updateShrinkComputedWidth();
      this.writeItemFlexulations();
    },
    updateShrinkFactor: function() {
      let shrinkQuotient = parseFloat(this.flexulations.shrink.itemBasis) * parseFloat(this.flexulations.shrink.value);
      this.flexulations.shrink.factor = parseFloat(shrinkQuotient) / parseFloat(this.flexulations.shrink.basisTotal);
    },
    updateShrinkComputedWidth: function() {
      let shrinkComputedWidth = this.flexulations.shrink.factor.toFixed(6) * this.flexulations.container.remainingSpace;
      this.flexulations.shrink.computedWidth = shrinkComputedWidth.toFixed(0);
    },
    updateClientWidth: function() {
      this.elements.self.clientWidth;
      this.flexulations.grow.computedWidth = this.elements.self.clientWidth;
    },
    updateForm: function(property) {
      if (property === "grow") {
        let newGrowValue = parseFloat(this.elements.form.grow.value);
        this.form.grow = newGrowValue;
        this.style.grow = newGrowValue;
        this.flexulations.form.grow = newGrowValue;
        this.flexulations.grow.value = newGrowValue;
        this.elements.self.style.flexGrow = newGrowValue;
      } else if (property === "shrink") {
        let newShrinkValue = parseFloat(this.elements.form.shrink.value);
        this.form.shrink = newShrinkValue;
        this.style.shrink = newShrinkValue;
        this.flexulations.form.shrink = newShrinkValue;
        this.flexulations.shrink.value = newShrinkValue;
        this.elements.self.style.flexShrink = newShrinkValue;
        this.updateItemShrinkBasis();
      } else if (property === "basis") {
        let newBasisValue = parseFloat(this.elements.form.flexBasis.value);
        this.form.flexBasis = newBasisValue;
        this.style.flexBasis = newBasisValue;
        this.flexulations.form.flexBasis = newBasisValue;
        this.flexulations.grow.itemBasis = newBasisValue;
        this.flexulations.shrink.itemBasis = newBasisValue;
        this.elements.self.style.flexBasis = `${newBasisValue}px`;
        this.updateItemShrinkBasis();
      }
    }
  }
}

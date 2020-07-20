let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);
let selectClassName = e => document.getElementsByClassName();

const flexContainer = {
  container:0,
  totalFlexBasis:0,
  remainingSpace:0
}

const flexulations = {
  totalFlexBasis:0,
  remainingSpace:0,
  growFactor:0,
  shrinkFactor: 0,
}

const flexItem = {
  properties: {
    width: 500,
    grow: 1,
    shrink: 1,
    basis: 100
  },
  formula: {
    grow: {
      itemValue:0,
      total:0,
      remainingFlexSpace:0,
      itemSpace:0
    },
    shrink: {
      itemValue:0,
      basis:0,
      totalFlexBasis:0,
      value:0,
      remainingFlexSpace:0,
      itemSpace:0
    }
  }
}


const flexulator = {
  flexContainer: select('.flexulator__items-container'),
  flexContainerItems: [...selectAll('.flexulator__items-container .flex-item')],
  addFlexItemButton: select('.flexulator__form-label-button-add-flex-item'),
  flexContainerWidthField: select('.dashboard__container-width'),
  remainingSpace: select('.dashboard__flex-remaining-space'),
  flexTotalBasis: select('.dashboard__total-flex-basis'),
  flexTotalBasisFields: [...selectAll('.dashboard__total-flex-basis, .flex-item__flexulations-shrink-total-basis')],
  flexTotalRemainingSpaceFields: [...selectAll('.dashboard__flex-remaining-space, .flex-item__flexulations-remaining-space')],
  flexItemTotalFlexGrowFields: [...selectAll('.flex-item__flexulations-grow-total')],
  flexItemGrowValueFields: [...selectAll('.flex-item__flexulations-grow-value')],

  updateFlexContainerWidth: function() {
    this.flexContainerWidthField.textContent = this.flexContainer.clientWidth;
  },

  updateFlexBasis: function() {
    let totalFlexBasis = this.flexContainerItems.reduce((basisSum, flexItem) => {
      return basisSum + parseInt(flexItem.style.flexBasis);
    },0);

    this.flexTotalBasisFields.forEach(field => {
      field.textContent = totalFlexBasis;
    })
  },

  updateTotalRemainingSpace: function() {
    let remainingSpace = parseInt(this.flexContainerWidthField.textContent) - parseInt(this.flexTotalBasis.textContent);
    this.flexTotalRemainingSpaceFields.forEach(function (item) {
      item.textContent = remainingSpace;
    });
  },

  updateFlexItemWidth: function() {

    this.flexContainerItems.forEach(function(item) {
      let flexItemWidthField = item.querySelector('.flex-item__width');
      flexItemWidthField.textContent = parseInt(item.offsetWidth);
    });

  },

  updateTotalFlexGrow: function() {
    let totalFlexGrow = 0;

    this.flexContainerItems.forEach(flexItem => {
      totalFlexGrow += parseInt(flexItem.style.flexGrow);
    });

    this.flexItemTotalFlexGrowFields.forEach(flexItem => {
      flexItem.textContent = totalFlexGrow;
    });
  },

  updateGrowValue: function() {
    this.flexContainerItems.forEach(item => {
      flexulator.updateFlexItemGrowField(item);
    });
  },

  updateFlexItemGrowField: function(flexItem) {
    let flexItemGrowField = flexItem.querySelector('.flex-item__flexulations-grow-value');
    flexItemGrowField.textContent = parseInt(flexItem.style.flexGrow);
  },


  updateGrowSpace: function() {
    this.flexContainerItems.forEach(item => {
      this.updateFlexItemGrowSpace(item);
    });
  },

  updateFlexItemGrowSpace: function() {
    this.flexContainerItems.forEach(item => {
      let flexItemGrow = item.querySelector('.flex-item__flexulations-grow-value').textContent;
      let flexGrowTotal = item.querySelector('.flex-item__flexulations-grow-total').textContent;
      let flexTotalRemainingSpace = item.querySelector('.flex-item__flexulations-remaining-space').textContent;
      let flexItemGrowFraction = parseFloat(flexItemGrow) / parseFloat(flexGrowTotal);
      let flexItemWidth = item.querySelector('.flex-item__flexulations-grow-width');
      flexItemWidth.textContent = parseInt(flexItemGrowFraction * parseInt(flexTotalRemainingSpace), 10);
    });
  },

  updateFlexItemShrinkSpace: function() {

    this.flexContainerItems.forEach(flexItem => {
      let flexItemBasis = flexItem.style.flexBasis;
      flexItemBasis = flexItemBasis.slice(0, flexItemBasis.length - 2);
      let shrinkValue = parseFloat(flexItem.style.flexShrink) * parseFloat(flexItemBasis, 100);
      let shrinkFactor = shrinkValue / parseFloat(flexulator.flexTotalBasis.textContent, 10);

      flexItem.querySelector('.flex-item__flexulations-shrink-value').textContent = flexItem.style.flexShrink;
      flexItem.querySelector('.flex-item__flexulations-shrink-item-basis').textContent = parseInt(flexItemBasis);
      flexItem.querySelector('.flex-item__flexulations-shrink-quotient').textContent = shrinkFactor.toPrecision(2);
      flexItem.querySelector('.flex-item__flexulations-shrink-width').textContent = parseInt(shrinkFactor * flexulator.remainingSpace.textContent);
    })
  },


  addFlexItem: function() {
    let length = this.flexContainerItems.length;
    length++;

    let flexGrow = select('input[name="flex-grow"]').value;
    let flexShrink = select('input[name="flex-shrink"]').value;
    let flexBasis = select('input[name="flex-basis"]').value;

    let flexItem = `
    <article class="flex-item" id="flex-item-${length}" style="flex: ${flexGrow} ${flexShrink} ${flexBasis}px;">
      <h4 class="flex-item__width">${flexBasis}</h4>
      <section class="flex-item__form">
        <section class="flex-item__form-label">
          <button class="flex-item__grow-increment"></button>
          <input type="number" class="flex-item__grow-value" value="${flexGrow}">
          <button class="flex-item__grow-decrement"></button>
        </section>
        <section class="flex-item__form-label">
          <button class="flex-item__shrink-increment"></button>
          <input type="number" class="flex-item__shrink-value" value="${flexShrink}">
          <button class="flex-item__shrink-decrement"></button>
        </section>
        <section class="flex-item__form-label">
          <button class="flex-item__basis-increment"></button>
          <input type="number" class="flex-item__basis-value" value="${flexBasis}">
          <button class="flex-item__basis-decrement"></button>
        </section>
      </section>

      <section class="flex-item__flexulations-grow-container">
        <h5 class="flex-item__flexulations-grow-header">GROW</h5>
        <section class="flex-item__flexulations-grow-formula">
          <span class="flex-item__flexulations-grow-value"></span>
          <span class="flex-item__flexulations_operator">/</span>
          <span class="flex-item__flexulations-grow-total"></span>
          <span class="flex-item__flexulations_operator">*</span>
          <span class="flex-item__flexulations-grow-space flex-item__flexulations-space"></span>
          <span class="flex-item__flexulations-grow-remaining-space flex-item__flexulations-remaining-space"></span>
          <span class="flex-item__flexulations_operator">=</span>
          <span class="flex-item__flexulations-grow-width"></span>
        </section>
      </section>

      <section class="flex-item__flexulations-shrink-container">
        <h5 class="flex-item__flexulations-shrink-header">SHRINK</h5>
        <section class="flex-item__flexulations-shrink-formula">
          <span class="flex-item__flexulations_operator">(</span>
          <span class="flex-item__flexulations-shrink-value"></span>
          <span class="flex-item__flexulations_operator"> * </span>
          <span class="flex-item__flexulations-shrink-item-basis"></span>
          <span class="flex-item__flexulations_operator">) </span>
          <span class="flex-item__flexulations_operator"> / </span>
          <span class="flex-item__flexulations-shrink-total-basis"></span>
          <span class="flex-item__flexulations_operator"> = </span>
          <span class="flex-item__flexulations-shrink-quotient"></span>
          <span class="flex-item__flexulations_operator"> * </span>
          <span class="flex-item__flexulations-shrink-remaining-space flex-item__flexulations-remaining-space"></span>
          <span class="flex-item__flexulations_operator"> = </span>
          <span class="flex-item__flexulations-shrink-width"></span>
        </section>
      </section>
      <button class="flex-item__remove-button">Remove</button>
    </article>
    `;

    // flexItem.style.animation = 'addItem .25s ease-in';
    this.flexContainer.insertAdjacentHTML('beforeend', flexItem);

    // setTimeout(function() {
    //   flexulator.updateFlexContainerWidth();
    //   flexulator.updateFlexBasis();
    //   flexulator.updateTotalRemainingSpace();
    //   flexulator.updateFlexItemWidth();
    //   flexulator.updateTotalFlexGrow();
    //   flexulator.updateGrowValue();
    //   flexulator.updateFlexItemGrowSpace();
    //   flexulator.updateFlexItemShrinkSpace();
    // }, 500)

  },

  removeFlexItem: function(flexItem) {
    //remove the flex item and animate
  },

  setup: function() {

    this.addFlexItemButton.addEventListener('click', function(event) {
      event.preventDefault();
      flexulator.addFlexItem();
    });

    window.addEventListener('resize', function(event) {
      flexulator.updateFlexContainerWidth();
      flexulator.updateFlexBasis();
      flexulator.updateTotalRemainingSpace();
      flexulator.updateFlexItemWidth();
      flexulator.updateTotalFlexGrow();
      flexulator.updateGrowValue();
      flexulator.updateFlexItemGrowSpace();
      flexulator.updateFlexItemShrinkSpace();
    });

    flexulator.updateFlexContainerWidth();
    flexulator.updateFlexBasis();
    flexulator.updateTotalRemainingSpace();
    flexulator.updateFlexItemWidth();
    flexulator.updateTotalFlexGrow();
    flexulator.updateGrowValue();
    flexulator.updateFlexItemGrowSpace();
    flexulator.updateFlexItemShrinkSpace();
  },
}

flexulator.setup();

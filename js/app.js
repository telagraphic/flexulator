let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);
let selectClassName = e => document.getElementsByClassName(e);

const flexulator = {
  flexContainer: select('.flexulator__items-container'),
  flexContainerItems: [...selectClassName('flex-item')],
  addFlexItemButton: select('.flexulator__form-label-button-add-flex-item'),
  flexContainerWidthField: select('.dashboard__container-width'),
  remainingSpace: select('.dashboard__flex-remaining-space'),
  flexTotalBasis: select('.dashboard__total-flex-basis'),
  flexTotalBasisFields: [...selectClassName('flexulator__total-flex-basis')],
  flexTotalRemainingSpaceFields: [...selectClassName('flexulator__flex-remaining-space')],
  flexItemTotalFlexGrowFields: [...selectClassName('flex-item__flexulations-grow-total')],
  flexItemGrowValueFields: [...selectClassName('flex-item__flexulations-grow-value')],

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

  updateItemFlexBasis: function() {
    this.flexContainerItems.forEach(flexItem => {
      let flexItemBasis = flexItem.querySelector('.flex-item__flexulations-grow-item-basis');
      flexItemBasis.textContent = flexItem.querySelector('.flex-item__basis-value').value;
    })
  },

  updateItemComputedWidth: function() {
    this.flexContainerItems.forEach(flexItem => {
      let computedWidth = flexItem.querySelector('.flex-item__flexulations-grow-item-computed-width');

      setTimeout(function() {
        let flexItemWidth = flexItem.querySelector('.flex-item__width');
        computedWidth.textContent = flexItemWidth.textContent;
      }, 500)
    })

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
      let flexTotalRemainingSpace = item.querySelector('.flexulator__flex-remaining-space').textContent;
      let flexItemGrowFraction = parseFloat(flexItemGrow) / parseFloat(flexGrowTotal);
      let flexItemWidth = [...item.querySelectorAll('.flex-item__flexulations-grow-width')];

      flexItemWidth.forEach(item => {
        item.textContent = parseInt(flexItemGrowFraction * parseInt(flexTotalRemainingSpace), 10);
      });

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
      let shrinkQuotient = [...flexItem.querySelectorAll('.flex-item__flexulations-shrink-quotient')];
      shrinkQuotient.forEach(item => {
        item.textContent = shrinkFactor.toPrecision(2);
      })
      // flexItem.querySelector('.flex-item__flexulations-shrink-quotient').textContent = shrinkFactor.toPrecision(2);
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
          <span class="flex-item__flexulations-grow-remaining-space flexulator__flex-remaining-space"></span>
          <span class="flex-item__flexulations_operator">=</span>
          <span class="flex-item__flexulations-grow-width"></span>
          <span class="flex-item__flexulations_operator">+</span>
          <span class="flex-item__flexulations-grow-item-basis"></span>
          <span class="flex-item__flexulations_operator">=</span>
          <span class="flex-item__flexulations-grow-item-computed-width"></span>
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
          <span class="flex-item__flexulations-shrink-total-basis flexulator__total-flex-basis"></span>
          <span class="flex-item__flexulations_operator"> = </span>
          <span class="flex-item__flexulations-shrink-quotient"></span>
          <span class="flex-item__flexulations_operator"> * </span>
          <span class="flex-item__flexulations-shrink-remaining-space flexulator__flex-remaining-space"></span>
          <span class="flex-item__flexulations_operator"> = </span>
          <span class="flex-item__flexulations-shrink-width"></span>
        </section>
      </section>
      <button class="flex-item__remove-button">Remove</button>
    </article>
    `;

    // flexItem.style.animation = 'addItem .25s ease-in';
    this.flexContainer.insertAdjacentHTML('beforeend', flexItem);

    setTimeout(function() {
      flexulator.updateChanges();
    }, 500);

  },

  removeFlexItem: function() {

    this.flexContainerItems.forEach(flexItem => {
        flexItem.addEventListener('click', function(event) {
          if (event.target.matches('.flex-item__remove-button')) {
            event.currentTarget.remove();
            setTimeout(function() {
              flexulator.updateChanges();
            }, 500);
          }
        });
    });
  },

  updateChanges: function() {
    flexulator.updateFlexContainerWidth();
    flexulator.updateFlexBasis();
    flexulator.updateTotalRemainingSpace();
    flexulator.updateFlexItemWidth();
    flexulator.updateTotalFlexGrow();
    flexulator.updateGrowValue();
    flexulator.updateFlexItemGrowSpace();
    flexulator.updateFlexItemShrinkSpace();
    flexulator.updateItemComputedWidth();
    flexulator.updateItemFlexBasis();
    flexulator.removeFlexItem();
  },

  setup: function() {

    this.addFlexItemButton.addEventListener('click', function(event) {
      event.preventDefault();
      flexulator.addFlexItem();
    });

    window.addEventListener('resize', function(event) {
      flexulator.updateChanges();
    });

    flexulator.updateChanges();
  },
}

flexulator.setup();

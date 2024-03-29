// import newFlexItemObject from './flexItem.js';
let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);

const flexulator = {
  elements: {
    container: null,
    flexItems: null
  },
  flexValues: {
    width: 0,
    flexBasisTotal: 0,
    remainingSpace: 0
  },
  flexItems: [],
  initialize: function(container) {
    flexulator.elements.container = select(container);
    flexulator.updateWidth();
    flexulator.updateFlexItems();
    flexulator.updateFlexTotalBasis();
    flexulator.updateRemainingSpace();
    flexulator.createFlexItems();
    flexulator.updateFlexItemsContainerValues();
    flexulator.updateResize();
    flexulator.updateFlexGrowTotal();
    flexulator.updateShrinkBasisTotal();
    flexulator.updateForm();
    flexulator.setupRemoveButton();
    flexulator.setupFlexItemAddButton();
    flexulator.setupFlexButtons();
    flexulator.updateFlexFormButtons();
    flexulator.updateShrinkExample();
    flexulator.updateGrowExample();
    flexulator.updateFlexItemGrowFormulaExample();
    flexulator.updateFlexItemShrinkFormulaExample();
  },
  updateWidth: function () {
    flexulator.flexValues.width = flexulator.elements.container.clientWidth;
  },
  updateFlexItemWidths: function() {
    let [...newItemWidths] = flexulator.elements.flexItems.map(item => item.clientWidth);

    flexulator.flexItems.forEach((item, index) => {
      item.flexulations.itemWidth = newItemWidths[index];
      item.flexulations.form.width = newItemWidths[index];
      item.writeItemFlexulations();
    });
  },
  updateFlexItems: function () {
    flexulator.elements.flexItems = [...flexulator.elements.container.querySelectorAll('.flex-item')];
  },
  updateFlexTotalBasis: function () {
    let flexBasisTotal = flexulator.elements.flexItems.reduce((basisSum, flexItem) => {
      return basisSum + parseInt(flexItem.style.flexBasis);
    }, 0);

    flexulator.flexValues.flexBasisTotal = flexBasisTotal;

    flexulator.flexItems.forEach(item => {
      item.flexulations.container.flexBasisTotal = flexBasisTotal;
    });
  },
  updateRemainingSpace: function() {
    flexulator.flexValues.remainingSpace = flexulator.flexValues.width - flexulator.flexValues.flexBasisTotal;
  },
  createFlexItems: function() {
    let id = 0;
    flexulator.elements.flexItems.forEach(item => {
      let newFlexItem = flexulator.newFlexItem();
      newFlexItem.initialize(item);
      newFlexItem.id = id;
      flexulator.flexItems.push(newFlexItem);
      id++;
    });

    flexulator.updateFlexGrowTotal();
  },
  newFlexItem: function () {
    return newFlexItemObject();
  },
  addNewFlexItem: function() {
    let item = flexulator.elements.flexItems[flexulator.elements.flexItems.length -1];
    let [...flexStyles] = [item.style.flexGrow, item.style.flexShrink, item.style.flexBasis.replace('px', '')];
    let newFlexItem = flexulator.newFlexItem();
    newFlexItem.initialize(item);
    newFlexItem.updateItemStyles(flexStyles);
    newFlexItem.updateItemForm(item.clientWidth, flexStyles);
    newFlexItem.updateShrinkBasisTotal();
    newFlexItem.id = parseInt(item.dataset.id);
    flexulator.flexItems.push(newFlexItem);
  },
  updateFlexItemsContainerValues: function () {
    flexulator.flexItems.forEach(item => {
      item.updateItemContainerFlexulations({
        width: flexulator.flexValues.width,
        flexBasisTotal: flexulator.flexValues.flexBasisTotal,
        remainingSpace: flexulator.flexValues.remainingSpace
      });
    });

    flexulator.flexItems.forEach(item => {
      item.writeItemFlexulations();
    });
  },
  updateFlexGrowTotal: function() {
    let flexGrowTotal = flexulator.elements.flexItems.reduce((growSum, flexItem) => {
      return growSum + parseInt(flexItem.style.flexGrow);
    }, 0);

    flexulator.flexItems.forEach(item => {
      item.updateFlexGrowTotal(flexGrowTotal);
    });

  },
  updateShrinkBasisTotal: function() {
    let shrinkBasisTotal = flexulator.flexItems.reduce((shrinkSum, flexItem) => {
      return shrinkSum + flexItem.returnItemShrinkBasis();
    }, 0);

    flexulator.flexItems.forEach(item => {
      item.updateShrinkBasisTotal(shrinkBasisTotal);
    })
  },
  updateForm: function() {
    flexulator.elements.flexItems.forEach(item => {
      item.addEventListener('input', function(event) {
        if (event.target.matches('.flex-item__grow-value')) {
          flexulator.updateFormValue(event.currentTarget.dataset.id, 'grow');
        } else if (event.target.matches('.flex-item__shrink-value')) {
          flexulator.updateFormValue(event.currentTarget.dataset.id, 'shrink');
        } else if (event.target.matches('.flex-item__basis-value')) {
          flexulator.updateFormValue(event.currentTarget.dataset.id, 'basis')
        }
      })
    });
  },
  updateFormValue: function (itemId, property) {
    let itemToUpdate = flexulator.flexItems.find(function(item) {
      return item.id === parseInt(itemId);
    });

    itemToUpdate.updateForm(property);

    setTimeout(() => {
      flexulator.updateFlexItemWidths();
    }, 1000);

    flexulator.updateWidth();
    flexulator.updateFlexItems();
    flexulator.updateFlexTotalBasis();
    flexulator.updateFlexGrowTotal();
    flexulator.updateRemainingSpace()
    flexulator.updateShrinkBasisTotal();
    flexulator.updateFlexItemsContainerValues();
  },
  setupFlexItemAddButton: function() {
    let addButton = select('.flexulator__form-label-button-add-flex-item');

    addButton.addEventListener('click', function(event) {
      event.preventDefault();
      flexulator.addFlexItem();
      flexulator.updateFlexItems();
      flexulator.addNewFlexItem();
      flexulator.updateWidth();
      flexulator.updateFlexTotalBasis();
      flexulator.updateRemainingSpace();
      flexulator.updateFlexGrowTotal();
      flexulator.updateShrinkBasisTotal();
      flexulator.updateFlexFormButtons();
      flexulator.updateForm();
      flexulator.updateFlexItemsContainerValues();
    })
  },
  updateFlexFormButtons: function() {
    let buttonLabels = [...selectAll('.flex-item__form-label-container')];
    buttonLabels.forEach(element => {
      element.addEventListener('mouseenter', event => {
        let buttons = event.currentTarget.querySelectorAll('.flex-item__form-button');
        buttons.forEach(button => { button.classList.add('flex-item__form-button--show')})
      });
      element.addEventListener('mouseleave', event => {
        let buttons = event.currentTarget.querySelectorAll('.flex-item__form-button');
        buttons.forEach(button => { button.classList.remove('flex-item__form-button--show')})
      });
    })
  },
  setupFlexButtons: function() {
    flexulator.elements.flexItems.forEach(item => {
      flexulator.updateFlexItemFormButtons(item);
    });
  },
  addFlexItemButtons: function() {
    flexulator.elements.flexItems.forEach(item => {
      if (!item.hasAttribute('data-button-click')) {
        item.dataset.buttonClick = true;
        flexulator.updateFlexItemFormButtons(item);
      }
    });
  },
  updateFlexItemFormButtons: function(item) {
    item.addEventListener('click', event => {
      if (event.target.matches('.flex-item__grow-increment')) {
        event.target.parentElement.querySelector('.flex-item__grow-value').value++;
        event.currentTarget.style.flexGrow++
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'grow');
      } else if (event.target.matches('.flex-item__grow-decrement')) {
        event.target.parentElement.querySelector('.flex-item__grow-value').value--;
        event.currentTarget.style.flexGrow--;
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'grow');
      } else if (event.target.matches('.flex-item__shrink-increment')) {
        event.target.parentElement.querySelector('.flex-item__shrink-value').value++;
        event.currentTarget.style.flexShrink++;
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'shrink');
      } else if (event.target.matches('.flex-item__shrink-decrement')) {
        event.target.parentElement.querySelector('.flex-item__shrink-value').value--;
        event.currentTarget.style.flexShrink--;
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'shrink');
      } else if (event.target.matches('.flex-item__basis-increment')) {
        let newBasis = parseInt(event.currentTarget.style.flexBasis.replace('px', ''));
        newBasis = newBasis + 50;
        event.target.parentElement.querySelector('.flex-item__basis-value').value = newBasis;
        event.currentTarget.style.flexBasis = `${newBasis}px`;
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'basis');
      } else if (event.target.matches('.flex-item__basis-decrement')) {
        let newBasis = parseInt(event.currentTarget.style.flexBasis.replace('px', ''));
        newBasis = newBasis - 50;
        event.target.parentElement.querySelector('.flex-item__basis-value').value = newBasis;
        event.currentTarget.style.flexBasis = `${newBasis}px`;
        flexulator.updateFormValue(event.currentTarget.dataset.id, 'basis');
      }
    });
  },
  updateFlexulations: function() {
    flexulator.updateFlexItems();
    flexulator.updateWidth();
    flexulator.updateFlexTotalBasis();
    flexulator.updateRemainingSpace();
    flexulator.updateFlexGrowTotal();
    flexulator.updateShrinkBasisTotal();
  },
  addFlexItem: function () {
    let length = this.elements.flexItems.length;

    let flexGrow = select('input[name="flex-grow"]').value;
    let flexShrink = select('input[name="flex-shrink"]').value;
    let flexBasis = select('input[name="flex-basis"]').value;

    // check if page is displaying grow or shrink

    let growButton = select('.flexulator__items-container-grow-button');
    let shrinkButton = select('.flexulator__items-container-shrink-button');

    let growOpacity = growButton.dataset.active;
    let shrinkOpacity = shrinkButton.dataset.active;

    let flexItem = `
    <article class="flex-item" style="flex: ${flexGrow} ${flexShrink} ${flexBasis}px;" data-id="${length}">
      <section class="flex-item__width-container">
        <h4 class="flex-item__width"></h4>
        <h5 class="flex-item__width-header">width</h5>
      </section>

      <section class="flex-item__form">
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__grow-increment flex-item__form-button">
            </button>
            <input type="number" class="flex-item__grow-value" value="${flexGrow}">
            <button class="flex-item__grow-decrement flex-item__form-button">
            </button>
          </section>
          <h5 class="flex-item__form-label-name">grow</h5>
        </section>
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__shrink-increment flex-item__form-button">
            </button>
            <input type="number" class="flex-item__shrink-value" value="${flexShrink}">
            <button class="flex-item__shrink-decrement flex-item__form-button">
            </button>
          </section>
          <h5 class="flex-item__form-label-name">shrink</h5>
        </section>
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__basis-increment flex-item__form-button">
            </button>
            <input type="number" class="flex-item__basis-value" value="${flexBasis}">
            <button class="flex-item__basis-decrement flex-item__form-button">
            </button>
          </section>
          <h5 class="flex-item__form-label-name">flex-basis</h5>
        </section>
      </section>

      <section class="flex-item__flexulations-container">
        <section class="flex-item__flexulations-grow-container" data-active="1" style="opacity:${growOpacity};">
          <h5 class="flex-item__flexulations-grow-header">GROW CALCULATION</h5>
          <section class="flex-item__flexulations-grow-formula">
            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                remaining space
              </h5>
              <span class="flex-item__flexulations-container-width"></span>
              <span class="flex-item__flexulations_operator">-</span>
              <span class="flex-item__flexulations-total-flex-basis"></span>
              <span class="flex-item__flexulations_operator">=</span>
              <span class="flex-item__flexulations-remaining-space flex-item__flexulations-container-width"></span>
            </section>

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                allocated space
              </h5>
              <span class="flex-item__flexulations-grow-value"></span>
              <span class="flex-item__flexulations_operator">/</span>
              <span class="flex-item__flexulations-grow-total"></span>
              <span class="flex-item__flexulations_operator">*</span>
              <span class="flex-item__flexulations-grow-space flex-item__flexulations-space"></span>
              <span class="flex-item__flexulations-remaining-space flex-item__flexulations-container-width"></span>
              <span class="flex-item__flexulations_operator">=</span>
              <span class="flex-item__flexulations-grow-width"></span>
            </section>

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                final width
              </h5>
              <span class="flex-item__flexulations-grow-width"></span>
              <span class="flex-item__flexulations_operator">+</span>
              <span class="flex-item__flexulations-grow-item-basis"></span>
              <span class="flex-item__flexulations_operator">=</span>
              <span class="flex-item__flexulations-grow-item-computed-width"></span>
            </section>
          </section>
        </section>
        <section class="flex-item__flexulations-shrink-container" style="opacity:${shrinkOpacity};">
          <h5 class="flex-item__flexulations-shrink-header">SHRINK CALCULATION</h5>
          <section class="flex-item__flexulations-shrink-formula">

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                remaining space
              </h5>
              <span class="flex-item__flexulations-container-width"></span>
              <span class="flex-item__flexulations_operator">-</span>
              <span class="flex-item__flexulations-total-flex-basis"></span>
              <span class="flex-item__flexulations_operator">=</span>
              <span class="flex-item__flexulations-remaining-space flex-item__flexulations-container-width"></span>
            </section>

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                shrink factor
              </h5>
              <span class="flex-item__flexulations_operator">(</span>
              <span class="flex-item__flexulations-shrink-value"></span>
              <span class="flex-item__flexulations_operator"> * </span>
              <span class="flex-item__flexulations-shrink-item-basis"></span>
              <span class="flex-item__flexulations_operator">) </span>
              <span class="flex-item__flexulations-shrink-value-basis-total"></span>
              <span class="flex-item__flexulations_operator"> / </span>
              <span class="flex-item__flexulations-shrink-total-basis flexulator__total-flex-basis"></span>
              <span class="flex-item__flexulations_operator"> = </span>
              <span class="flex-item__flexulations-shrink-quotient"></span>
            </section>

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                shrink amount
              </h5>
              <span class="flex-item__flexulations-shrink-quotient"></span>
              <span class="flex-item__flexulations_operator"> * </span>
              <span class="flex-item__flexulations-remaining-space"></span>
              <span class="flex-item__flexulations_operator"> = </span>
              <span class="flex-item__flexulations-shrink-width"></span>
            </section>

            <section class="flex-item__flexulations-section">
              <h5 class="flex-item__flexuations-section-header">
                final width
              </h5>
              <span class="flex-item__flexulations-shrink-value-basis-total"></span>
              <span class="flex-item__flexulations_operator"> - </span>
              <span class="flex-item__flexulations-shrink-width-postive"></span>
              <span class="flex-item__flexulations_operator"> = </span>
              <span class="flex-item__flexulations-shrink-final-width"></span>
            </section>
          </section>
        </section>
      </section>
      <button class="flex-item__remove-button">Remove</button>
    </article>
    `;

    this.elements.container.insertAdjacentHTML('beforeend', flexItem);

    setTimeout(function() {
      flexulator.addFlexItemButtons();
      flexulator.addRemoveButton();
    }, 500);

  },
  addRemoveButton: function() {
    flexulator.elements.flexItems.forEach(item => {
      if (!item.hasAttribute('data-remove-button')) {
        item.dataset.removeButton = true;
        item.addEventListener('click', function(event) {
          flexulator.removeFlexItem(event);
        });
      }
    });
  },
  setupRemoveButton: function() {
    flexulator.elements.flexItems.forEach(element => {
      element.addEventListener('click', function(event) {
        flexulator.removeFlexItem(event);
      });
    })
  },
  removeFlexItem: function(element) {
    if (element.target.matches('.flex-item__remove-button')) {

      if (flexulator.flexItems.length === 1) {
        return;
      } else {
        let indexToDelete = flexulator.elements.flexItems.findIndex(function(item) {
          return item.dataset.id == element.currentTarget.dataset.id;
        });

        element.currentTarget.remove();
        flexulator.flexItems.splice(indexToDelete, 1);
        flexulator.elements.flexItems.splice(indexToDelete, 1);

        setTimeout(function() {
          flexulator.updateFlexItems();
          flexulator.updateWidth();
          flexulator.updateFlexTotalBasis();
          flexulator.updateRemainingSpace();
          flexulator.updateFlexGrowTotal();
          flexulator.updateShrinkBasisTotal();
          flexulator.updateFlexItemsContainerValues();
        }, 500);
      }
    }
  },
  updateShrinkExample: function() {
    let shrinkButton = select('.flexulator__items-container-shrink-button');
    shrinkButton.addEventListener('click', function(event) {
      event.preventDefault();
      let containerRemainder = ((flexulator.flexValues.width / flexulator.flexItems.length) + 100).toFixed(0);
      flexulator.flexItems.forEach(item => {
        item.elements.form.flexBasis.value = containerRemainder;
        item.updateForm("basis");
        item.updateItemShrinkBasis();
        item.writeItemFlexulations();
      });

      flexulator.updateFlexTotalBasis();
      flexulator.updateRemainingSpace();
      flexulator.updateFlexGrowTotal();
      flexulator.updateShrinkBasisTotal();
      flexulator.updateFlexItemsContainerValues();
      flexulator.updateFlexItemShrinkFormulaExample();

      let growFlexulations = selectAll('.flex-item__flexulations-grow-container');
      growFlexulations.forEach(element => element.style.opacity = 0);

      let shrinkFlexulations = selectAll('.flex-item__flexulations-shrink-container');
      shrinkFlexulations.forEach(element => element.style.opacity = 1);

      let growButton = select('.flexulator__items-container-grow-button');

      shrinkButton.dataset.active = 1;
      growButton.dataset.active = 0;
    });
  },
  updateGrowExample: function() {
    let growButton = select('.flexulator__items-container-grow-button');
    growButton.addEventListener('click', function(event) {
      event.preventDefault();
      flexulator.flexItems.forEach(item => {
        item.elements.form.flexBasis.value = 100;
        item.updateForm("basis");
        item.updateItemShrinkBasis();
        item.writeItemFlexulations();
      });

      flexulator.updateFlexTotalBasis();
      flexulator.updateRemainingSpace();
      flexulator.updateFlexGrowTotal();
      flexulator.updateShrinkBasisTotal();
      flexulator.updateFlexItemsContainerValues();
      flexulator.updateFlexItemGrowFormulaExample();

      let growFlexulations = selectAll('.flex-item__flexulations-grow-container');
      growFlexulations.forEach(element => element.style.opacity = 1);

      let shrinkFlexulations = selectAll('.flex-item__flexulations-shrink-container');
      shrinkFlexulations.forEach(element => element.style.opacity = 0);

      let shrinkButton = select('.flexulator__items-container-shrink-button');

      shrinkButton.dataset.active = 0;
      growButton.dataset.active = 1;
    });
  },
  updateResize: function() {
    window.addEventListener('resize', function() {
      flexulator.updateWidth();
      flexulator.updateRemainingSpace();
      flexulator.updateFlexItemsContainerValues();
      flexulator.updateFlexItemGrowFormulaExample();
      flexulator.updateFlexItemShrinkFormulaExample();
    })
  },
  updateFlexItemGrowFormulaExample: function() {
    let flexItem = flexulator.flexItems[0];
    let container = select('.grow-example__container');
    let totalFlexBasis = select('.grow-example__total-flex-basis');
    let remainingSpace = selectAll('.grow-example__remaining-space');
    let itemGrow = select('.grow-example__item-grow');
    let totalGrow = select('.grow-example__total-grow');
    let growQoutient = select('.grow-example__total-grow-quotient');
    let allocatedSpace = selectAll('.grow-example__allocated-space');
    let itemFlexBasis = select('.grow-example__item-flex-basis');
    let finalWidth = select('.grow-example__final-width');

    container.textContent = flexItem.flexulations.container.width;
    totalFlexBasis.textContent = flexItem.flexulations.container.flexBasisTotal;
    remainingSpace.forEach(element => element.textContent = flexItem.flexulations.container.remainingSpace);
    itemGrow.textContent = flexItem.flexulations.grow.value;
    totalGrow.textContent = flexItem.flexulations.grow.total;
    growQoutient.textContent = (flexItem.flexulations.grow.value / flexItem.flexulations.grow.total).toFixed(6);

    allocatedSpace.forEach(element => element.textContent = flexItem.flexulations.grow.width);
    itemFlexBasis.textContent = flexItem.flexulations.grow.itemBasis;
    finalWidth.textContent = flexItem.flexulations.itemWidth;
  },
  updateFlexItemShrinkFormulaExample: function () {
    let flexItem = flexulator.flexItems[0];

    let container = select('.shrink-example__container');
    let totalFlexBasis = select('.shrink-example__total-flex-basis');
    let remainingSpace = selectAll('.shrink-example__remaining-space');
    let itemShrink = select('.shrink-example__item-shrink');
    let itemBasis = selectAll('.shrink-example__item-basis');
    let itemShrinkSum = select('.shrink-example__item-shrink-sum')
    let shrinkBasisTotal = select('.shrink-example__shrink-basis-total');
    let shrinkFactor = selectAll('.shrink-example__shrink-factor');
    let shrinkAmount = selectAll('.shrink-example__shrink-amount');
    let finalWidth = select('.shrink-example__final-width');

    container.textContent = flexItem.flexulations.container.width;
    totalFlexBasis.textContent = flexItem.flexulations.container.flexBasisTotal;
    remainingSpace.forEach(element => element.textContent = flexItem.flexulations.container.remainingSpace);
    itemShrink.textContent = flexItem.flexulations.shrink.value;
    itemBasis.forEach(element => element.textContent = flexItem.flexulations.shrink.itemBasis);
    itemShrinkSum.textContent = flexItem.flexulations.shrink.valueBasisTotal;
    shrinkBasisTotal.textContent = flexItem.flexulations.shrink.basisTotal;
    shrinkFactor.forEach(element => element.textContent = flexItem.flexulations.shrink.factor.toFixed(6));

    let remainingAmountIntermediate = (flexItem.flexulations.shrink.factor.toFixed(6) * flexItem.flexulations.container.remainingSpace);
    remainingAmountIntermediate = remainingAmountIntermediate.toFixed(2);
    remainingAmountIntermediate = remainingAmountIntermediate.toString().replace("-", "");
    shrinkAmount.forEach(element => element.textContent = parseFloat(remainingAmountIntermediate));
    finalWidth.textContent = flexItem.elements.self.clientWidth;

  }
}
flexulator.initialize('.flexulator__items-container');

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
    flexulator.updateFlexItemsContainerValues();
    flexulator.updateResize();
    flexulator.updateFlexGrowTotal();
    flexulator.updateShrinkBasisTotal();
    flexulator.updateForm();
    flexulator.setupRemoveButton();
    flexulator.setupFlexItemButton();
    flexulator.setupFlexButtons();
    flexulator.updateFlexFormButtons();
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

    flexulator.flexItems.forEach(item => {
      item.flexulations.container.flexBasisTotal = flexBasisTotal;
    });
  },
  updateRemainingSpace: function() { // remove
    flexulator.flexValues.remainingSpace = flexulator.flexValues.width - flexulator.flexValues.flexBasisTotal;
  },
  updateContainer: function() { // remove
    let width = flexulator.elements.dashboard.querySelector('.dashboard__container-width');
    let flexBasisTotal = flexulator.elements.dashboard.querySelector('.dashboard__total-flex-basis');
    let remainingSpace = flexulator.elements.dashboard.querySelector('.dashboard__flex-remaining-space');

    width.textContent = flexulator.flexValues.width;
    flexBasisTotal.textContent = flexulator.flexValues.flexBasisTotal;
    remainingSpace.textContent = flexulator.flexValues.remainingSpace;
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
    let id = item.dataset.id;
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
    let flexGrowTotal = flexulator.flexItems.reduce((growSum, flexItem) => {
      return growSum + parseInt(flexItem.style.grow);
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

    flexulator.updateWidth();
    flexulator.updateFlexItems();
    flexulator.updateFlexTotalBasis();
    flexulator.updateFlexGrowTotal();
    flexulator.updateRemainingSpace()
    flexulator.updateShrinkBasisTotal();
    flexulator.updateFlexItemsContainerValues();
  },
  setupFlexItemButton: function() {
    let addButton = select('.flexulator__form-label-button-add-flex-item');

    addButton.addEventListener('click', function(event) {
      event.preventDefault();
      flexulator.addFlexItem();

      flexulator.updateFlexItems();
      flexulator.addNewFlexItem();
      flexulator.updateWidth();
      flexulator.updateFlexTotalBasis();
      flexulator.updateRemainingSpace();
      flexulator.updateContainer();
      flexulator.updateFlexGrowTotal();
      flexulator.updateShrinkBasisTotal();
      flexulator.updateFlexFormButtons();
      flexulator.setupFlexButtons();
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
    let buttonLabels = [...selectAll('.flex-item__form-label-container')];

    buttonLabels.forEach(button => {
      button.addEventListener('click', function(event) {
        console.log(event.target, event.currentTarget);
      })
    });

  },
  addFlexItem: function () {
    let length = this.elements.flexItems.length;

    let flexGrow = select('input[name="flex-grow"]').value;
    let flexShrink = select('input[name="flex-shrink"]').value;
    let flexBasis = select('input[name="flex-basis"]').value;

    let flexItem = `
    <article class="flex-item" style="flex: ${flexGrow} ${flexShrink} ${flexBasis}px;" data-id="${length}">
      <section class="flex-item__width-container">
        <h4 class="flex-item__width"></h4>
        <h5 class="flex-item__width-header">width</h5>
      </section>

      <section class="flex-item__form">
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__grow-increment"></button>
            <input type="number" class="flex-item__grow-value" value="${flexGrow}">
            <button class="flex-item__grow-decrement"></button>
          </section>
          <h5 class="flex-item__form-label-name">grow</h5>
        </section>
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__shrink-increment"></button>
            <input type="number" class="flex-item__shrink-value" value="${flexShrink}">
            <button class="flex-item__shrink-decrement"></button>
          </section>
          <h5 class="flex-item__form-label-name">shrink</h5>
        </section>
        <section class="flex-item__form-label">
          <section class="flex-item__form-label-container">
            <button class="flex-item__basis-increment"></button>
            <input type="number" class="flex-item__basis-value" value="${flexBasis}">
            <button class="flex-item__basis-decrement"></button>
          </section>
          <h5 class="flex-item__form-label-name">flex-basis</h5>
        </section>
      </section>

      <section class="flex-item__flexulations-grow-container">
        <h5 class="flex-item__flexulations-grow-header">GROW</h5>
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

      <section class="flex-item__flexulations-shrink-container">
        <h5 class="flex-item__flexulations-shrink-header">SHRINK</h5>
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
            <span class="flex-item__flexulations_operator"> / </span>
            <span class="flex-item__flexulations-shrink-total-basis flexulator__total-flex-basis"></span>
            <span class="flex-item__flexulations_operator"> = </span>
            <span class="flex-item__flexulations-shrink-quotient"></span>
          </section>

          <section class="flex-item__flexulations-section">
            <h5 class="flex-item__flexuations-section-header">
              final width
            </h5>
            <span class="flex-item__flexulations-shrink-quotient"></span>
            <span class="flex-item__flexulations_operator"> * </span>
            <span class="flex-item__flexulations-remaining-space"></span>
            <span class="flex-item__flexulations_operator"> = </span>
            <span class="flex-item__flexulations-shrink-width"></span>
          </section>
        </section>
      </section>
      <button class="flex-item__remove-button">Remove</button>
    </article>
    `;

    this.elements.container.insertAdjacentHTML('beforeend', flexItem);

    setTimeout(function() {
      flexulator.setupRemoveButton();
    }, 500);

  },
  setupRemoveButton: function() {
    flexulator.elements.flexItems.forEach(element => {
      element.addEventListener('click', function(event) {
        if (event.target.matches('.flex-item__remove-button')) {

          if (flexulator.flexItems.length === 1) {
            return;
          } else {
            event.currentTarget.remove();
            flexulator.removeFlexItem(event.currentTarget);

            setTimeout(function() {
              flexulator.updateFlexItems();
              flexulator.updateWidth();
              flexulator.updateFlexTotalBasis();
              flexulator.updateRemainingSpace();
              flexulator.updateContainer();
              flexulator.updateFlexGrowTotal();
              flexulator.updateShrinkBasisTotal();
              flexulator.updateFlexItemsContainerValues();
            }, 500)
          }
        }
      });
    })
  },
  removeFlexItem: function(item) {
    flexulator.flexItems.splice(item.dataset.id, 1);
  },
  updateResize: function() {
    window.addEventListener('resize', function(event) {
      flexulator.updateWidth();
      flexulator.updateRemainingSpace();
      flexulator.updateContainer();
      flexulator.updateFlexItemsContainerValues();
    })
  }
}


flexulator.initialize('.flexulator__items-container');
console.log(flexulator);
console.log(flexulator.flexItems[0]);

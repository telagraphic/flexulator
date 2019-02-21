// get container and item values
var flexContainer = document.getElementById('flex-container');
var addFlexItemButton = document.getElementById('add-flex-item-button');
var showTotalFlexBasis = document.getElementById('total-flex-basis');
var flexContainerWidth = document.getElementById('container-width');

function getFlexItems() {
  return Array.prototype.slice.call(document.getElementsByClassName('flex-item'));
}


var buttons = Array.from(document.querySelectorAll('.tabs button'));
var tabs = Array.from(document.querySelectorAll('.tab-content'));

buttons.forEach(function(button, index) {
  button.addEventListener('click', function() {
    removeActiveTab()
    tabs[index].classList.add('toggle-tab');
  });
});

function removeActiveTab() {
  tabs.forEach(function(tab) {
    tab.classList.remove('toggle-tab');
  })
}





// on window load, get values
// updateRemainingSpace();
updateContainerWidth();
totalRemainingSpace();
updateItemWidth();
initFlexItems();

function initFlexItems() {
  getFlexItems().forEach(function (item) {
    updateFlexItem(item);
    removeFlexItem(item);
  });
};

addFlexItemButton.addEventListener('click', function(event) {
  event.preventDefault();
  addFlexItem();
});

// on resize, update values
window.addEventListener('resize', function(event) {
  updateRemainingSpace();
  updateContainerWidth();
  totalRemainingSpace();
  updateItemWidth();
  updateGrowItemSpace();
  setFlexItemShrink();
});

function updateContainerWidth() {
  flexContainerWidth.textContent = flexContainer.clientWidth;
};


function totalRemainingSpace() {
  var displayRemainingSpace = Array.prototype.slice.call(document.getElementsByClassName('flex-remaining-space'));
  var remainingSpace = parseInt(flexContainerWidth.textContent) - parseInt(showTotalFlexBasis.textContent);
  displayRemainingSpace.forEach(function (item) {
    item.textContent = remainingSpace;
  });
}

function updateItemWidth() {
  // read & write
  getFlexItems().forEach(function(item) {
    item.firstElementChild.textContent = item.offsetWidth;
  });
}

function updateRemainingSpace() {
  flexContainerWidth.textContent = flexContainer.clientWidth;
  var displayRemainingSpace = Array.prototype.slice.call(document.getElementsByClassName('flex-remaining-space'));
  var remainingSpace = parseInt(flexContainerWidth.textContent) - parseInt(showTotalFlexBasis.textContent);
  displayRemainingSpace.forEach(function (item) {
    item.textContent = remainingSpace;
  });

  getFlexItems().forEach(function (item) {
    item.firstElementChild.textContent = item.offsetWidth;
  });
}


function addFlexItem() {
  // get item count
  var flexItemCount = Array.prototype.slice.call(flexContainer.childNodes);
  var flexitems = [];
  flexItemCount.forEach(function(element) {
    if (element.nodeType === 1) {
      flexitems.push(element);
    }
  });

  var length = flexitems.length;
  length++;

  // get flex styles
  var grow = document.getElementById('flex-grow').value;
  var shrink = document.getElementById('flex-shrink').value;
  var basis = document.getElementById('flex-basis').value;

  // create new element with flex values
  var flexItem = document.createElement('section');
  flexItem.setAttribute('id', 'flex-item-' + length);
  flexItem.setAttribute('class', 'flex-item');

  var flexValues = document.createElement('section');
  flexValues.setAttribute('class', 'item-values');

  var growSection = document.createElement('section');

  var incrementGrowButton = document.createElement('button');
  incrementGrowButton.setAttribute('class', 'increment-grow-value');
  // incrementGrowButton.textContent = '+';

  var growInput = document.createElement('input');
  growInput.setAttribute('type', 'number');
  growInput.setAttribute('class', 'item-grow');
  growInput.setAttribute('value', grow);

  var decrementGrowButton = document.createElement('button');
  decrementGrowButton.setAttribute('class', 'decrement-grow-value');
  // decrementGrowButton.textContent = '-';

  growSection.appendChild(incrementGrowButton);
  growSection.appendChild(growInput);
  growSection.appendChild(decrementGrowButton);

  var shrinkSection = document.createElement('section');

  var incrementShrinkButton = document.createElement('button');
  incrementShrinkButton.setAttribute('class', 'increment-shrink-value');
  // incrementShrinkButton.textContent = '+';

  var shrinkInput = document.createElement('input');
  shrinkInput.setAttribute('type', 'number');
  shrinkInput.setAttribute('class', 'item-shrink');
  shrinkInput.setAttribute('value', shrink);

  var decrementShrinkButton = document.createElement('button');
  decrementShrinkButton.setAttribute('class', 'decrement-shrink-value');
  // decrementShrinkButton.textContent = '-';

  shrinkSection.appendChild(incrementShrinkButton);
  shrinkSection.appendChild(shrinkInput);
  shrinkSection.appendChild(decrementShrinkButton);

  var basisSection = document.createElement('section');
  var basisInput = document.createElement('input');
  basisInput.setAttribute('type', 'text');
  basisInput.setAttribute('class', 'item-basis');
  basisInput.setAttribute('value', basis);
  // var basisIncrementButton = document.createElement('button');
  // basisIncrementButton.setAttribute('class', 'increment-shrink-value');
  // basisIncrementButton.textContent = '+';

  // var basisDecrementButton = document.createElement('button');
  // basisDecrementButton.setAttribute('class', 'decrement-shrink-value');
  // basisDecrementButton.textContent = '-';

  // basisSection.appendChild(basisIncrementButton);
  basisSection.appendChild(basisInput);
  // basisSection.appendChild(basisDecrementButton);

  flexValues.appendChild(growSection);
  flexValues.appendChild(shrinkSection);
  flexValues.appendChild(basisSection);

  // flexItem.style.display = 'flex';
  flexItem.style.flexGrow = grow;
  flexItem.style.flexShrink = shrink;
  flexItem.style.flexBasis = basis + 'px';


  var itemWidth = document.createElement('h4');
  itemWidth.setAttribute('class', 'item-width');
  itemWidth.textContent = basis;

  var button = document.createElement('button');
  button.setAttribute('class', 'remove-item-button');
  button.textContent = 'Remove';

  // Grow Section
  var division = document.createElement('span');
  division.textContent = ' / ';
  var growMultiply = document.createElement('span');
  growMultiply.textContent = ' * ';
  var equals = document.createElement('span');
  equals.textContent = ' = ';
  var openParens = document.createElement('span');
  openParens.textContent = '(';
  var closeParens = document.createElement('span');
  closeParens.textContent = ') ';

  var flexulatorContainer = document.createElement('section');
  flexulatorContainer.setAttribute('class', 'item-flexulations');

  var growContainer = document.createElement('section');
  growContainer.setAttribute('class', 'flex-grow-flexulations');

  var growParagraph = document.createElement('p');

  var growItemValue = document.createElement('span');
  growItemValue.setAttribute('class', 'grow-item-value');

  var growTotalValue = document.createElement('span');
  growTotalValue.setAttribute('class', 'grow-total');

  var flexRemainingSpace = document.createElement('span');
  flexRemainingSpace.setAttribute('class', 'flex-remaining-space');

  var growItemSpace = document.createElement('span');
  growItemSpace.setAttribute('class', 'grow-item-space');

  growParagraph.appendChild(growItemValue);
  growParagraph.appendChild(division);
  growParagraph.appendChild(growTotalValue);
  growParagraph.appendChild(growMultiply);
  growParagraph.appendChild(flexRemainingSpace);
  growParagraph.appendChild(equals);
  growParagraph.appendChild(growItemSpace);
  growContainer.appendChild(growParagraph);
  flexulatorContainer.appendChild(growContainer);


  // Shrink section
  var division = document.createElement('span');
  division.textContent = ' / ';
  var shrinkMultiply = document.createElement('span');
  shrinkMultiply.textContent = ' * ';
  var shrinkMultiplyTwo = document.createElement('span');
  shrinkMultiplyTwo.textContent = ' * ';
  var shrinkEqualsOne = document.createElement('span');
  shrinkEqualsOne.textContent = ' = ';
  var shrinkEqualsTwo = document.createElement('span');
  shrinkEqualsTwo.textContent = ' = ';
  var shrinkEqualsThree = document.createElement('span');
  shrinkEqualsThree.textContent = ' = ';
  var shrinkOpenParens = document.createElement('span');
  shrinkOpenParens.textContent = '(';
  var shrinkCloseParens = document.createElement('span');
  shrinkCloseParens.textContent = ') ';

  var shrinkContainer = document.createElement('section');
  shrinkContainer.setAttribute('class', 'flex-shrink-flexulations');

  var shrinkParagraph = document.createElement('p');

  var shrinkItemValue = document.createElement('span');
  shrinkItemValue.setAttribute('class', 'shrink-item-value');

  var shrinkItemBasis = document.createElement('span');
  shrinkItemBasis.setAttribute('class', 'shrink-item-basis');

  var totalFlexBasis = document.createElement('span');
  totalFlexBasis.setAttribute('class', 'total-flex-basis');

  var flexRemainingSpace = document.createElement('span');
  flexRemainingSpace.setAttribute('class', 'flex-remaining-space');

  var shrinkValue = document.createElement('span');
  shrinkValue.setAttribute('class', 'shrink-value');

  // use flexRemainingSpace from grow section

  var shrinkFlexValue = document.createElement('span');
  shrinkFlexValue.setAttribute('class', 'shrink-flex-value');

  shrinkParagraph.appendChild(shrinkOpenParens);
  shrinkParagraph.appendChild(shrinkItemValue);
  shrinkParagraph.appendChild(shrinkMultiply);
  shrinkParagraph.appendChild(shrinkItemBasis);
  shrinkParagraph.appendChild(shrinkCloseParens);
  shrinkParagraph.appendChild(division);
  shrinkParagraph.appendChild(totalFlexBasis);
  shrinkParagraph.appendChild(shrinkEqualsOne);
  shrinkParagraph.appendChild(shrinkValue);
  shrinkParagraph.appendChild(shrinkMultiplyTwo);
  shrinkParagraph.appendChild(flexRemainingSpace);
  shrinkParagraph.appendChild(shrinkEqualsTwo);
  shrinkParagraph.appendChild(shrinkFlexValue);
  shrinkContainer.appendChild(shrinkParagraph);
  flexulatorContainer.appendChild(shrinkContainer);


  flexItem.appendChild(itemWidth);
  flexItem.appendChild(flexValues);
  flexItem.appendChild(flexulatorContainer);
  flexItem.appendChild(button);

  // add events
  updateFlexItem(flexItem);
  removeFlexItem(flexItem);

  // add to flex-container
  flexContainer.appendChild(flexItem);

  updateItemWidth();
  updateTotalFlexBasis();
  updateTotalFlexGrow();
  setFlexItemGrow();
  updateGrowItemSpace();
  setFlexItemShrink();

}

function updateFlexItem(item) {

  item.addEventListener('click', function (event) {
    var parentItem = event.target.parentElement.parentElement.parentElement;
    var growValue;
    var shrinkValue;
    if (event.target.matches('.increment-grow-value')) {
      growValue = event.target.nextElementSibling.value;
      ++growValue;
      event.target.nextElementSibling.value = growValue;
      parentItem.style.flexGrow = growValue;
    } else if (event.target.matches('.decrement-grow-value')) {
      growValue = event.target.previousElementSibling.value;
      --growValue;
      event.target.previousElementSibling.value = growValue;
      parentItem.style.flexGrow = growValue;
    } else if (event.target.matches('.increment-shrink-value')) {
      shrinkValue = event.target.nextElementSibling.value;
      ++shrinkValue;
      event.target.nextElementSibling.value = shrinkValue;
      parentItem.style.flexShrink = shrinkValue;
    } else if (event.target.matches('.decrement-shrink-value')) {
      shrinkValue = event.target.previousElementSibling.value;
      --shrinkValue;
      event.target.previousElementSibling.value = shrinkValue;
      parentItem.style.flexShrink = shrinkValue;
    }
    runChanges();
  });

  item.addEventListener('input', function (event) {
    // event.stopPropagation();
    var parent = event.target.parentElement.parentElement.parentElement;
    if (event.target.matches('.item-grow')) {
      parent.style.flexGrow = event.target.value;
    } else if (event.target.matches('.item-shrink')) {
      parent.style.flexShrink = event.target.value;
    } else if (event.target.matches('.item-basis')) {
      parent.style.flexBasis = event.target.value + 'px';
    }
    runChanges();
  });

}

function tabKeyUpdate(key) {
  if (key.keyCode == 9) {
    runChanges();
  }
}

window.addEventListener('keyup', tabKeyUpdate);


function removeFlexItem(item) {
  item.addEventListener('click', function(event) {
    var sibling = event.target.parentElement.previousElementSibling || event.target.parentElement.nextElementSibling;
    if (event.target.matches('.remove-item-button')) {
      event.target.parentElement.remove();
      sibling.click();
    }
    runChanges();
  });
};

function runChanges() {
  updateRemainingSpace();
  updateTotalFlexGrow();
  setFlexItemGrow();
  updateGrowItemSpace();
  updateTotalFlexBasis();
  setFlexItemShrink();

}

function updateTotalFlexBasis() {
  // all set
  var totalFlexBasis = 0;
  getFlexItems().forEach(function(item) {
    totalFlexBasis += parseInt(item.style.flexBasis);
  });

  showTotalFlexBasis.textContent = totalFlexBasis;

  var totalFlexBasisElements = Array.prototype.slice.call(document.getElementsByClassName('total-flex-basis'));
  totalFlexBasisElements.forEach(function(element) {
    element.textContent = totalFlexBasis;
  });

  totalRemainingSpace();
}
updateTotalFlexBasis();

function updateTotalFlexGrow() {
  // all set
  var totalFlexGrow = 0;
  var flexGrowElements = Array.prototype.slice.call(document.getElementsByClassName('grow-total'));

  // reads
  getFlexItems().forEach(function(item) {
    totalFlexGrow += parseInt(item.style.flexGrow);
  });

  // writes
  flexGrowElements.forEach(function(element) {
    element.textContent = totalFlexGrow;
  });

}
updateTotalFlexGrow();

// update the grow value in the formula when updated
function setFlexItemGrow() {
  getFlexItems().forEach(function(element) {

    // reads
    var itemGrowValue = 0;
    itemGrowValue = element.style.flexGrow;

    // writes
    element.children[2].firstElementChild.firstElementChild.firstElementChild.textContent = itemGrowValue;
  });
}
setFlexItemGrow();


// update the formula with item grow space
function updateGrowItemSpace() {

  var itemGrow;
  var growTotal;
  var growFraction;
  var remainingSpace;
  var totalSpace = document.getElementsByClassName('container-width')[0];

  getFlexItems().forEach(function (item) {

    // reads
    itemGrow = item.children[2].firstElementChild.firstElementChild.children[0].textContent;
    growTotal = item.children[2].firstElementChild.firstElementChild.children[2].textContent;
    remainingSpace = item.children[2].firstElementChild.firstElementChild.children[4].textContent;

    // writes
    growFraction = parseInt(itemGrow) / parseInt(growTotal);
    item.children[2].firstElementChild.firstElementChild.lastElementChild.textContent = parseInt(growFraction * parseInt(remainingSpace), 10);
  });

}

updateGrowItemSpace();

function setFlexItemShrink() {
  var totalBasis = document.getElementById('total-flex-basis');
  getFlexItems().forEach(function (element) {

    // reads
    var itemShrinkValue = 0;
    var itemBasis = 0;
    var remainingSpace = element.children[2].lastElementChild.firstElementChild.children[10].textContent;
    itemShrinkValue = element.style.flexShrink;
    itemBasis = element.style.flexBasis;

    // writes
    var shrinkValue = parseInt(itemShrinkValue, 10) * parseInt(itemBasis, 10);
    var shrinkFactor = shrinkValue / parseInt(totalBasis.textContent, 10);
    element.children[2].lastElementChild.firstElementChild.children[1].textContent = itemShrinkValue;
    element.children[2].lastElementChild.firstElementChild.children[3].textContent = parseInt(itemBasis);
    element.children[2].lastElementChild.firstElementChild.children[8].textContent = shrinkFactor.toPrecision(2);
    element.children[2].lastElementChild.firstElementChild.children[12].textContent = parseInt(shrinkFactor * remainingSpace, 10);
  });

}

setFlexItemShrink();

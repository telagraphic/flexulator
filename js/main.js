// get container and item values
var flexContainer = document.getElementById('flex-container');
var addFlexItemButton = document.getElementById('add-flex-item-button');
var showTotalFlexBasis = document.getElementById('total-flex-basis');
var flexContainerWidth = Array.prototype.slice.call(document.getElementsByClassName('container-width'));

function getFlexItems() {
  return Array.prototype.slice.call(document.getElementsByClassName('flex-item'));
}


// on window load, get values
updateContainerWidth();
totalRemainingSpace();
updateItemWidth();
updateGrowItemSpace();


addFlexItemButton.addEventListener('click', function (event) {
  event.preventDefault();
  addFlexItem();
});

// window.addEventListener('resize', function (event) {
//   updateContainerWidth();
//   totalRemainingSpace();
//   updateItemWidth();
//   updateGrowItemSpace();
//   setFlexItemShrink();
// });



window.addEventListener('resize', _.debounce(resizeFunctions, 1000));

function resizeFunctions() {
  console.log("debouncing");
  updateContainerWidth();
  totalRemainingSpace();
  updateItemWidth();
  updateGrowItemSpace();
  setFlexItemShrink();
}

function updateContainerWidth() {
  // all set
  flexContainerWidth.forEach(function (item) {
    item.textContent = flexContainer.clientWidth;
  });
}

function totalRemainingSpace() {
  // all set
  var containerWidth = document.getElementById('container-width');
  var displayRemainingSpace = Array.prototype.slice.call(document.getElementsByClassName('flex-remaining-space'));
  var remainingSpace = parseInt(containerWidth.textContent) - parseInt(showTotalFlexBasis.textContent);

  displayRemainingSpace.forEach(function (item) {
    item.textContent = remainingSpace;
  });
}

// Flex Items
function updateItemWidth() {
  // read
  var reads = [];
  var items = getFlexItems();

  items.forEach(function (item) {
    fastdom.measure(function () {
      var width = item.offsetWidth;
      fastdom.mutate(function () {
        item.firstElementChild.textContent = width;
      });
    });
  });
}


function addFlexItem() {
  // get item count
  var flexItemCount = Array.prototype.slice.call(flexContainer.childNodes);
  var flexitems = [];
  flexItemCount.forEach(function (element) {
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

  var growInput = document.createElement('input');
  growInput.setAttribute('type', 'number');
  growInput.setAttribute('class', 'item-grow');
  growInput.setAttribute('value', grow);

  var shrinkInput = document.createElement('input');
  shrinkInput.setAttribute('type', 'number');
  shrinkInput.setAttribute('class', 'item-shrink');
  shrinkInput.setAttribute('value', shrink);

  var basisInput = document.createElement('input');
  basisInput.setAttribute('type', 'text');
  basisInput.setAttribute('class', 'item-basis');
  basisInput.setAttribute('value', basis);

  flexValues.appendChild(growInput);
  flexValues.appendChild(shrinkInput);
  flexValues.appendChild(basisInput);

  // flexItem.style.display = 'flex';
  flexItem.style.flexGrow = grow;
  flexItem.style.flexShrink = shrink;
  flexItem.style.flexBasis = basis + 'px';


  var itemWidth = document.createElement('h4');
  itemWidth.setAttribute('class', 'item-width');
  itemWidth.textContent = basis;

  var button = document.createElement('button');
  button.setAttribute('class', 'remove-item-button');
  button.textContent = 'X';

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
  flexItem.appendChild(button);
  flexItem.appendChild(flexulatorContainer);


  // add to flex-container
  flexContainer.appendChild(flexItem);

  updateItemWidth();
  updateTotalFlexBasis();
  updateTotalFlexGrow();
  setFlexItemGrow();
  updateGrowItemSpace();
  editFlexItem();
  setFlexItemShrink();
  removeFlexItem();
};

function editFlexItem() {
  getFlexItems().forEach(function (item) {
    item.addEventListener('input', function (event) {
      var parent = event.target.parentElement.parentElement;
      if (event.target.matches('.item-grow')) {
        parent.style.flexGrow = event.target.value;
      } else if (event.target.matches('.item-shrink')) {
        parent.style.flexShrink = event.target.value;
      } else if (event.target.matches('.item-basis')) {
        parent.style.flexBasis = event.target.value + 'px';
      }

      // move out of loop?
      updateTotalFlexBasis();
      updateTotalFlexGrow();
      setFlexItemGrow();
      updateGrowItemSpace();
      setFlexItemShrink();
    });
  });

}

editFlexItem();

function removeFlexItem() {
  getFlexItems().forEach(function (item) {
    item.addEventListener('click', function (event) {
      if (event.target.matches('.remove-item-button')) {
        event.target.parentElement.remove();
      }
      updateItemWidth();
      updateTotalFlexGrow();
      setFlexItemGrow();
      updateGrowItemSpace();
    });
  });
};
removeFlexItem();

function updateTotalFlexBasis() {
  // all set
  var totalFlexBasis = 0;
  getFlexItems().forEach(function (item) {
    totalFlexBasis += parseInt(item.style.flexBasis);
  });

  showTotalFlexBasis.textContent = totalFlexBasis;

  var totalFlexBasisElements = Array.prototype.slice.call(document.getElementsByClassName('total-flex-basis'));
  totalFlexBasisElements.forEach(function (element) {
    requestAnimationFrame(function () {
      element.textContent = totalFlexBasis;
    });

  });

  totalRemainingSpace();
}
updateTotalFlexBasis();

function updateTotalFlexGrow() {
  // all set
  var totalFlexGrow = 0;
  var flexGrowElements = Array.prototype.slice.call(document.getElementsByClassName('grow-total'));

  fastdom.measure(function () {
    // reads
    getFlexItems().forEach(function (item) {
      totalFlexGrow += parseInt(item.style.flexGrow);
    });

    fastdom.mutate(function () {
      // writes
      flexGrowElements.forEach(function (element) {
        element.textContent = totalFlexGrow;
      });
    });
  });

}
updateTotalFlexGrow();

// update the grow value in the formula when updated
function setFlexItemGrow() {
  getFlexItems().forEach(function (element) {
    fastdom.measure(function () {
      var flexGrow = element.style.flexGrow;
      fastdom.mutate(function () {
        element.children[3].firstElementChild.firstElementChild.firstElementChild.textContent = flexGrow;
      });
    });
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
    fastdom.measure(function () {
      itemGrow = item.children[3].firstElementChild.firstElementChild.children[0].textContent;
      growTotal = item.children[3].firstElementChild.firstElementChild.children[2].textContent;
      remainingSpace = item.children[3].firstElementChild.firstElementChild.children[4].textContent;
      growFraction = parseInt(itemGrow) / parseInt(growTotal);
      fastdom.mutate(function () {
        item.children[3].firstElementChild.firstElementChild.lastElementChild.textContent = parseInt(growFraction * parseInt(remainingSpace), 10);
      })
    });
  });
}

updateGrowItemSpace();


function setFlexItemShrink() {
  var totalBasis = document.getElementById('total-flex-basis');
  getFlexItems().forEach(function (element) {

    fastdom.measure(function () {
      var itemShrinkValue = 0;
      var itemBasis = 0;
      var remainingSpace = element.children[3].lastElementChild.firstElementChild.children[10].textContent;
      itemShrinkValue = element.style.flexShrink;
      itemBasis = element.style.flexBasis;
      var shrinkValue = parseInt(itemShrinkValue, 10) * parseInt(itemBasis, 10);
      var shrinkFactor = shrinkValue / parseInt(totalBasis.textContent, 10);
      fastdom.mutate(function () {
        element.children[3].lastElementChild.firstElementChild.children[1].textContent = itemShrinkValue;
        element.children[3].lastElementChild.firstElementChild.children[3].textContent = parseInt(itemBasis);
        element.children[3].lastElementChild.firstElementChild.children[8].textContent = shrinkFactor.toPrecision(2);
        element.children[3].lastElementChild.firstElementChild.children[12].textContent = parseInt(shrinkFactor * remainingSpace, 10);
      });
    })
  });

}

setFlexItemShrink();

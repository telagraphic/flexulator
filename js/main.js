// get container and item values
var flexContainer = document.getElementById('flex-container');
var addFlexItemButton = document.getElementById('add-flex-item-button');

// get fields on ui to update
var flexContainerWidth = document.getElementById('container-width');

// on window load, get values
updateContainerWidth();
updateItemWidth();

// document.addEventListener('DOMContentLoaded', function (event) {
//   updateContainerWidth();
// });

addFlexItemButton.addEventListener('click', function (event) {
  event.preventDefault();
  addFlexItem();
});

// on resize, update values
window.addEventListener('resize', function (event) {
  updateContainerWidth();
  updateItemWidth();
});

function updateContainerWidth() {
  flexContainerWidth.textContent = flexContainer.clientWidth;
};

// Flex Items

function updateItemWidth() {
  var flexItems = Array.prototype.slice.call(document.getElementsByClassName('flex-item'));
  flexItems.forEach(function (item) {
    item.firstElementChild.textContent = item.offsetWidth;
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
  itemWidth.textContent = '100';

  var button = document.createElement('button');
  button.setAttribute('class', 'remove-item-button');
  button.textContent = 'X';

  flexItem.appendChild(itemWidth);
  flexItem.appendChild(flexValues);
  flexItem.appendChild(button);


  // add to flex-container
  flexContainer.appendChild(flexItem);

  updateItemWidth();
  editFlexItem();
  removeFlexItem();
};

function editFlexItem() {

  var flexItems = Array.prototype.slice.call(document.getElementsByClassName('flex-item'));
  flexItems.forEach(function (item) {
    item.addEventListener('input', function (event) {
      var parent = event.target.parentElement.parentElement;
      if (event.target.matches('.item-grow')) {
        parent.style.flexGrow = event.target.value;
      } else if (event.target.matches('.item-shrink')) {
        parent.style.flexShrink = event.target.value;
      } else if (event.target.matches('.item-basis')) {
        parent.style.flexBasis = event.target.value + 'px';
      }

      updateItemWidth();
    });
  });

}

function removeFlexItem() {

  var flexItems = Array.prototype.slice.call(document.getElementsByClassName('flex-item'));
  flexItems.forEach(function (item) {
    console.log(item);
    item.addEventListener('click', function (event) {
      // var parent = event.target.parentElement.parentElement;
      if (event.target.matches('.remove-item-button')) {
        event.target.parentElement.remove();
      }

      updateItemWidth();
    });
  });

}

editFlexItem();
removeFlexItem();

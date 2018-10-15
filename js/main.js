// get container and item values
var flexContainer = document.getElementById('flex-container');
var flexItem1 = document.getElementById('flex-item');
var addFlexItemButton = document.getElementById('add-flex-item-button');

// get fields on ui to update
var flexContainerWidth = document.getElementById('container-width');

// on window load, get values

document.addEventListener('DOMContentLoaded', function (event) {
  updateContainerWidth();
});

addFlexItemButton.addEventListener('click', function (event) {
  event.preventDefault();
  addFlexItem();
});

// on resize, update values
window.addEventListener('resize', function (event) {
  updateContainerWidth();
});

function updateContainerWidth() {
  flexContainerWidth.textContent = flexContainer.clientWidth;
}

function updateFlexItemWidth() {

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

  console.log(flexitems.length);

  // get flex styles
  var grow, shrink, basis;

  grow = document.getElementById('flex-grow').value;
  shrink = document.getElementById('flex-shrink').value;
  basis = document.getElementById('flex-basis').value;

  // create new element with flex values

  var flexItem = document.createElement('section');
  flexItem.setAttribute('class', 'flex-item');
  flexItem.setAttribute('id', 'flex-item-' + length);
  flexItem.style.display = 'flex';
  flexItem.style.flexGrow = grow;
  flexItem.style.flexShrink = shrink;
  flexItem.style.flexBasis = basis;
  flexItem.textContent = 'flex: ' + grow + ' ' + shrink + ' ' + basis;

  // add to flex-container
  flexContainer.appendChild(flexItem);
}

function removeFlexItem() {
  // get flex item clicked and remove

  //

}

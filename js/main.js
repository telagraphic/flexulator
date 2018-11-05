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
    console.log(item);
    item.lastElementChild.textContent = item.offsetWidth;
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
  console.log(basis);

  // create new element with flex values

  var flexItem = document.createElement('section');
  var itemContent = document.createElement('h4');
  itemContent.setAttribute('class', 'item-content');
  itemContent.textContent = 'flex: ' + grow + ' ' + shrink + ' ' + basis;

  var itemWidth = document.createElement('h4');
  itemWidth.setAttribute('class', 'item-width');
  itemWidth.textContent = '100';

  flexItem.setAttribute('class', 'flex-item');
  flexItem.setAttribute('id', 'flex-item-' + length);
  // flexItem.style.display = 'flex';
  flexItem.style.flexGrow = grow;
  flexItem.style.flexShrink = shrink;
  flexItem.style.flexBasis = basis + 'px';
  flexItem.appendChild(itemContent);
  flexItem.appendChild(itemWidth);

  // add to flex-container
  flexContainer.appendChild(flexItem);

  updateItemWidth();
}

function removeFlexItem() {
  // get flex item clicked and remove

  //

}

import {FlexItem} from './flexItem.js';
import {select, selectAll, selectClassName} from './selectorWrappers.js';


export class FlexContainer {
  container;
  width = 0;
  basisTotal = 0;
  remainingSpace = 0;
  growTotal = 0;
  shrinkBasisTotal = 0;
  shrinkBasisTotal = 0;
  flexItemElements = [];
  flexItems = [];


  constructor(element) {
    this.setup();
    let flexContainer = select(element);
    this.width = flexContainer.clientWidth;
    this.container = flexContainer;
    this.updateWidth();
  }

  get width() {
    return this.width;
  }

  set width(width) {
    this.width = width;
  }

  get basisTotal() {
    return this.basisTotal;
  }

  set basisTotal(basisTotal) {
    this.basisTotal = basisTotal;
  }

  get remainingSpace() {
    return this.remainingSpace;
  }

  set remainingSpace(remainingSpace) {
    this.remainingSpace = remainingSpace;
  }

  get growTotal() {
    return this.growTotal;
  }

  set growTotal(growTotal) {
    this.growTotal = growTotal;
  }

  get shrinkBasisTotal() {
    return this.shrinkBasisTotal;
  }

  set shrinkBasisTotal(shrinkBasisTotal) {
    this.shrinkBasisTotal = shrinkBasisTotal;
  }

  get shrinkBasisTotal() {
    return this.shrinkBasisTotal;
  }

  set shrinkBasisTotal(shrinkBasisTotal) {
    this.shrinkBasisTotal = shrinkBasisTotal;
  }

  setup() {
    this.getFlexItems();
    this.flexItemElements.forEach(element => { this.createFlexItem(element) });
  }



  updateWidth() {
    let containerWidth = this.width;
    let container = this.container;
    window.addEventListener('resize', function(event) {
      containerWidth = container.clientWidth;
      console.log(containerWidth);
    })
  }

  getFlexItems() {
    this.flexItemElements = [...selectAll('.flex-item')];
  }

  createFlexItem(element) {
    this.flexItems.push(new FlexItem(element.style.flexGrow, element.style.flexShrink, element.style.flexBasis));
  }

  readFlexItems() {
    this.flexItems.forEach(item => { console.log(item) });
  }

}

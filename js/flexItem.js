export class FlexItem {

  id = 0;
  
  style = {
    grow: 0,
    shrink: 0,
    basis: 0
  }

  form = {
    width: 0,
    grow: 0,
    shrink: 0,
    basis: 0
  }

  formula = {
    grow: {
      width: 0,
      totalBasis: 0,
      remainingSpace: 0,
      growItem: 0,
      growTotal: 0,
      growSpace: 0,
      itemBasis: 0,
      growWidth: 0
    },
    shrink: {
      width: 0,
      totalFlexBasis: 0,
      remainingSpace: 0,
      shrinkItem: 0,
      itemBasis: 0,
      shrinkTotalBasis: 0,
      shrinkFactor: 0,
      shrinkWidth: 0
    }

  }

  constructor(grow, shrink, basis) {
    this.style.grow = grow;
    this.style.shrink = shrink;
    this.style.basis = basis;
  }

  set styleGrow(grow) {
    this.style.grow = grow;
  }

  set styleShrink(shrink) {
    this.style.shrink = shrink;
  }

  set styleBasis(basis) {
    this.style.basis = basis;
  }

  get style() {
    return {
      grow: this.style.grow,
      shrink: this.style.shrink,
      basis: this.style.basis,
    }
  }

}

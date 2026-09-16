/**
 * @typedef {object} FlexItem
 * @property {string} id
 * @property {number} grow
 * @property {number} shrink
 * @property {number} basis
 */

/**
 * @typedef {object} ContainerSnapshot
 * @property {number} width
 * @property {number} totalBasis
 * @property {number} remainingSpace
 * @property {number} totalGrow
 * @property {number} totalShrinkBasis
 */

/**
 * @typedef {object} ItemSnapshot
 * @property {string} id
 * @property {number} growShare
 * @property {number} allocatedSpace
 * @property {number} shrinkProduct
 * @property {number} shrinkFactor
 * @property {number} shrinkAmount
 * @property {number} growWidth
 * @property {number} shrinkWidth
 */

/**
 * Add up one numeric field from every Flex Item.
 *
 * @param {FlexItem[]} items
 * @param {(item: FlexItem) => number} pick
 * @returns {number}
 */
function sum(items, pick) {
  return items.reduce((total, item) => total + pick(item), 0)
}

/**
 * Return part / total, or 0 when total is 0 so empty shares are not NaN.
 *
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
function share(part, total) {
  if (total === 0) {
    return 0
  }
  return part / total
}

/**
 * Compute Remaining Space and both grow and shrink formula fields.
 * Derived numbers are throwaway: they are not stored on the Flex Item.
 *
 * @param {number} containerWidth Flex Container width in pixels
 * @param {FlexItem[]} items
 * @returns {{ container: ContainerSnapshot, items: ItemSnapshot[] }}
 */
export function calculateFlexValues(containerWidth, items) {
  const width = containerWidth
  const totalBasis = sum(items, (item) => item.basis)
  const remainingSpace = width - totalBasis
  const totalGrow = sum(items, (item) => item.grow)
  const totalShrinkBasis = sum(items, (item) => item.shrink * item.basis)

  return {
    container: {
      width,
      totalBasis,
      remainingSpace,
      totalGrow,
      totalShrinkBasis,
    },
    items: items.map((item) => {
      const growShare = share(item.grow, totalGrow)
      const allocatedSpace = Math.round(growShare * remainingSpace)
      const shrinkProduct = item.shrink * item.basis
      const shrinkFactor = share(shrinkProduct, totalShrinkBasis)
      const shrinkAmount = Math.round(shrinkFactor * remainingSpace)

      return {
        id: item.id,
        growShare,
        allocatedSpace,
        shrinkProduct,
        shrinkFactor,
        shrinkAmount,
        growWidth: item.basis + allocatedSpace,
        shrinkWidth: item.basis + shrinkAmount,
      }
    }),
  }
}

function sum(items, pick) {
  return items.reduce((total, item) => total + pick(item), 0)
}

function share(part, total) {
  return total === 0 ? 0 : part / total
}

/**
 * @param {number} containerWidth
 * @param {{ id: string, grow: number, shrink: number, basis: number }[]} items
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

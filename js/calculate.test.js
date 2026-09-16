import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calculateFlexValues } from './calculate.js'

function item(id, grow, shrink, basis) {
  return { id, grow, shrink, basis }
}

test('three equal items: remaining space and allocated space', () => {
  const items = [
    item('a', 1, 1, 100),
    item('b', 1, 1, 100),
    item('c', 1, 1, 100),
  ]
  const snapshot = calculateFlexValues(1440, items)

  assert.equal(snapshot.container.width, 1440)
  assert.equal(snapshot.container.totalBasis, 300)
  assert.equal(snapshot.container.remainingSpace, 1140)
  assert.equal(snapshot.container.totalGrow, 3)
  assert.equal(snapshot.container.totalShrinkBasis, 300)

  assert.equal(snapshot.items.length, 3)
  for (const row of snapshot.items) {
    assert.equal(row.growShare, 1 / 3)
    assert.equal(row.allocatedSpace, 380)
    assert.equal(row.growWidth, 480)
    assert.equal(row.shrinkProduct, 100)
    assert.equal(row.shrinkFactor, 1 / 3)
    assert.equal(row.shrinkAmount, 380)
    assert.equal(row.shrinkWidth, 480)
  }
  assert.equal(snapshot.items[0].id, 'a')
})

test('remaining space negative: shrink amount reduces basis', () => {
  const items = [
    item('a', 1, 1, 500),
    item('b', 1, 1, 500),
    item('c', 1, 1, 500),
  ]
  const snapshot = calculateFlexValues(1440, items)

  assert.equal(snapshot.container.totalBasis, 1500)
  assert.equal(snapshot.container.remainingSpace, -60)
  assert.equal(snapshot.container.totalShrinkBasis, 1500)

  for (const row of snapshot.items) {
    assert.equal(row.shrinkFactor, 1 / 3)
    assert.equal(row.shrinkAmount, -20)
    assert.equal(row.shrinkWidth, 480)
    assert.equal(row.allocatedSpace, -20)
    assert.equal(row.growWidth, 480)
  }
})

test('single item takes all remaining space', () => {
  const snapshot = calculateFlexValues(800, [item('only', 1, 1, 200)])

  assert.equal(snapshot.container.remainingSpace, 600)
  assert.equal(snapshot.container.totalGrow, 1)
  assert.equal(snapshot.items[0].growShare, 1)
  assert.equal(snapshot.items[0].allocatedSpace, 600)
  assert.equal(snapshot.items[0].growWidth, 800)
})

test('uneven grow shares leftover space', () => {
  const items = [
    item('a', 2, 1, 100),
    item('b', 1, 1, 100),
    item('c', 1, 1, 100),
  ]
  const snapshot = calculateFlexValues(500, items)

  assert.equal(snapshot.container.remainingSpace, 200)
  assert.equal(snapshot.container.totalGrow, 4)
  assert.equal(snapshot.items[0].growShare, 0.5)
  assert.equal(snapshot.items[0].allocatedSpace, 100)
  assert.equal(snapshot.items[1].allocatedSpace, 50)
  assert.equal(snapshot.items[2].allocatedSpace, 50)
  assert.equal(snapshot.items[0].growWidth, 200)
})

test('uneven shrink is weighted by shrink times basis', () => {
  const items = [
    item('wide', 1, 1, 400),
    item('narrow', 1, 1, 100),
  ]
  const snapshot = calculateFlexValues(400, items)

  assert.equal(snapshot.container.remainingSpace, -100)
  assert.equal(snapshot.container.totalShrinkBasis, 500)
  assert.equal(snapshot.items[0].shrinkProduct, 400)
  assert.equal(snapshot.items[0].shrinkFactor, 0.8)
  assert.equal(snapshot.items[0].shrinkAmount, -80)
  assert.equal(snapshot.items[0].shrinkWidth, 320)
  assert.equal(snapshot.items[1].shrinkProduct, 100)
  assert.equal(snapshot.items[1].shrinkFactor, 0.2)
  assert.equal(snapshot.items[1].shrinkAmount, -20)
  assert.equal(snapshot.items[1].shrinkWidth, 80)
})

test('zero total grow and zero total shrink basis yield zeros not NaN', () => {
  const snapshot = calculateFlexValues(400, [
    item('a', 0, 0, 100),
    item('b', 0, 0, 100),
  ])

  assert.equal(snapshot.container.totalGrow, 0)
  assert.equal(snapshot.container.totalShrinkBasis, 0)
  assert.equal(snapshot.container.remainingSpace, 200)

  for (const row of snapshot.items) {
    assert.equal(row.growShare, 0)
    assert.equal(row.allocatedSpace, 0)
    assert.equal(row.growWidth, 100)
    assert.equal(row.shrinkFactor, 0)
    assert.equal(row.shrinkAmount, 0)
    assert.equal(row.shrinkWidth, 100)
    assert.equal(Number.isNaN(row.growShare), false)
    assert.equal(Number.isNaN(row.shrinkFactor), false)
  }
})

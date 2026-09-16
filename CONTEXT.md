# Flexulator

A visual calculator for how a flex container distributes leftover or missing space among its items.

## Language

**Flex Container**:
The parent whose inner width is the space being split among items.
_Avoid_: parent, wrapper, dashboard

**Flex Item**:
A child of the Flex Container, defined by grow, shrink, and basis, with a stable id for its lifetime. Canonical values live in a list of data records, not in the DOM.
_Avoid_: flex child object, newFlexItemObject, card

**Grow**:
A Flex Item's share of leftover space when total basis is less than the Flex Container width.

**Shrink**:
A Flex Item's share of overflow when total basis is greater than the Flex Container width.

**Basis**:
A Flex Item's starting width in pixels, before grow or shrink is applied.
_Avoid_: width (that word is reserved for the laid-out result)

**Remaining Space**:
Flex Container width minus the sum of all items' Basis. Positive means leftover space (grow). Negative means overflow (shrink).

**Measured Width**:
The Flex Item's actual `clientWidth` after the browser has laid out `flex: grow shrink basis`. A reading from the DOM, not an input.

**Item Card**:
The on-screen column that shows one Flex Item: its inputs, Measured Width, and formula.
_Avoid_: observed child, child object, flex child

**Grow Demo / Shrink Demo**:
A preset that sets every Flex Item's Basis so Remaining Space is positive (grow) or negative (shrink). Not a calculation mode.
_Avoid_: grow mode, shrink mode, toggle

## Relationships

- A **Flex Container** contains one or more **Flex Items** (never zero)
- Each **Flex Item** is shown by one **Item Card**, matched by id
- Removing a **Flex Item** destroys its **Item Card**; a new item gets a new id and a new card
- Initial **Flex Items** are records in state; Item Cards are cloned from a single template, not hard-coded in the page
- **Remaining Space** is derived from **Flex Container** width and every item's **Basis**
- The formula shown on an **Item Card** follows the sign of **Remaining Space** (positive → grow, negative → shrink)
- **Grow Demo** and **Shrink Demo** only change **Basis**; they do not switch which arithmetic exists
- **Measured Width** is read from the DOM after grow, shrink, and basis have been applied as CSS

## Example dialogue

> **Dev:** "Does the SHRINK button switch the calculator into shrink mode?"
> **Domain expert:** "No. It raises every Basis until Remaining Space is negative. The layout shrinks because the numbers overflow, not because a mode flag flipped."

## Flagged ambiguities

- "width" was used for both **Basis** and **Measured Width** — resolved: basis is the input; measured width is the layout result.
- "child" / "flex child" was used for both the data record and the DOM card — resolved: **Flex Item** is the record; the **Item Card** is a view of it.
- "mode" was used as if grow/shrink were a calculation toggle — resolved: there is no mode. Remaining Space picks the algorithm; the buttons are **Grow Demo** / **Shrink Demo**.
- JS property names vs CSS `flex-grow` — resolved: records use **Grow** / **Shrink** / **Basis**; CSSOM names are assigned only in `applyFlexStyles`. Map: [docs/naming.md](docs/naming.md).

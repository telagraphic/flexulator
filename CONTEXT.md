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
The Flex Item's final width from the snapshot: `growWidth` when Remaining Space is positive or zero, `shrinkWidth` when it is negative. The same integer as that Item Card's final-width line. Not an input, and not a `clientWidth` sample.

**Item Card**:
The on-screen column that shows one Flex Item: its inputs, Measured Width, and formula.
_Avoid_: observed child, child object, flex child

**Grow Demo / Shrink Demo**:
A preset that sets every Flex Item's Basis so Remaining Space is positive (grow) or negative (shrink). Not a calculation mode.
_Avoid_: grow mode, shrink mode, toggle

**Add form**:
Draft Grow / Shrink / Basis plus Add. Independent of any Flex Item until submit.
_Avoid_: control panel, flexulator form

**Formula row**:
One line of an Item Card formula: the equation, then a single result label under the whole line.
_Avoid_: flex child, calculation step

**Formula readout**:
The surface for one Formula row. The same equation, with the numbers on the first line and an operand name under each number, wide enough to show the full line. It uses that Item Card's numbers and does not change the row. Hover is the main way to open it. Keyboard focus and a tap also open it. Operand names match the teaching panel where the equations match. The shrink-factor row names each number on the card.
_Avoid_: hover context, tooltip, teaching step

**Shrink Amount**:
The signed pixels this Flex Item gives up. Negative when Remaining Space is negative. Final width is Basis plus Shrink Amount.
_Avoid_: amount to subtract

## Relationships

- A **Flex Container** contains one or more **Flex Items** (never zero)
- Each **Flex Item** is shown by one **Item Card**, matched by id
- Removing a **Flex Item** destroys its **Item Card**; a new item gets a new id and a new card
- Initial **Flex Items** are records in state; Item Cards are cloned from a single template, not hard-coded in the page
- **Remaining Space** is derived from **Flex Container** width and every item's **Basis**
- The formula shown on an **Item Card** follows the sign of **Remaining Space** (positive → grow, negative → shrink)
- **Grow Demo** and **Shrink Demo** only change **Basis**; they do not switch which arithmetic exists
- **Measured Width** is the snapshot final width (`growWidth` or `shrinkWidth`), chosen by the sign of **Remaining Space**
- The **Add form** drafts Grow / Shrink / Basis; submit creates a new **Flex Item**. It is never a live Item Card
- **Grow Demo** / **Shrink Demo** sit outside the **Add form**; they only change **Basis** on existing **Flex Items**
- Each **Formula row** has one **Formula readout**
- A **Formula readout** shows that **Item Card**'s numbers. The teaching panel still shows only the first Flex Item
- Opening a **Formula readout** does not change the **Item Card**
- Hover is the main way to open a **Formula readout**. A tap opens the same readout
- **Formula rows** are not in the tab order. Tab stops on an **Item Card** are its Grow, Shrink, and Basis inputs
- A **Formula readout** closes when the pointer leaves its **Formula row**, including when the pointer moves onto the readout or to the next row. Escape, blur, tapping that row again, and tapping outside also close it.
- A **Formula readout** fades in and out. The fade starts at 150ms with an ease-out curve. Shorten it if it lags the pointer.
- Moving from one **Formula row** to another hides the readout you left immediately. The 150ms fade-out is only for leaving the formulas with nothing else opening.
- A **Formula readout** opens only for the formula **Remaining Space** is showing
- **Shrink Amount** is signed. The Item Card and its **Formula readout** add it to **Basis**. The teaching panel's minus is a different writing of that same step
- A **Formula readout** sits just under its **Formula row**, aligned with the start of the equation, and does not cover that row. It may cover the next **Item Card**. Near the bottom of the viewport it sits above the row. If either side edge would cut the line off, the readout shifts until the full line is readable.
- A **Formula readout** shows each operand the way the teaching statement does, with the number above the name. Only one readout is open at a time.

## Example dialogue

> **Dev:** "Does the SHRINK button switch the calculator into shrink mode?"
> **Domain expert:** "No. It raises every Basis until Remaining Space is negative. The layout shrinks because the numbers overflow, not because a mode flag flipped."

> **Dev:** "If I hover the second Item Card's allocated-space row, do I get the teaching panel's first-item numbers?"
> **Domain expert:** "No. The Formula readout is that card's equation, numbers on the first line and a name under each one. The row on the card stays as it is."

## Flagged ambiguities

- "width" was used for both **Basis** and **Measured Width** — resolved: basis is the input; measured width is the layout result.
- "child" / "flex child" was used for both the data record and the DOM card — resolved: **Flex Item** is the record; the **Item Card** is a view of it.
- "mode" was used as if grow/shrink were a calculation toggle — resolved: there is no mode. Remaining Space picks the algorithm; the buttons are **Grow Demo** / **Shrink Demo**.
- JS property names vs CSS `flex-grow` — resolved: records use **Grow** / **Shrink** / **Basis**; CSSOM names are assigned only in `applyFlexStyles`. Map: [docs/naming.md](docs/naming.md).
- "control panel" for the whole calculator — resolved: three jobs (**Add form**, **Item Card** inputs, **Grow Demo** / **Shrink Demo**).
- Four different Grow/Shrink surfaces were treated as one switch — resolved: they are not connected. **Add form** Grow/Shrink fields draft a new **Flex Item**. **Grow Demo** / **Shrink Demo** patch **Basis** on every existing item. **Item Card** formula visibility follows **Remaining Space**. Formula tabs only show a teaching panel.
- "hover context" was used for the wide labeled equation — resolved: that surface is a **Formula readout**. The **Formula row** on the Item Card does not change.
- The teaching panel writes the last shrink step as Basis minus Shrink Amount — resolved: **Shrink Amount** is already negative, so the Item Card and the **Formula readout** add it to **Basis**.

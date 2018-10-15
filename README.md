# Checklist
- [Front End Checklist](https://frontendchecklist.io/)

# Rachel Andrews Series on Smashing Magazine
- [What Happens When You Create A Flexbox Flex Container?](https://www.smashingmagazine.com/2018/08/flexbox-display-flex-container/)
- [Everything You Need To Know About Alignment In Flexbox](https://www.smashingmagazine.com/2018/08/flexbox-alignment/)
- [Flexbox: How Big Is That Flexible Box?](https://www.smashingmagazine.com/2018/09/flexbox-sizing-flexible-box/)
- [Use Cases For Flexbox](https://www.smashingmagazine.com/2018/10/flexbox-use-cases/)

# Specs

- [Display](https://www.w3.org/TR/css-display-3/#intro)
- [Box Alignment](https://www.w3.org/TR/css-align-3/)

# Flexbox calculator

- [Mike by Mike](https://www.madebymike.com.au/writing/understanding-flexbox/)
- [Chris Wright](https://chriswrightdesign.com/experiments/flexbox-adventures/)


# Tools
- [http://the-echoplex.net/flexyboxes/](http://the-echoplex.net/flexyboxes/)
- [https://www.madebymike.com.au/demos/flexbox-tester/](https://www.madebymike.com.au/demos/flexbox-tester/)
- [https://loading.io/flexbox/](https://loading.io/flexbox/)
- [http://flexboxplayground.catchmyfame.com/](http://flexboxplayground.catchmyfame.com/)

# Guides
- [CSS-Tricks Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Codrops Guide](https://tympanus.net/codrops/css_reference/flexbox/)


# Flex container

- the **display** property has outer and inner display context
- **display: inline flex** or **display: block flex** is how the browser interprets the property


- **flex-flow: row nowrap** doubles for **flex-direction** and **flex-wrap**

- **justify-** concerns the main axis, X is the default
- **align-** concerns the cross axis, Y is the default
- you need spare space to use the two above properties for them to have an effect
- **main-start** and **main-end** are the values that determine flex begin and end


- **align-content** can be used when **flex: flex-wrap** is applied to wrap items to create **flex-lines**
- **place-content: space-between stretch** sets align and justify
- the **align-/justify-content** works on the flex lines as a group
- each flex line acts as its own separate flex group

- **align-items** is set to stretch by default, which is why columns stretch to meet the tallest items height automatically

# At least one Flex Item; hide Remove when it is the last

`state.items` is never empty. Remove is a no-op at length 1. `paintItemCards` hides that card's Remove control when there is only one Flex Item so the no-op is not offered. An empty Flex Container is not a supported state.

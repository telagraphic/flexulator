# Patch Item Cards in place by id, do not rebuild the list

Each Flex Item has a stable id. `render()` matches that id to an existing Item Card, then writes styles and values onto the same node. New ids clone a template; ids that left the list remove their card. Rebuilding the whole list on every keystroke would drop focus and destroy later animation nodes. Per-card JS objects are the old design. Identity lives on the record, not on a view class.

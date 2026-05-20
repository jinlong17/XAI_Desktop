# plugin-pet Design

The pet state machine is `idle -> remind -> interact -> rest`. For this scaffold, transitions are explicit UI actions and mock AI reminder generation.

Non-intrusive mode persists `hidden: true` in localStorage so the pet can be dismissed with one action.

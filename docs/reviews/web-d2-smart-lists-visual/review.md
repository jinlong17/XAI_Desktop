# Smart Lists full stylesheet recovery rendering

Parent fixed archive40ffbe1, actual pane, complete synthetic account, actual first-row choice under quota. Explicit token/layout/settings-shell/settings-rest stylesheets; isolated pane, not the full settings shell or a physical mobile device. [Runner](verify-native.mjs), [fixture](native.tsx), [geometry](visual-40ffbe1.log).

Widths375/414/768/1024/1440 at1200px capture height show all twelve selects and the recovery Retry at44px height, without horizontal viewport overflow. Parent directly viewed [375](recovery-40ffbe1-375.png): labels and recovery text are readable.

One visibility concern remains: changing the first row at y100 shows its failure section only after the entire list, starting y912. A viewport shorter than that will not show the visual error without scrolling; screen-reader announcement is a separate mechanism. Recommend placing current save status/recovery near the title, preserving all row semantics and avoiding a new Save footer. Geometry/readability evidence alone does not accept immediate error discoverability. Astra owns the final bounded UI assessment.

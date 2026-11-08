# Krillion 1.6.0

Live at [jordangeach.com/krillion](https://jordangeach.com/krillion/), with updated source and a portable local download.

- **A stronger descent:** a short charge takes the first 10% of the timeline, acceleration and sustained travel take 68%, and braking takes the final 22%. A 100m descent lasts 1.85 seconds; a 1,000m descent lasts 2.5 seconds. The camera, submarine, ruler, depth display, and effects stay synchronized.
- **More distance on screen:** the main world moves at 2 pixels per metre, up from 0.62. Far and near layers use 0.9 and 2.75 pixels per metre. Rescaled landmarks, sea life, and an extended ocean cover the full 7,000m dive, with continuous water colour and depth lighting. Foreground layers keep moving upward through braking.
- **A submarine under thrust:** speed drives up to 29 degrees of pitch, a 28px sink, and a subtle 3.5% zoom. Twenty-four peripheral upward tracks, edge pressure effects, and an arrival ripple reinforce the motion while the central game interface stays stable. The mobile submarine sits in a side gutter.
- **Reliable arrival and reduced motion:** **Keep descending** receives focus when it becomes ready, including after restoring a saved reveal. Restoring does not replay the descent. System and manual reduced-motion preferences snap directly to the target, including when enabled midflight, and suppress camera, craft, and decorative animation. The next prompt retains its full timer and input focus.

Scoring, the 108-prompt bank, the 30,000-form dictionary, and AI judging retain their existing behavior.

Browser verification covered a perfect seven-round, 700-point dive to 7,000m, with the world at −14,000px and the ocean floor visible. A 100m `Alps` descent on a 390px phone layout had no horizontal overflow and showed all 24 tracks. A 1,000m descent was inspected during braking; the foreground continued upward. Turning reduced motion on midflight snapped from 3,212m to 4,200m with no active effects or camera/craft animation. A restored 2,100m reveal focused **Keep descending** without replaying, and the next prompt began with its full 25 seconds and input focus. See the [descent validation record](descent-validation-1.6.0.json).

The 49 Node tests include six new timeline checks. Type checking, all 49 Node tests, and both production builds passed. Published assets and dictionary data match the build. Live browser checks verified a 1,000m descent with all 24 foreground tracks, landing at 4,000m with Next focused and the rush effects removed. The local build also serves the matching updated assets.

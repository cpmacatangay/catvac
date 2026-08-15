# 001 — "Done" completion emphasis on StatusPill

- **Status**: DONE (code applied + `compileDebugKotlin` passes; feel-check on device pending)
- **Commit**: 6d29744
- **Severity**: MEDIUM
- **Category**: Missed opportunities (delight budget — peak-end moment)
- **Estimated scope**: 1 file (`StatusPill.kt`)

## Problem

Marking a vaccine administered is the emotional peak of the whole product, but the only motion it produces is a background color crossfade (`amber → green`). The pill never acknowledges the completion — no pop, no emphasis. This is a rare, high-emotion "success" moment, which is exactly where the delight budget lives.

```kotlin
// android/app/src/main/java/com/catvac/app/ui/components/StatusPill.kt:93-96 — current
    val animatedBg by animateColorAsState(
        targetValue = c.bg,
        animationSpec = if (shouldReduceMotion()) snap() else tween(300),
    )
```

The pill is stateless: it receives `status: VaccineStatus` and crossfades its `bg` when that value changes. There is no scale/emphasis beat for the `due → administered` transition, and none for any other transition — which is correct; we only add motion for the one transition that matters.

## Target

Add a one-shot spring scale pop that fires **only** when the pill transitions into `ADMINISTERED` (from any other status), then settles at full size. `0.85f → 1f` over a spring, applied to the whole pill via `graphicsLayer` (GPU-composited transform, no layout work).

```kotlin
// StatusPill.kt — target body of the composable (status/… unchanged above it)
@Composable
fun StatusPill(
    status: VaccineStatus,
    modifier: Modifier = Modifier,
) {
    val dark = LocalDarkTheme.current
    val c = pillColors(status, dark)
    val label = stringResource(c.labelRes)
    val statusDescription = stringResource(R.string.status_description, label)
    val reduceMotion = shouldReduceMotion()
    val animatedBg by animateColorAsState(
        targetValue = c.bg,
        animationSpec = if (reduceMotion) snap() else tween(300),
    )

    val scale = remember { Animatable(1f) }
    var previousStatus by remember { mutableStateOf(status) }
    LaunchedEffect(status) {
        if (status == VaccineStatus.ADMINISTERED && previousStatus != VaccineStatus.ADMINISTERED && !reduceMotion) {
            scale.snapTo(0.85f)
            scale.animateTo(1f, spring(dampingRatio = 0.6f, stiffness = 500f))
        }
        previousStatus = status
    }

    Row(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale.value
                scaleY = scale.value
            }
            .semantics { contentDescription = statusDescription }
            .clip(CircleShape)
            .background(animatedBg)
            .border(1.dp, c.border, CircleShape)
            .padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(c.dot),
        )
        Text(
            text = label.uppercase(),
            color = c.fg,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 6.dp),
        )
    }
}
```

Imports to add (exact, no wildcard drift):

```kotlin
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.graphicsLayer
```

## Repo conventions to follow

- Motion lives inline in composables via Compose `androidx.compose.animation` APIs only — no motion library, no new dependencies.
- Reduced motion is gated by `shouldReduceMotion()` from `com.catvac.app.ui.theme` (`ui/theme/ReducedMotion.kt`); the reduced-motion alternative is `snap()` (instant), never a "nuke all motion" global.
- Exemplar for gated animation — `ui/components/CatCard.kt:48-56`:
  ```kotlin
  val scale by animateFloatAsState(
      targetValue = if (isPressed) 1.01f else 1f,
      animationSpec = if (reduceMotion) snap() else tween(200),
  )
  ```
- Exemplar for the reduced-motion read + `snap()` — `StatusPill.kt:93-96` (the existing `animateColorAsState`).
- Spring value is the exact recipe from the opportunity audit: `spring(dampingRatio = 0.6f, stiffness = 500f)` — a quick settle with one subtle overshoot. Do NOT swap in `Spring.DampingRatioMediumBouncy` or a different stiffness.

## Steps

1. **`android/app/src/main/java/com/catvac/app/ui/components/StatusPill.kt`** — add the seven imports listed in Target (keep the existing `animateColorAsState`, `snap`, `tween` imports).
2. Same file — inside `StatusPill`, change the top of the body:
   - Replace `val animatedBg by animateColorAsState(... shouldReduceMotion() ...)` so it reads from a local `val reduceMotion = shouldReduceMotion()` first (see Target — this hoists the value so the coroutine below can use it without calling a `@Composable` inside a suspend lambda).
   - Insert the `scale`/`previousStatus`/`LaunchedEffect` block after the `animatedBg` declaration.
   - Add `.graphicsLayer { scaleX = scale.value; scaleY = scale.value }` as the FIRST modifier in the `Row`'s modifier chain (before `.semantics`).
3. Do not change `pillColors`, `statusColor`, `statusLabelRes`, the `Row` children, or anything outside `StatusPill`.

## Boundaries

- Do NOT touch any other file. This is a one-file change.
- Do NOT change the background crossfade (`animateColorAsState`, `tween(300)`) or its reduced-motion `snap()`.
- Do NOT animate `width`/`height`/`padding` — the pop is `graphicsLayer` scale only (transform, GPU-composited).
- The pop must fire **only** on `→ ADMINISTERED`. The `previousStatus` guard must mean no pop on first render (e.g. opening a cat whose vaccine is already done).
- Do NOT add a dependency or motion library.
- The code above reflects the working tree **after** commit `6d29744` (this file has uncommitted edits). If the file you open differs from the Target excerpt, STOP and report the drift instead of improvising.

## Verification

- **Mechanical**: `cd android && ./gradlew compileDebugKotlin` → exits 0. Then `cd android && ./gradlew assembleDebug` → exits 0.
- **Feel check** (install `app/build/outputs/apk/debug/app-debug.apk` via `adb install -r`, log in):
  - Open a cat with a not-yet-administered vaccine. Tap **Done → confirm**. The pill should pop: scale from ~85% up to full with a single small overshoot, while the background crossfades to green. It reads as a confirmation "stamp", not a bounce-fest.
  - Reopen a cat whose vaccine is **already** administered: the "DONE" pill renders at full size with **no** pop (guard works on initial render).
  - Toggle reduced motion: `adb shell settings put global animator_duration_scale 0`, mark another vaccine done → no scale pop, only the instant color snap. Restore with `adb shell settings put global animator_duration_scale 1`.
  - Confirm the pop is independent of the color crossfade — both run together, neither blocks the other.
- **Done when**: the pop fires exactly once on each `→ administered` transition, never on initial render, is skipped under reduced motion, and both Gradle commands pass.

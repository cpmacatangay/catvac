package com.catvac.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.catvac.app.R
import com.catvac.app.data.model.VaccineStatus
import com.catvac.app.ui.theme.DarkStatusAdministered
import com.catvac.app.ui.theme.DarkStatusDue
import com.catvac.app.ui.theme.DarkStatusOnTrack
import com.catvac.app.ui.theme.DarkStatusOverdue
import com.catvac.app.ui.theme.DarkStatusPending
import com.catvac.app.ui.theme.DarkStatusSnoozed
import com.catvac.app.ui.theme.DarkStatusUpcoming
import com.catvac.app.ui.theme.LocalDarkTheme
import com.catvac.app.ui.theme.StatusAdministered
import com.catvac.app.ui.theme.StatusDue
import com.catvac.app.ui.theme.StatusOnTrack
import com.catvac.app.ui.theme.StatusOverdue
import com.catvac.app.ui.theme.StatusPending
import com.catvac.app.ui.theme.StatusSnoozed
import com.catvac.app.ui.theme.StatusUpcoming
import com.catvac.app.ui.theme.shouldReduceMotion

private data class PillColors(
    val bg: Color,
    val fg: Color,
    val dot: Color,
    val border: Color,
    val labelRes: Int,
)

private fun statusColor(status: VaccineStatus, dark: Boolean): Color = when (status) {
    VaccineStatus.ON_TRACK -> if (dark) DarkStatusOnTrack else StatusOnTrack
    VaccineStatus.UPCOMING -> if (dark) DarkStatusUpcoming else StatusUpcoming
    VaccineStatus.DUE -> if (dark) DarkStatusDue else StatusDue
    VaccineStatus.OVERDUE -> if (dark) DarkStatusOverdue else StatusOverdue
    VaccineStatus.ADMINISTERED -> if (dark) DarkStatusAdministered else StatusAdministered
    VaccineStatus.SNOOZED -> if (dark) DarkStatusSnoozed else StatusSnoozed
    VaccineStatus.PENDING, VaccineStatus.UNKNOWN -> if (dark) DarkStatusPending else StatusPending
}

private fun statusLabelRes(status: VaccineStatus): Int = when (status) {
    VaccineStatus.ON_TRACK -> R.string.status_on_track
    VaccineStatus.UPCOMING -> R.string.status_upcoming
    VaccineStatus.DUE -> R.string.status_due
    VaccineStatus.OVERDUE -> R.string.status_overdue
    VaccineStatus.ADMINISTERED -> R.string.status_done
    VaccineStatus.SNOOZED -> R.string.status_snoozed
    VaccineStatus.PENDING, VaccineStatus.UNKNOWN -> R.string.status_pending
}

private fun pillColors(status: VaccineStatus, dark: Boolean): PillColors {
    val base = statusColor(status, dark)
    return PillColors(
        bg = base.copy(alpha = if (dark) 0.16f else 0.10f),
        fg = base,
        dot = base,
        border = base.copy(alpha = if (dark) 0.40f else 0.30f),
        labelRes = statusLabelRes(status),
    )
}

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

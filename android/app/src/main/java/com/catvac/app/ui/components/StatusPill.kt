package com.catvac.app.ui.components

import androidx.compose.animation.animateColorAsState
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
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.catvac.app.data.model.VaccineStatus
import com.catvac.app.ui.theme.StatusAdministered
import com.catvac.app.ui.theme.StatusDue
import com.catvac.app.ui.theme.StatusOnTrack
import com.catvac.app.ui.theme.StatusOverdue
import com.catvac.app.ui.theme.StatusPending
import com.catvac.app.ui.theme.StatusSnoozed
import com.catvac.app.ui.theme.StatusUpcoming

private data class PillColors(
    val bg: Color,
    val fg: Color,
    val dot: Color,
    val border: Color,
    val label: String,
)

private fun pillColors(status: VaccineStatus): PillColors = when (status) {
    VaccineStatus.ON_TRACK -> PillColors(
        bg = StatusOnTrack.copy(alpha = 0.10f),
        fg = StatusOnTrack,
        dot = StatusOnTrack,
        border = StatusOnTrack.copy(alpha = 0.30f),
        label = "OK",
    )
    VaccineStatus.UPCOMING -> PillColors(
        bg = StatusUpcoming.copy(alpha = 0.10f),
        fg = StatusUpcoming,
        dot = StatusUpcoming,
        border = StatusUpcoming.copy(alpha = 0.30f),
        label = "Upcoming",
    )
    VaccineStatus.DUE -> PillColors(
        bg = StatusDue.copy(alpha = 0.10f),
        fg = StatusDue,
        dot = StatusDue,
        border = StatusDue.copy(alpha = 0.30f),
        label = "Due",
    )
    VaccineStatus.OVERDUE -> PillColors(
        bg = StatusOverdue.copy(alpha = 0.10f),
        fg = StatusOverdue,
        dot = StatusOverdue,
        border = StatusOverdue.copy(alpha = 0.30f),
        label = "Overdue",
    )
    VaccineStatus.ADMINISTERED -> PillColors(
        bg = StatusAdministered.copy(alpha = 0.10f),
        fg = StatusAdministered,
        dot = StatusAdministered,
        border = StatusAdministered.copy(alpha = 0.30f),
        label = "Done",
    )
    VaccineStatus.SNOOZED -> PillColors(
        bg = StatusSnoozed.copy(alpha = 0.10f),
        fg = StatusSnoozed,
        dot = StatusSnoozed,
        border = StatusSnoozed.copy(alpha = 0.30f),
        label = "Snoozed",
    )
    VaccineStatus.PENDING, VaccineStatus.UNKNOWN -> PillColors(
        bg = StatusPending.copy(alpha = 0.10f),
        fg = StatusPending,
        dot = StatusPending,
        border = StatusPending.copy(alpha = 0.30f),
        label = "Pending",
    )
}

@Composable
fun StatusPill(
    status: VaccineStatus,
    modifier: Modifier = Modifier,
) {
    val c = pillColors(status)
    val animatedBg by animateColorAsState(
        targetValue = c.bg,
        animationSpec = tween(300),
    )

    Row(
        modifier = modifier
            .semantics { contentDescription = "Status: ${c.label}" }
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
            text = c.label.uppercase(),
            color = c.fg,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 6.dp),
        )
    }
}

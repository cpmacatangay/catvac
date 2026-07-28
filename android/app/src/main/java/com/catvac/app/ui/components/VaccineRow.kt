package com.catvac.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.catvac.app.data.model.VaccineDto
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private sealed interface ConfirmAction {
    data object Administer : ConfirmAction
    data object Snooze : ConfirmAction
}

@Composable
fun VaccineRow(
    vaccine: VaccineDto,
    onAdminister: () -> Unit,
    onSnooze: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var confirmAction by remember { mutableStateOf<ConfirmAction?>(null) }
    val dueStr = try {
        val date = LocalDate.parse(vaccine.dueDate, DateTimeFormatter.ISO_DATE_TIME)
        date.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))
    } catch (_: Exception) {
        vaccine.dueDate.take(10)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = vaccine.name,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f).padding(end = 8.dp),
                )
                StatusPill(status = vaccine.status)
            }

            Spacer(Modifier.height(4.dp))

            Text(
                text = "Due: $dueStr" + if (vaccine.intervalMonths != null) " · Every ${vaccine.intervalMonths}mo" else "",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(
                    onClick = onEdit,
                    modifier = Modifier.size(36.dp),
                ) {
                    Icon(Icons.Outlined.Edit, "Edit", modifier = Modifier.size(20.dp))
                }
                if (!vaccine.administered) {
                    FilledTonalButton(
                        onClick = { confirmAction = ConfirmAction.Administer },
                        modifier = Modifier.height(36.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                    ) {
                        Icon(Icons.Outlined.CheckCircle, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Done", style = MaterialTheme.typography.labelSmall)
                    }
                    Spacer(Modifier.width(8.dp))
                    FilledTonalButton(
                        onClick = { confirmAction = ConfirmAction.Snooze },
                        modifier = Modifier.height(36.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                    ) {
                        Icon(Icons.Outlined.Refresh, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Snooze", style = MaterialTheme.typography.labelSmall)
                    }
                    Spacer(Modifier.width(8.dp))
                }
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(36.dp),
                ) {
                    Icon(Icons.Outlined.Delete, "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(20.dp))
                }
            }

            when (confirmAction) {
                ConfirmAction.Administer -> {
                    AlertDialog(
                        onDismissRequest = { confirmAction = null },
                        title = { Text("Mark as administered?") },
                        text = { Text("${vaccine.name} will be marked as done.${if (vaccine.intervalMonths != null) " A booster will be auto-scheduled." else ""}") },
                        confirmButton = {
                            Button(onClick = { confirmAction = null; onAdminister() }) { Text("Done") }
                        },
                        dismissButton = {
                            TextButton(onClick = { confirmAction = null }) { Text("Cancel") }
                        },
                    )
                }
                ConfirmAction.Snooze -> {
                    AlertDialog(
                        onDismissRequest = { confirmAction = null },
                        title = { Text("Snooze 30 days?") },
                        text = { Text("${vaccine.name} will be snoozed for 30 days.") },
                        confirmButton = {
                            Button(onClick = { confirmAction = null; onSnooze() }) { Text("Snooze") }
                        },
                        dismissButton = {
                            TextButton(onClick = { confirmAction = null }) { Text("Cancel") }
                        },
                    )
                }
                null -> {}
            }
        }
    }
}

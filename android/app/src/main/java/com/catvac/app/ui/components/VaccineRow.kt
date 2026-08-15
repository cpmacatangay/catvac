package com.catvac.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.catvac.app.R
import com.catvac.app.data.model.VaccineDto
import com.catvac.app.util.formatDueDate

private sealed interface ConfirmAction {
    data object Administer : ConfirmAction
    data object Snooze : ConfirmAction
}

@Composable
fun VaccineRow(
    vaccine: VaccineDto,
    onAdminister: () -> Unit,
    onSnooze: (Int) -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var confirmAction by remember { mutableStateOf<ConfirmAction?>(null) }
    var menuExpanded by remember { mutableStateOf(false) }
    val dueStr = formatDueDate(vaccine.dueDate)

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

            val dueText = if (vaccine.intervalMonths != null) {
                stringResource(R.string.vaccine_due_interval, dueStr, vaccine.intervalMonths)
            } else {
                stringResource(R.string.vaccine_due_simple, dueStr)
            }
            Text(
                text = dueText,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (!vaccine.administered) {
                    FilledTonalButton(
                        onClick = { confirmAction = ConfirmAction.Snooze },
                        modifier = Modifier.height(48.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                    ) {
                        Icon(Icons.Outlined.Refresh, null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(stringResource(R.string.vaccine_snooze), style = MaterialTheme.typography.labelLarge)
                    }
                    Spacer(Modifier.width(8.dp))
                    Button(
                        onClick = { confirmAction = ConfirmAction.Administer },
                        modifier = Modifier.height(48.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                    ) {
                        Icon(Icons.Outlined.CheckCircle, null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(stringResource(R.string.vaccine_done), style = MaterialTheme.typography.labelLarge)
                    }
                }
                IconButton(
                    onClick = { menuExpanded = true },
                    modifier = Modifier.size(48.dp),
                ) {
                    Icon(Icons.Outlined.MoreVert, stringResource(R.string.vaccine_more_actions))
                }
                DropdownMenu(
                    expanded = menuExpanded,
                    onDismissRequest = { menuExpanded = false },
                ) {
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.vaccine_edit)) },
                        leadingIcon = { Icon(Icons.Outlined.Edit, null) },
                        onClick = { menuExpanded = false; onEdit() },
                    )
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.vaccine_delete), color = MaterialTheme.colorScheme.error) },
                        leadingIcon = { Icon(Icons.Outlined.Delete, null, tint = MaterialTheme.colorScheme.error) },
                        onClick = { menuExpanded = false; onDelete() },
                    )
                }
            }

            when (confirmAction) {
                ConfirmAction.Administer -> {
                    AlertDialog(
                        onDismissRequest = { confirmAction = null },
                        title = { Text(stringResource(R.string.vaccine_administer_title)) },
                        text = {
                            Text(
                                stringResource(
                                    R.string.vaccine_administer_body,
                                    vaccine.name,
                                    if (vaccine.intervalMonths != null) stringResource(R.string.vaccine_administer_booster) else "",
                                )
                            )
                        },
                        confirmButton = {
                            Button(onClick = { confirmAction = null; onAdminister() }) { Text(stringResource(R.string.vaccine_done)) }
                        },
                        dismissButton = {
                            TextButton(onClick = { confirmAction = null }) { Text(stringResource(R.string.action_cancel)) }
                        },
                    )
                }
                ConfirmAction.Snooze -> {
                    AlertDialog(
                        onDismissRequest = { confirmAction = null },
                        title = { Text(stringResource(R.string.vaccine_snooze_title, vaccine.name)) },
                        text = { Text(stringResource(R.string.vaccine_snooze_body)) },
                        confirmButton = {
                            Row {
                                TextButton(onClick = { confirmAction = null; onSnooze(7) }) { Text(stringResource(R.string.snooze_7_days)) }
                                TextButton(onClick = { confirmAction = null; onSnooze(30) }) { Text(stringResource(R.string.snooze_30_days)) }
                                TextButton(onClick = { confirmAction = null; onSnooze(60) }) { Text(stringResource(R.string.snooze_60_days)) }
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { confirmAction = null }) { Text(stringResource(R.string.action_cancel)) }
                        },
                    )
                }
                null -> {}
            }
        }
    }
}

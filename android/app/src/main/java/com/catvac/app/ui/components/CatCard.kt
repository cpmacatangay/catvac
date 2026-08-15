package com.catvac.app.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.catvac.app.R
import com.catvac.app.data.model.CatDto
import com.catvac.app.data.model.VaccineDto
import com.catvac.app.data.model.VaccineStatus
import com.catvac.app.ui.theme.shouldReduceMotion
import com.catvac.app.util.worstVaccineStatus

@Composable
fun CatCard(
    cat: CatDto,
    vaccines: List<VaccineDto>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val sorted = vaccines.sortedBy { it.dueDate }
    val displayVaccines = sorted.take(5)
    val remaining = sorted.size - 5
    val worst = worstVaccineStatus(vaccines)

    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val reduceMotion = shouldReduceMotion()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 1.01f else 1f,
        animationSpec = if (reduceMotion) snap() else tween(200),
    )
    val elevation by animateFloatAsState(
        targetValue = if (isPressed) 4.dp.value else 2.dp.value,
        animationSpec = if (reduceMotion) snap() else tween(200),
    )

    Card(
        onClick = onClick,
        interactionSource = interactionSource,
        modifier = modifier.fillMaxWidth().scale(scale),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 12.dp),
            ) {
                val avatarInitial = cat.name.first().uppercase()
                if (cat.photoUrl != null) {
                    AsyncImage(
                        model = cat.photoUrl,
                        contentDescription = stringResource(R.string.cat_avatar_description, cat.name),
                        modifier = Modifier.size(48.dp).clip(CircleShape),
                        contentScale = ContentScale.Crop,
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = avatarInitial,
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }

                Spacer(Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = cat.name,
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    val subtitle = listOfNotNull(cat.breed, cat.sex)
                        .joinToString(" · ")
                        .ifEmpty { stringResource(R.string.cat_default) }
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                if (worst == VaccineStatus.OVERDUE || worst == VaccineStatus.DUE) {
                    StatusPill(status = worst, modifier = Modifier.padding(start = 8.dp))
                }
            }

            displayVaccines.forEach { vax ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = vax.name,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f).padding(end = 8.dp),
                    )
                    StatusPill(status = vax.status)
                }
            }

            if (remaining > 0) {
                Text(
                    text = stringResource(R.string.card_more, remaining),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }
    }
}

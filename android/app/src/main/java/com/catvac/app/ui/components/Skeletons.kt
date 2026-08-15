package com.catvac.app.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.catvac.app.ui.theme.shouldReduceMotion

@Composable
private fun ShimmerAlpha(): Float {
    val transition = rememberInfiniteTransition()
    return transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.6f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
    ).value
}

@Composable
internal fun ShimmerBox(
    width: Int? = null,
    height: Int = 16,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(4.dp),
) {
    val alpha = if (shouldReduceMotion()) 0.45f else ShimmerAlpha()
    val color = MaterialTheme.colorScheme.onSurface.copy(alpha = alpha * 0.12f)
    Box(
        modifier = Modifier
            .then(if (width != null) Modifier.width(width.dp) else Modifier.fillMaxWidth())
            .height(height.dp)
            .clip(shape)
            .background(color),
    )
}

@Composable
fun CatCardSkeleton() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                ShimmerBox(width = 48, height = 48, shape = CircleShape)
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    ShimmerBox(height = 20, width = 160)
                    Spacer(Modifier.height(6.dp))
                    ShimmerBox(height = 14, width = 100)
                }
            }
            Spacer(Modifier.height(16.dp))
            repeat(3) {
                ShimmerBox(height = 16)
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun VaccineRowSkeleton() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                ShimmerBox(height = 16, width = 120)
                Spacer(Modifier.height(4.dp))
                ShimmerBox(height = 14, width = 90)
            }
            Spacer(Modifier.width(8.dp))
            ShimmerBox(width = 60, height = 24, shape = RoundedCornerShape(12.dp))
        }
    }
}


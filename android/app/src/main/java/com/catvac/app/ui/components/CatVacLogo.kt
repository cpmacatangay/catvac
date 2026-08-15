package com.catvac.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path

@Composable
fun CatVacLogo(
    modifier: Modifier = Modifier,
) {
    val face = MaterialTheme.colorScheme.primary
    val eye = MaterialTheme.colorScheme.onPrimary
    val nose = MaterialTheme.colorScheme.onPrimaryContainer
    val cross = MaterialTheme.colorScheme.secondary

    Canvas(modifier = modifier) {
        val s = size.minDimension / 32f

        // Left ear (cubic approximation of SVG path)
        val leftEar = Path().apply {
            moveTo(8f * s, 18f * s)
            cubicTo(4f * s, 14f * s, 2f * s, 9f * s, 4f * s, 5f * s)
            cubicTo(6f * s, 3f * s, 10f * s, 6f * s, 12f * s, 9f * s)
            lineTo(10f * s, 12f * s)
            close()
        }
        drawPath(leftEar, face)

        // Right ear
        val rightEar = Path().apply {
            moveTo(24f * s, 18f * s)
            cubicTo(28f * s, 14f * s, 30f * s, 9f * s, 28f * s, 5f * s)
            cubicTo(26f * s, 3f * s, 22f * s, 6f * s, 20f * s, 9f * s)
            lineTo(22f * s, 12f * s)
            close()
        }
        drawPath(rightEar, face)

        // Face
        drawOval(face, Offset(6f * s, 12f * s), Size(20f * s, 16f * s))

        // Left eye
        drawOval(eye, Offset(11.8f * s, 15.5f * s), Size(2.4f * s, 3f * s))

        // Right eye
        drawOval(eye, Offset(17.8f * s, 15.5f * s), Size(2.4f * s, 3f * s))

        // Nose
        drawOval(nose, Offset(14f * s, 20.8f * s), Size(4f * s, 2.4f * s))

        // Cross in right ear (vaccine + mark)
        val crossPath = Path().apply {
            addRect(Rect(24f * s, 6f * s, 25f * s, 10f * s))
            addRect(Rect(23f * s, 7f * s, 26f * s, 9f * s))
        }
        drawPath(crossPath, cross)
    }
}

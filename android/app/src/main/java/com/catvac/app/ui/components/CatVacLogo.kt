package com.catvac.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path

private val Purple = Color(0xFF8B5CF6)
private val White = Color(0xFFFAF5FF)
private val Nose = Color(0xFF7C3AED)
private val Cross = Color(0xFFF472B6)

@Composable
fun CatVacLogo(
    modifier: Modifier = Modifier,
) {
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
        drawPath(leftEar, Purple)

        // Right ear
        val rightEar = Path().apply {
            moveTo(24f * s, 18f * s)
            cubicTo(28f * s, 14f * s, 30f * s, 9f * s, 28f * s, 5f * s)
            cubicTo(26f * s, 3f * s, 22f * s, 6f * s, 20f * s, 9f * s)
            lineTo(22f * s, 12f * s)
            close()
        }
        drawPath(rightEar, Purple)

        // Face
        drawOval(Purple, Offset(6f * s, 12f * s), Size(20f * s, 16f * s))

        // Left eye
        drawOval(White, Offset(11.8f * s, 15.5f * s), Size(2.4f * s, 3f * s))

        // Right eye
        drawOval(White, Offset(17.8f * s, 15.5f * s), Size(2.4f * s, 3f * s))

        // Nose
        drawOval(Nose, Offset(14f * s, 20.8f * s), Size(4f * s, 2.4f * s))

        // Cross in right ear (vaccine + mark)
        val cross = Path().apply {
            addRect(Rect(24f * s, 6f * s, 25f * s, 10f * s))
            addRect(Rect(23f * s, 7f * s, 26f * s, 9f * s))
        }
        drawPath(cross, Cross)
    }
}

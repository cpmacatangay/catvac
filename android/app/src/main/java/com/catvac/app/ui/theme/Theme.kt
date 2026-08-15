package com.catvac.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.dp

val LocalDarkTheme = staticCompositionLocalOf { false }

val CatVacShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = TextInverse,
    primaryContainer = PrimaryLight,
    onPrimaryContainer = PrimaryHover,
    secondary = Accent,
    onSecondary = TextInverse,
    secondaryContainer = SurfaceSecondary,
    background = PageBackground,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceSecondary,
    onSurfaceVariant = TextSecondary,
    outline = InputBorder,
)

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkPageBackground,
    primaryContainer = DarkPrimaryLight,
    onPrimaryContainer = DarkPrimary,
    secondary = DarkAccent,
    onSecondary = DarkPageBackground,
    secondaryContainer = DarkSurfaceSecondary,
    background = DarkPageBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceSecondary,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkInputBorder,
)

@Composable
fun CatVacTheme(
    themeMode: ThemeMode = ThemeMode.LIGHT,
    content: @Composable () -> Unit,
) {
    val darkTheme = when (themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    CompositionLocalProvider(LocalDarkTheme provides darkTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = CatVacTypography,
            shapes = CatVacShapes,
            content = content,
        )
    }
}

package com.catvac.app

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.catvac.app.ui.auth.AuthViewModel
import com.catvac.app.ui.auth.LoginScreen
import com.catvac.app.ui.auth.SignupScreen
import com.catvac.app.ui.catdetail.CatDetailScreen
import com.catvac.app.ui.catdetail.CatDetailViewModel
import com.catvac.app.ui.dashboard.DashboardScreen
import com.catvac.app.ui.dashboard.DashboardViewModel
import com.catvac.app.ui.splash.SplashScreen
import com.catvac.app.ui.theme.ThemeMode
import com.catvac.app.ui.theme.ThemeViewModel

private const val FADE_MS = 125

@Composable
fun CatVacNavHost(
    authViewModel: AuthViewModel,
    themeViewModel: ThemeViewModel? = null,
) {
    val navController = rememberNavController()
    val state by authViewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state.isInitialLoading) {
        if (state.isInitialLoading) return@LaunchedEffect
        val dest = if (state.isLoggedIn) "dashboard" else "login"
        if (navController.currentDestination?.route != dest) {
            navController.navigate(dest) {
                popUpTo("splash") { inclusive = true }
            }
        }
    }

    LaunchedEffect(state.isLoggedIn) {
        if (state.isInitialLoading) return@LaunchedEffect
        val dest = if (state.isLoggedIn) "dashboard" else "login"
        if (navController.currentDestination?.route != dest) {
            navController.navigate(dest) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = "splash",
    ) {
        composable(
            "splash",
            enterTransition = { fadeIn(animationSpec = tween(FADE_MS)) },
            exitTransition = { fadeOut(animationSpec = tween(FADE_MS)) },
        ) {
            SplashScreen()
        }
        composable(
            "login",
            enterTransition = { fadeIn(animationSpec = tween(FADE_MS)) },
            exitTransition = { fadeOut(animationSpec = tween(FADE_MS)) },
        ) {
            LoginScreen(navController, authViewModel)
        }
        composable(
            "signup",
            enterTransition = { fadeIn(animationSpec = tween(FADE_MS)) },
            exitTransition = { fadeOut(animationSpec = tween(FADE_MS)) },
        ) {
            SignupScreen(navController, authViewModel)
        }
        composable(
            "dashboard",
            enterTransition = { fadeIn(animationSpec = tween(FADE_MS)) },
            exitTransition = { fadeOut(animationSpec = tween(FADE_MS)) },
        ) {
            val dashboardViewModel: DashboardViewModel = hiltViewModel()
            val tv: ThemeViewModel = if (themeViewModel != null) themeViewModel else hiltViewModel()
            val themeMode by tv.themeMode.collectAsState()
            DashboardScreen(
                navController = navController,
                viewModel = dashboardViewModel,
                onLogout = { authViewModel.logout() },
                themeMode = themeMode,
                onToggleTheme = {
                    tv.setTheme(
                        when (themeMode) {
                            ThemeMode.LIGHT -> ThemeMode.DARK
                            ThemeMode.DARK -> ThemeMode.SYSTEM
                            ThemeMode.SYSTEM -> ThemeMode.LIGHT
                        }
                    )
                },
            )
        }
        composable(
            route = "cat/{catId}",
            arguments = listOf(navArgument("catId") { type = NavType.StringType }),
            enterTransition = { fadeIn(animationSpec = tween(FADE_MS)) },
            exitTransition = { fadeOut(animationSpec = tween(FADE_MS)) },
        ) { backStackEntry ->
            val catId = backStackEntry.arguments?.getString("catId") ?: return@composable
            val detailViewModel: CatDetailViewModel = hiltViewModel()
            CatDetailScreen(
                catId = catId,
                navController = navController,
                viewModel = detailViewModel,
            )
        }
    }
}

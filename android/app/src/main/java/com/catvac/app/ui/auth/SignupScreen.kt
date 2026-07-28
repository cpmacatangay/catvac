package com.catvac.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun SignupScreen(
    navController: NavController,
    authViewModel: AuthViewModel,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var snackbarMsg by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val state by authViewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(snackbarMsg) {
        snackbarMsg?.let {
            snackbarHostState.showSnackbar(it)
            snackbarMsg = null
        }
    }

    LaunchedEffect(state.isLoggedIn) {
        if (state.isLoggedIn) {
            navController.navigate("dashboard") {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    val passwordError = when {
        password.length < 8 -> "At least 8 characters"
        !password.any { it.isUpperCase() } -> "One uppercase letter"
        !password.any { it.isLowerCase() } -> "One lowercase letter"
        !password.any { it.isDigit() } -> "One number"
        else -> null
    }
    val confirmError = if (confirmPassword.isNotEmpty() && password != confirmPassword) {
        "Passwords do not match"
    } else null

    var passwordFocused by remember { mutableStateOf(false) }
    var confirmFocused by remember { mutableStateOf(false) }

    fun showError(msg: String) { snackbarMsg = msg }

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .imePadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(48.dp))

            Text(
                text = "CatVac",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = "Never miss a jab.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 24.dp),
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = "Sign Up",
                        style = MaterialTheme.typography.headlineLarge,
                        modifier = Modifier.padding(bottom = 16.dp),
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    )

                    PasswordField(
                        value = password,
                        onValueChange = { password = it },
                        label = "Password",
                        isError = passwordFocused && password.isNotEmpty() && passwordError != null,
                        supportingText = if (passwordFocused) passwordError?.let { msg ->
                            { Text(msg, color = MaterialTheme.colorScheme.error) }
                        } else null,
                        modifier = Modifier
                            .padding(bottom = 8.dp)
                            .onFocusChanged { passwordFocused = it.isFocused },
                    )

                    PasswordField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = "Confirm Password",
                        isError = confirmFocused && confirmError != null,
                        supportingText = if (confirmFocused) confirmError?.let { msg ->
                            { Text(msg, color = MaterialTheme.colorScheme.error) }
                        } else null,
                        modifier = Modifier
                            .padding(bottom = 12.dp)
                            .onFocusChanged { confirmFocused = it.isFocused },
                    )

                    Button(
                        onClick = {
                            if (email.isBlank()) {
                                showError("Email is required")
                                return@Button
                            }
                            if (!email.matches(Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))) {
                                showError("Enter a valid email address")
                                return@Button
                            }
                            if (passwordError != null) {
                                showError(passwordError)
                                return@Button
                            }
                            if (confirmError != null) {
                                showError(confirmError)
                                return@Button
                            }
                            isLoading = true
                            authViewModel.signup(email, password) { msg ->
                                isLoading = false
                                showError(msg)
                            }
                        },
                        shape = MaterialTheme.shapes.small,
                        enabled = !isLoading,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp,
                                color = MaterialTheme.colorScheme.onPrimary,
                            )
                        } else {
                            Text("Sign Up", style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            TextButton(onClick = { navController.navigate("login") }) {
                Text("Already have an account? Log in")
            }
        }
    }
}

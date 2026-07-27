package com.catvac.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
    var error by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val state by authViewModel.state.collectAsState()

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

    Column(
        modifier = Modifier
            .fillMaxSize()
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

                if (error != null) {
                    Surface(
                        color = MaterialTheme.colorScheme.error.copy(alpha = 0.08f),
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    ) {
                        Text(
                            text = error!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(12.dp),
                        )
                    }
                }

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; error = null },
                    label = { Text("Email") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                )

                PasswordField(
                    value = password,
                    onValueChange = { password = it; error = null },
                    label = "Password",
                    isError = password.isNotEmpty() && passwordError != null,
                    supportingText = passwordError?.let { msg ->
                        { Text(msg, color = MaterialTheme.colorScheme.error) }
                    },
                    modifier = Modifier.padding(bottom = 8.dp),
                )

                PasswordField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it; error = null },
                    label = "Confirm Password",
                    isError = confirmError != null,
                    supportingText = confirmError?.let { msg ->
                        { Text(msg, color = MaterialTheme.colorScheme.error) }
                    },
                    modifier = Modifier.padding(bottom = 12.dp),
                )

                Button(
                    onClick = {
                        if (email.isBlank()) {
                            error = "Email is required"
                            return@Button
                        }
                        if (passwordError != null) {
                            error = passwordError
                            return@Button
                        }
                        if (confirmError != null) {
                            error = confirmError
                            return@Button
                        }
                        isLoading = true
                        error = null
                        authViewModel.signup(email, password) { msg ->
                            isLoading = false
                            error = msg
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

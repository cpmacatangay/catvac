package com.catvac.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.catvac.app.R
import com.catvac.app.ui.components.CatVacLogo

@Composable
fun LoginScreen(
    navController: NavController,
    authViewModel: AuthViewModel,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
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

    fun showError(msg: String) { snackbarMsg = msg }
    val requiredError = stringResource(R.string.auth_error_required)
    val invalidEmailError = stringResource(R.string.auth_error_invalid_email)

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
            Spacer(Modifier.height(72.dp))

            CatVacLogo(modifier = Modifier.size(72.dp))
            Spacer(Modifier.height(16.dp))

            Text(
                text = stringResource(R.string.app_name),
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = stringResource(R.string.tagline),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 32.dp),
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            ) {
                Column(modifier = Modifier.padding(24.dp)) {

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text(stringResource(R.string.auth_email_label), fontWeight = FontWeight.Normal) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    )

                    PasswordField(
                        value = password,
                        onValueChange = { password = it },
                        label = stringResource(R.string.auth_password_label),
                        modifier = Modifier.padding(bottom = 20.dp),
                    )

                    Button(
                        onClick = {
                            if (email.isBlank() || password.isBlank()) {
                                showError(requiredError)
                                return@Button
                            }
                            if (!email.matches(Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))) {
                                showError(invalidEmailError)
                                return@Button
                            }
                            isLoading = true
                            authViewModel.login(email, password) { msg ->
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
                            Text(stringResource(R.string.auth_login_button), style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            TextButton(onClick = { navController.navigate("signup") }) {
                Text(stringResource(R.string.auth_login_signup_link))
            }
        }
    }
}

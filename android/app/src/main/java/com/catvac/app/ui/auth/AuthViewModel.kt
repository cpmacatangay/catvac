package com.catvac.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.catvac.app.data.model.UserDto
import com.catvac.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject

data class AuthUiState(
    val isLoggedIn: Boolean = false,
    val isInitialLoading: Boolean = true,
    val user: UserDto? = null,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()
    private val mutex = Mutex()

    init {
        restoreSession()
    }

    private fun restoreSession() {
        val saved = authRepository.restoreSession()
        if (saved != null) {
            _state.value = AuthUiState(isLoggedIn = true, isInitialLoading = false, user = saved)
            viewModelScope.launch {
                authRepository.me().onFailure {
                    _state.value = AuthUiState(isLoggedIn = false, isInitialLoading = false)
                }
            }
        } else {
            _state.value = AuthUiState(isLoggedIn = false, isInitialLoading = false)
        }
    }

    fun login(email: String, password: String, onError: (String) -> Unit) {
        viewModelScope.launch {
            if (!mutex.tryLock()) return@launch
            try {
                val result = authRepository.login(email, password)
                result.onSuccess { user ->
                    _state.value = AuthUiState(isLoggedIn = true, isInitialLoading = false, user = user)
                }.onFailure { e ->
                    onError(e.message ?: "Login failed")
                }
            } finally {
                mutex.unlock()
            }
        }
    }

    fun signup(email: String, password: String, onError: (String) -> Unit) {
        viewModelScope.launch {
            if (!mutex.tryLock()) return@launch
            try {
                val result = authRepository.signup(email, password)
                result.onSuccess { user ->
                    _state.value = AuthUiState(isLoggedIn = true, isInitialLoading = false, user = user)
                }.onFailure { e ->
                    onError(e.message ?: "Signup failed")
                }
            } finally {
                mutex.unlock()
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.logout()
            } catch (_: Exception) {
                // Ignore — always clear local session
            }
            authRepository.clear()
            _state.value = AuthUiState(isLoggedIn = false, isInitialLoading = false)
        }
    }
}

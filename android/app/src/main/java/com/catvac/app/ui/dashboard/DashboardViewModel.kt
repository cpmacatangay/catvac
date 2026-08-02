package com.catvac.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.catvac.app.BuildConfig
import com.catvac.app.data.model.*
import com.catvac.app.data.repository.AuthRepository
import com.catvac.app.data.repository.CatsRepository
import com.catvac.app.data.repository.DashboardRepository
import com.catvac.app.data.repository.DevicesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import javax.inject.Inject

sealed interface DashboardUiState {
    data object Loading : DashboardUiState
    data class Success(val items: List<DashboardItem>) : DashboardUiState
    data class Error(val message: String) : DashboardUiState
}

sealed interface AddCatState {
    data object Idle : AddCatState
    data object Loading : AddCatState
    data object Success : AddCatState
    data class Error(val message: String) : AddCatState
}

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository,
    private val catsRepository: CatsRepository,
    private val authRepository: AuthRepository,
    private val devicesRepository: DevicesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _addCatState = MutableStateFlow<AddCatState>(AddCatState.Idle)
    val addCatState: StateFlow<AddCatState> = _addCatState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            dashboardRepository.getDashboard()
                .onSuccess { items ->
                    _uiState.value = DashboardUiState.Success(items)
                    registerDeviceToken()
                }
                .onFailure { e ->
                    _uiState.value = DashboardUiState.Error(e.message ?: "Failed to load dashboard")
                }
        }
    }

    fun refreshDashboard() {
        viewModelScope.launch {
            _isRefreshing.value = true
            dashboardRepository.getDashboard()
                .onSuccess { items ->
                    _uiState.value = DashboardUiState.Success(items)
                    registerDeviceToken()
                }
                .onFailure { e ->
                    _uiState.value = DashboardUiState.Error(e.message ?: "Failed to load dashboard")
                }
            _isRefreshing.value = false
        }
    }

    private val mutex = Mutex()

    fun addCat(name: String, breed: String, sex: String, notes: String) {
        viewModelScope.launch {
            if (!mutex.tryLock()) return@launch
            try {
                _addCatState.value = AddCatState.Loading
                catsRepository.create(
                    CreateCatRequest(
                        name = name,
                        breed = breed.ifBlank { null },
                        sex = sex.ifBlank { null },
                        notes = notes.ifBlank { null },
                    )
                )
                    .onSuccess {
                        _addCatState.value = AddCatState.Success
                        loadDashboard()
                    }
                    .onFailure { e ->
                        _addCatState.value = AddCatState.Error(e.message ?: "Failed to add cat")
                    }
            } finally {
                mutex.unlock()
            }
        }
    }

    fun resetAddCatState() {
        _addCatState.value = AddCatState.Idle
    }

    private fun registerDeviceToken() {
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().token
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val token = task.result
                        viewModelScope.launch {
                            try {
                                devicesRepository.register(
                                    token,
                                    BuildConfig.VERSION_NAME,
                                )
                            } catch (_: Exception) {
                                // Device registration is best-effort; ignore failures
                            }
                        }
                    }
                }
        } catch (_: Exception) {
            // Firebase not configured — skip
        }
    }
}

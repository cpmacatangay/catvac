package com.catvac.app.ui.catdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.catvac.app.data.model.*
import com.catvac.app.data.repository.CatsRepository
import com.catvac.app.data.repository.VaccinesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject

sealed interface CatDetailUiState {
    data object Loading : CatDetailUiState
    data class Success(val cat: CatDto, val vaccines: List<VaccineDto>) : CatDetailUiState
    data class Error(val message: String) : CatDetailUiState
}

@HiltViewModel
class CatDetailViewModel @Inject constructor(
    private val catsRepository: CatsRepository,
    private val vaccinesRepository: VaccinesRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<CatDetailUiState>(CatDetailUiState.Loading)
    val state: StateFlow<CatDetailUiState> = _state.asStateFlow()

    private val _snackbar = MutableStateFlow<String?>(null)
    val snackbar: StateFlow<String?> = _snackbar.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val mutex = Mutex()

    fun load(catId: String) {
        viewModelScope.launch {
            _state.value = CatDetailUiState.Loading
            runCatching { fetchCatDetail(catId) }
                .onSuccess { _state.value = it }
                .onFailure { e -> _state.value = CatDetailUiState.Error(e.message ?: "Failed to load cat") }
        }
    }

    fun refresh(catId: String) {
        viewModelScope.launch {
            _isRefreshing.value = true
            runCatching { fetchCatDetail(catId) }
                .onSuccess { _state.value = it }
                .onFailure { e -> _state.value = CatDetailUiState.Error(e.message ?: "Failed to load cat") }
            _isRefreshing.value = false
        }
    }

    private suspend fun fetchCatDetail(catId: String): CatDetailUiState = coroutineScope {
        val catDeferred = async { catsRepository.getById(catId) }
        val vaxDeferred = async { vaccinesRepository.listByCat(catId) }

        val catResult = catDeferred.await()
        val vaxResult = vaxDeferred.await()

        catResult.fold(
            onSuccess = { cat ->
                val vaccines = vaxResult.getOrDefault(emptyList())
                CatDetailUiState.Success(cat, vaccines)
            },
            onFailure = { e ->
                CatDetailUiState.Error(e.message ?: "Failed to load cat")
            },
        )
    }

    fun updateCat(catId: String, name: String, breed: String, sex: String, notes: String) {
        viewModelScope.launch {
            mutex.withLock {
                catsRepository.update(
                    catId,
                    UpdateCatRequest(
                        name = name,
                        breed = breed.ifBlank { null },
                        sex = sex.ifBlank { null },
                        notes = notes.ifBlank { null },
                    )
                ).onSuccess {
                    _snackbar.value = "Cat updated"
                    load(catId)
                }.onFailure { e ->
                    _snackbar.value = e.message ?: "Failed to update"
                }
            }
        }
    }

    fun deleteCat(catId: String, onDeleted: () -> Unit) {
        viewModelScope.launch {
            mutex.withLock {
                catsRepository.delete(catId)
                    .onSuccess {
                        _snackbar.value = "Cat deleted"
                        onDeleted()
                    }
                    .onFailure { e ->
                        _snackbar.value = e.message ?: "Failed to delete"
                    }
            }
        }
    }

    fun updateVaccine(vaccineId: String, catId: String, name: String, dueDate: String, intervalMonths: Int?, notes: String?) {
        viewModelScope.launch {
            mutex.withLock {
                vaccinesRepository.update(
                    vaccineId,
                    UpdateVaccineRequest(
                        name = name,
                        dueDate = dueDate,
                        intervalMonths = intervalMonths.takeIf { it != null && it > 0 },
                        notes = notes,
                    )
                ).onSuccess {
                    _snackbar.value = "Vaccine updated"
                    load(catId)
                }.onFailure { e ->
                    _snackbar.value = e.message ?: "Failed to update vaccine"
                }
            }
        }
    }

    fun addVaccine(catId: String, name: String, dueDate: String, intervalMonths: Int?, notes: String) {
        viewModelScope.launch {
            mutex.withLock {
                vaccinesRepository.create(
                    CreateVaccineRequest(
                        catId = catId,
                        name = name,
                        dueDate = dueDate,
                        intervalMonths = intervalMonths?.takeIf { it > 0 },
                        notes = notes.ifBlank { null },
                    )
                ).onSuccess {
                    _snackbar.value = "Vaccine added"
                    refresh(catId)
                }.onFailure { e ->
                    _snackbar.value = e.message ?: "Failed to add vaccine"
                }
            }
        }
    }

    fun administerVaccine(vaccineId: String, catId: String) {
        viewModelScope.launch {
            mutex.withLock {
                val name = vaccineName(vaccineId)
                val catName = catName()
                vaccinesRepository.administer(vaccineId, AdministerRequest())
                    .onSuccess {
                        _snackbar.value = when {
                            name != null && catName != null -> "$name done — $catName's protected."
                            name != null -> "$name marked administered"
                            else -> "Vaccine marked administered"
                        }
                        load(catId)
                    }
                    .onFailure { e ->
                        _snackbar.value = e.message ?: "Failed to administer"
                    }
            }
        }
    }

    fun snoozeVaccine(vaccineId: String, catId: String, days: Int = 30) {
        viewModelScope.launch {
            mutex.withLock {
                val name = vaccineName(vaccineId)
                vaccinesRepository.snooze(vaccineId, days)
                    .onSuccess {
                        _snackbar.value = if (name != null) "$name snoozed for $days days" else "Vaccine snoozed for $days days"
                        load(catId)
                    }
                    .onFailure { e ->
                        _snackbar.value = e.message ?: "Failed to snooze"
                    }
            }
        }
    }

    fun deleteVaccine(vaccineId: String, catId: String) {
        viewModelScope.launch {
            mutex.withLock {
                vaccinesRepository.delete(vaccineId)
                    .onSuccess {
                        _snackbar.value = "Vaccine deleted"
                        load(catId)
                    }
                    .onFailure { e ->
                        _snackbar.value = e.message ?: "Failed to delete vaccine"
                    }
            }
        }
    }

    fun clearSnackbar() {
        _snackbar.value = null
    }

    private fun vaccineName(vaccineId: String): String? =
        (_state.value as? CatDetailUiState.Success)
            ?.vaccines?.firstOrNull { it.id == vaccineId }?.name

    private fun catName(): String? =
        (_state.value as? CatDetailUiState.Success)?.cat?.name
}

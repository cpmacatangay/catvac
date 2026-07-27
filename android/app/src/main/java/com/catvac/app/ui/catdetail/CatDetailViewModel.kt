package com.catvac.app.ui.catdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.catvac.app.data.model.*
import com.catvac.app.data.repository.CatsRepository
import com.catvac.app.data.repository.VaccinesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
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
    private val mutex = Mutex()

    fun load(catId: String) {
        viewModelScope.launch {
            _state.value = CatDetailUiState.Loading
            val catResult = catsRepository.getById(catId)
            val vaxResult = vaccinesRepository.listByCat(catId)

            catResult.onSuccess { cat ->
                val vaccines = vaxResult.getOrDefault(emptyList())
                _state.value = CatDetailUiState.Success(cat, vaccines)
            }.onFailure { e ->
                _state.value = CatDetailUiState.Error(e.message ?: "Failed to load cat")
            }
        }
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

    fun addVaccine(catId: String, name: String, dueDate: String, intervalMonths: Int, notes: String) {
        viewModelScope.launch {
            mutex.withLock {
                vaccinesRepository.create(
                    CreateVaccineRequest(
                        catId = catId,
                        name = name,
                        dueDate = dueDate,
                        intervalMonths = intervalMonths.takeIf { it > 0 },
                    )
                ).onSuccess {
                    _snackbar.value = "Vaccine added"
                    load(catId)
                }.onFailure { e ->
                    _snackbar.value = e.message ?: "Failed to add vaccine"
                }
            }
        }
    }

    fun administerVaccine(vaccineId: String, catId: String) {
        viewModelScope.launch {
            mutex.withLock {
                vaccinesRepository.administer(vaccineId, AdministerRequest())
                    .onSuccess {
                        _snackbar.value = "Vaccine marked administered"
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
                vaccinesRepository.snooze(vaccineId, days)
                    .onSuccess {
                        _snackbar.value = "Vaccine snoozed $days days"
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
}

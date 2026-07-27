package com.catvac.app.ui.theme

import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

private val THEME_KEY = stringPreferencesKey("theme_mode")

@HiltViewModel
class ThemeViewModel @Inject constructor(
    private val dataStore: androidx.datastore.core.DataStore<Preferences>,
) : ViewModel() {

    val themeMode: StateFlow<ThemeMode> = dataStore.data
        .map { prefs ->
            val raw = prefs[THEME_KEY]
            when (raw) {
                "LIGHT" -> ThemeMode.LIGHT
                "DARK" -> ThemeMode.DARK
                else -> ThemeMode.LIGHT
            }
        }
        .stateIn(viewModelScope, SharingStarted.Eagerly, ThemeMode.LIGHT)

    fun setTheme(mode: ThemeMode) {
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs[THEME_KEY] = mode.name
            }
        }
    }
}

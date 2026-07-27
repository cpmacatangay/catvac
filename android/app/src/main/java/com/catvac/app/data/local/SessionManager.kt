package com.catvac.app.data.local

import com.catvac.app.data.model.UserDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager(private val tokenStore: EncryptedTokenStore) {

    private val _user = MutableStateFlow(tokenStore.getUser())
    val user: StateFlow<UserDto?> = _user.asStateFlow()

    fun onAuthenticated(token: String, user: UserDto) {
        tokenStore.saveToken(token)
        tokenStore.saveUser(user)
        _user.value = user
    }

    fun onUserLoaded(user: UserDto) {
        tokenStore.saveUser(user)
        _user.value = user
    }

    fun restore(): UserDto? {
        val user = tokenStore.getUser()
        _user.value = user
        return user
    }

    fun getToken(): String? = tokenStore.getToken()

    fun clear() {
        tokenStore.clear()
        _user.value = null
    }
}

package com.catvac.app.data.repository

import com.catvac.app.data.local.SessionManager
import com.catvac.app.data.model.AuthRequest
import com.catvac.app.data.model.UserDto
import com.catvac.app.data.remote.AuthApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val sessionManager: SessionManager,
) {
    suspend fun login(email: String, password: String): Result<UserDto> = safeCall {
        val response = authApi.login(AuthRequest(email, password))
        if (response.isSuccessful) {
            val body = response.body()!!
            sessionManager.onAuthenticated(body.token, body.user)
            Result.success(body.user)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun signup(email: String, password: String): Result<UserDto> = safeCall {
        val response = authApi.signup(AuthRequest(email, password))
        if (response.isSuccessful) {
            val body = response.body()!!
            sessionManager.onAuthenticated(body.token, body.user)
            Result.success(body.user)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun logout(): Result<Unit> = safeCall {
        val response = authApi.logout()
        if (response.isSuccessful) {
            Result.success(Unit)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun me(): Result<UserDto> = safeCall {
        val response = authApi.me()
        if (response.isSuccessful) {
            val body = response.body()!!
            sessionManager.onUserLoaded(body.user)
            Result.success(body.user)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    fun restoreSession(): UserDto? = sessionManager.restore()

    fun getToken(): String? = sessionManager.getToken()

    fun isLoggedIn(): Boolean = sessionManager.getToken() != null

    fun clear() {
        sessionManager.clear()
    }
}

package com.catvac.app.data.repository

import com.catvac.app.data.local.EncryptedTokenStore
import com.catvac.app.data.model.RegisterDeviceRequest
import com.catvac.app.data.remote.DevicesApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DevicesRepository @Inject constructor(
    private val devicesApi: DevicesApi,
    private val tokenStore: EncryptedTokenStore,
) {
    suspend fun register(token: String, appVersion: String? = null): Result<Unit> = safeCall {
        val response = devicesApi.register(
            RegisterDeviceRequest(token = token, appVersion = appVersion)
        )
        if (response.isSuccessful) {
            tokenStore.saveFcmToken(token)
            Result.success(Unit)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun unregister(): Result<Unit> {
        val token = tokenStore.getFcmToken() ?: return Result.success(Unit)

        return safeCall {
            val response = devicesApi.unregister(token)
            tokenStore.clearFcmToken()
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(parseError(response.code(), response.errorBody()?.string()))
            }
        }
    }
}

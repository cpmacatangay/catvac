package com.catvac.app.data.repository

import com.catvac.app.data.model.*
import com.catvac.app.data.remote.VaccinesApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VaccinesRepository @Inject constructor(
    private val vaccinesApi: VaccinesApi,
) {
    suspend fun listByCat(catId: String): Result<List<VaccineDto>> = safeCall {
        val response = vaccinesApi.listByCat(catId)
        if (response.isSuccessful) {
            Result.success(response.body()!!.vaccines)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun create(request: CreateVaccineRequest): Result<VaccineDto> = safeCall {
        val response = vaccinesApi.create(request)
        if (response.isSuccessful) {
            Result.success(response.body()!!.vaccine)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun administer(id: String, request: AdministerRequest): Result<AdministerResponse> = safeCall {
        val response = vaccinesApi.administer(id, request)
        if (response.isSuccessful) {
            Result.success(response.body()!!)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun snooze(id: String, days: Int = 30): Result<VaccineDto> = safeCall {
        val response = vaccinesApi.snooze(id, SnoozeRequest(days))
        if (response.isSuccessful) {
            Result.success(response.body()!!.vaccine)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun delete(id: String): Result<Unit> = safeCall {
        val response = vaccinesApi.delete(id)
        if (response.isSuccessful || response.code() == 204) {
            Result.success(Unit)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }
}

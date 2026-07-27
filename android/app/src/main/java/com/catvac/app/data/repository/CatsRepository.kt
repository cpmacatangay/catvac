package com.catvac.app.data.repository

import com.catvac.app.data.model.*
import com.catvac.app.data.remote.CatsApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CatsRepository @Inject constructor(
    private val catsApi: CatsApi,
) {
    suspend fun list(): Result<List<CatDto>> = safeCall {
        val response = catsApi.list()
        if (response.isSuccessful) {
            Result.success(response.body()!!.cats)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun getById(id: String): Result<CatDto> = safeCall {
        val response = catsApi.getById(id)
        if (response.isSuccessful) {
            Result.success(response.body()!!.cat)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun create(request: CreateCatRequest): Result<CatDto> = safeCall {
        val response = catsApi.create(request)
        if (response.isSuccessful) {
            Result.success(response.body()!!.cat)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun update(id: String, request: UpdateCatRequest): Result<CatDto> = safeCall {
        val response = catsApi.update(id, request)
        if (response.isSuccessful) {
            Result.success(response.body()!!.cat)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }

    suspend fun delete(id: String): Result<Unit> = safeCall {
        val response = catsApi.delete(id)
        if (response.isSuccessful || response.code() == 204) {
            Result.success(Unit)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }
}

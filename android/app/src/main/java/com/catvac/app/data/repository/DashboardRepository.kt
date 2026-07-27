package com.catvac.app.data.repository

import com.catvac.app.data.model.DashboardItem
import com.catvac.app.data.remote.DashboardApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(
    private val dashboardApi: DashboardApi,
) {
    suspend fun getDashboard(): Result<List<DashboardItem>> = safeCall {
        val response = dashboardApi.getDashboard()
        if (response.isSuccessful) {
            Result.success(response.body()!!.cats)
        } else {
            Result.failure(parseError(response.code(), response.errorBody()?.string()))
        }
    }
}

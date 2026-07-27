package com.catvac.app.data.remote

import com.catvac.app.data.model.DashboardResponse
import retrofit2.Response
import retrofit2.http.GET

interface DashboardApi {
    @GET("dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>
}

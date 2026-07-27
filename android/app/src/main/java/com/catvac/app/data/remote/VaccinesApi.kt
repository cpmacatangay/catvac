package com.catvac.app.data.remote

import com.catvac.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface VaccinesApi {
    @GET("vaccines/cat/{catId}")
    suspend fun listByCat(@Path("catId") catId: String): Response<VaccinesResponse>

    @POST("vaccines")
    suspend fun create(@Body body: CreateVaccineRequest): Response<VaccineResponse>

    @PATCH("vaccines/{id}/administer")
    suspend fun administer(
        @Path("id") id: String,
        @Body body: AdministerRequest,
    ): Response<AdministerResponse>

    @PATCH("vaccines/{id}/snooze")
    suspend fun snooze(
        @Path("id") id: String,
        @Body body: SnoozeRequest,
    ): Response<VaccineResponse>

    @DELETE("vaccines/{id}")
    suspend fun delete(@Path("id") id: String): Response<Unit>
}

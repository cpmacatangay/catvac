package com.catvac.app.data.remote

import com.catvac.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface CatsApi {
    @GET("cats")
    suspend fun list(): Response<CatsResponse>

    @GET("cats/{id}")
    suspend fun getById(@Path("id") id: String): Response<CatResponse>

    @POST("cats")
    suspend fun create(@Body body: CreateCatRequest): Response<CatResponse>

    @PATCH("cats/{id}")
    suspend fun update(
        @Path("id") id: String,
        @Body body: UpdateCatRequest,
    ): Response<CatResponse>

    @DELETE("cats/{id}")
    suspend fun delete(@Path("id") id: String): Response<Unit>
}

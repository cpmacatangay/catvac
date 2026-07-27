package com.catvac.app.data.remote

import com.catvac.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body body: AuthRequest): Response<AuthResponse>

    @POST("auth/signup")
    suspend fun signup(@Body body: AuthRequest): Response<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<MessageResponse>

    @GET("auth/me")
    suspend fun me(): Response<UserResponse>
}

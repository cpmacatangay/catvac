package com.catvac.app.data.remote

import com.catvac.app.data.model.DeviceResponse
import com.catvac.app.data.model.MessageResponse
import com.catvac.app.data.model.RegisterDeviceRequest
import retrofit2.Response
import retrofit2.http.*

interface DevicesApi {
    @POST("devices")
    suspend fun register(@Body body: RegisterDeviceRequest): Response<DeviceResponse>

    @DELETE("devices/{token}")
    suspend fun unregister(@Path("token") token: String): Response<MessageResponse>
}

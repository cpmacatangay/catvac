package com.catvac.app.data.remote

import android.content.Context
import com.catvac.app.BuildConfig
import com.catvac.app.data.local.EncryptedTokenStore
import com.catvac.app.data.local.SessionManager
import com.catvac.app.data.model.VaccineStatus
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideEncryptedTokenStore(@ApplicationContext context: Context): EncryptedTokenStore {
        return EncryptedTokenStore(context)
    }

    @Provides
    @Singleton
    fun provideSessionManager(store: EncryptedTokenStore): SessionManager {
        return SessionManager(store)
    }

    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .registerTypeAdapter(VaccineStatus::class.java, object : TypeAdapter<VaccineStatus>() {
                override fun write(out: JsonWriter, value: VaccineStatus) {
                    out.value(value.name.lowercase())
                }

                override fun read(`in`: JsonReader): VaccineStatus {
                    val raw = `in`.nextString()
                    return try {
                        VaccineStatus.valueOf(raw.uppercase().replace('-', '_'))
                    } catch (_: IllegalArgumentException) {
                        VaccineStatus.UNKNOWN
                    }
                }
            })
            .create()
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: BearerAuthInterceptor,
    ): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)

        if (BuildConfig.DEBUG) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            builder.addInterceptor(logging)
        }

        return builder.build()
    }

    @Provides
    @Singleton
    fun provideBearerAuthInterceptor(session: SessionManager): BearerAuthInterceptor {
        return BearerAuthInterceptor(session)
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, gson: Gson): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun provideCatsApi(retrofit: Retrofit): CatsApi = retrofit.create(CatsApi::class.java)

    @Provides
    @Singleton
    fun provideVaccinesApi(retrofit: Retrofit): VaccinesApi = retrofit.create(VaccinesApi::class.java)

    @Provides
    @Singleton
    fun provideDashboardApi(retrofit: Retrofit): DashboardApi = retrofit.create(DashboardApi::class.java)

    @Provides
    @Singleton
    fun provideDevicesApi(retrofit: Retrofit): DevicesApi = retrofit.create(DevicesApi::class.java)
}

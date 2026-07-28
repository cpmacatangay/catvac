package com.catvac.app.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.catvac.app.data.model.UserDto
import com.google.gson.Gson
import java.io.File

class EncryptedTokenStore(context: Context) {

    private val gson = Gson()
    private val prefsFile = File(context.applicationInfo.dataDir + "/shared_prefs/catvac_auth.xml")

    private val prefs: SharedPreferences by lazy {
        try {
            buildEncryptedPrefs(context)
        } catch (e: Exception) {
            try {
                prefsFile.delete()
                context.getSharedPreferences("catvac_auth", Context.MODE_PRIVATE)
                    .edit().clear().apply()
                buildEncryptedPrefs(context)
            } catch (e2: Exception) {
                context.getSharedPreferences("catvac_auth_plain", Context.MODE_PRIVATE)
            }
        }
    }

    private fun buildEncryptedPrefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context, MasterKey.DEFAULT_MASTER_KEY_ALIAS)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        return EncryptedSharedPreferences.create(
            context,
            "catvac_auth",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    fun saveToken(token: String) {
        try {
            prefs.edit().putString(KEY_TOKEN, token).apply()
        } catch (_: Exception) {}
    }

    fun getToken(): String? = try {
        prefs.getString(KEY_TOKEN, null)
    } catch (_: Exception) {
        null
    }

    fun saveUser(user: UserDto) {
        try {
            prefs.edit().putString(KEY_USER, gson.toJson(user)).apply()
        } catch (_: Exception) {}
    }

    fun getUser(): UserDto? {
        val json = try {
            prefs.getString(KEY_USER, null)
        } catch (_: Exception) {
            null
        } ?: return null
        return try {
            gson.fromJson(json, UserDto::class.java)
        } catch (_: Exception) {
            null
        }
    }

    fun clear() {
        try {
            prefs.edit().remove(KEY_TOKEN).remove(KEY_USER).apply()
        } catch (_: Exception) {}
    }

    companion object {
        private const val KEY_TOKEN = "jwt"
        private const val KEY_USER = "user"
    }
}

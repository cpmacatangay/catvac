package com.catvac.app.data.repository

import com.google.gson.JsonParser

suspend inline fun <T> safeCall(crossinline block: suspend () -> Result<T>): Result<T> = try {
    block()
} catch (e: Exception) {
    Result.failure(e)
}

fun parseError(code: Int, body: String?): Exception {
    val message = if (body != null) {
        try {
            val json = JsonParser.parseString(body).asJsonObject
            json.getAsJsonObject("error")?.get("message")?.asString ?: body
        } catch (_: Exception) {
            body
        }
    } else {
        "Request failed with status $code"
    }
    return Exception(message)
}

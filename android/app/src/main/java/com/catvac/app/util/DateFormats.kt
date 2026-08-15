package com.catvac.app.util

import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val displayFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy")

fun formatDueDate(dueDate: String): String {
    if (dueDate.isBlank()) return ""
    return try {
        LocalDate.parse(dueDate, DateTimeFormatter.ISO_DATE_TIME).format(displayFormatter)
    } catch (_: Exception) {
        dueDate.take(10)
    }
}

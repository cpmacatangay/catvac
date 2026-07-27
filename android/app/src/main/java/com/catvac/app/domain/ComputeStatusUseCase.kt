package com.catvac.app.domain

import com.catvac.app.data.model.VaccineStatus
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object ComputeStatusUseCase {

    fun execute(
        dueDate: String,
        leadDays: Int = 7,
        administered: Boolean = false,
        snoozedUntil: String? = null,
    ): VaccineStatus {
        if (administered) return VaccineStatus.ADMINISTERED

        val snoozed = snoozedUntil?.let {
            try {
                LocalDate.parse(it, DateTimeFormatter.ISO_DATE_TIME)
            } catch (_: Exception) {
                null
            }
        }
        if (snoozed != null && snoozed.isAfter(LocalDate.now())) {
            return VaccineStatus.SNOOZED
        }

        val due = try {
            LocalDate.parse(dueDate, DateTimeFormatter.ISO_DATE_TIME)
        } catch (_: Exception) {
            return VaccineStatus.UNKNOWN
        }

        val today = LocalDate.now()
        val diffDays = due.toEpochDay() - today.toEpochDay()

        return when {
            diffDays < 0 -> VaccineStatus.OVERDUE
            diffDays == 0L -> VaccineStatus.DUE
            diffDays <= leadDays -> VaccineStatus.UPCOMING
            else -> VaccineStatus.ON_TRACK
        }
    }
}

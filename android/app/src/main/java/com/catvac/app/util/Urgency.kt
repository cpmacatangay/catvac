package com.catvac.app.util

import com.catvac.app.data.model.VaccineDto
import com.catvac.app.data.model.VaccineStatus

fun VaccineStatus.urgencyRank(): Int = when (this) {
    VaccineStatus.OVERDUE -> 5
    VaccineStatus.DUE -> 4
    VaccineStatus.UPCOMING -> 3
    VaccineStatus.SNOOZED -> 2
    VaccineStatus.PENDING -> 2
    VaccineStatus.ON_TRACK -> 1
    VaccineStatus.ADMINISTERED -> 0
    VaccineStatus.UNKNOWN -> 1
}

fun worstVaccineStatus(vaccines: List<VaccineDto>): VaccineStatus =
    vaccines.maxByOrNull { it.status.urgencyRank() }?.status ?: VaccineStatus.UNKNOWN

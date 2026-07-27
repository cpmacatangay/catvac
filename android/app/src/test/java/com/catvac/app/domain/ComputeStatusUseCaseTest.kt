package com.catvac.app.domain

import com.catvac.app.data.model.VaccineStatus
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate

class ComputeStatusUseCaseTest {

    private val today = LocalDate.now()
    private fun date(daysFromNow: Long) = today.plusDays(daysFromNow).atStartOfDay().toString()

    @Test
    fun administered() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(0), administered = true
        )
        assertEquals(VaccineStatus.ADMINISTERED, result)
    }

    @Test
    fun snoozed() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(-5), snoozedUntil = date(10)
        )
        assertEquals(VaccineStatus.SNOOZED, result)
    }

    @Test
    fun overdue() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(-3)
        )
        assertEquals(VaccineStatus.OVERDUE, result)
    }

    @Test
    fun due() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(0)
        )
        assertEquals(VaccineStatus.DUE, result)
    }

    @Test
    fun upcoming() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(3), leadDays = 7
        )
        assertEquals(VaccineStatus.UPCOMING, result)
    }

    @Test
    fun onTrack() {
        val result = ComputeStatusUseCase.execute(
            dueDate = date(14), leadDays = 7
        )
        assertEquals(VaccineStatus.ON_TRACK, result)
    }

    @Test
    fun pastButSnoozedExpired() {
        val past = today.minusDays(5)
        val snoozedUntil = today.minusDays(1)
        val result = ComputeStatusUseCase.execute(
            dueDate = past.atStartOfDay().toString(),
            snoozedUntil = snoozedUntil.atStartOfDay().toString(),
        )
        assertEquals(VaccineStatus.OVERDUE, result)
    }
}

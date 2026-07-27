package com.catvac.app.data.model

import com.google.gson.annotations.SerializedName

// ── Status Enum ──

enum class VaccineStatus {
    @SerializedName("administered") ADMINISTERED,
    @SerializedName("snoozed") SNOOZED,
    @SerializedName("overdue") OVERDUE,
    @SerializedName("due") DUE,
    @SerializedName("upcoming") UPCOMING,
    @SerializedName("on-track") ON_TRACK,
    @SerializedName("pending") PENDING,
    UNKNOWN,
}

// ── User DTOs ──

data class UserDto(
    val id: String,
    val email: String,
    val prefs: UserPrefs,
)

data class UserPrefs(
    val leadDays: Int = 7,
    val receivePreDue: Boolean = true,
    val receiveDue: Boolean = true,
    val receiveOverdue: Boolean = true,
)

// ── Cat DTOs ──

data class CatDto(
    @SerializedName("_id") val id: String,
    val ownerId: String,
    val name: String,
    val breed: String? = null,
    val dob: String? = null,
    val sex: String? = null,
    val photoUrl: String? = null,
    val notes: String? = null,
    val deletedAt: String? = null,
    val createdAt: String,
    val updatedAt: String,
)

// ── Vaccine DTOs ──

data class VaccineDto(
    @SerializedName("_id") val id: String,
    val ownerId: String,
    val catId: String,
    val name: String,
    val dueDate: String,
    val intervalMonths: Int? = null,
    val administered: Boolean = false,
    val administeredDate: String? = null,
    val administeredNote: String? = null,
    val snoozedUntil: String? = null,
    val status: VaccineStatus = VaccineStatus.UNKNOWN,
    val createdAt: String,
    val updatedAt: String,
)

// ── Device DTOs ──

data class DeviceTokenDto(
    @SerializedName("_id") val id: String,
    val ownerId: String,
    val token: String,
    val platform: String,
    val appVersion: String? = null,
    val lastSeenAt: String? = null,
    val createdAt: String? = null,
)

// ── Dashboard ──

data class DashboardItem(
    val cat: CatDto,
    val vaccines: List<VaccineDto>,
)

// ── Request Bodies ──

data class AuthRequest(
    val email: String,
    val password: String,
)

data class CreateCatRequest(
    val name: String,
    val breed: String? = null,
    val dob: String? = null,
    val sex: String? = null,
    val photoUrl: String? = null,
    val notes: String? = null,
)

data class UpdateCatRequest(
    val name: String? = null,
    val breed: String? = null,
    val dob: String? = null,
    val sex: String? = null,
    val photoUrl: String? = null,
    val notes: String? = null,
)

data class CreateVaccineRequest(
    val catId: String,
    val name: String,
    val dueDate: String,
    val intervalMonths: Int? = null,
)

data class AdministerRequest(
    val administeredDate: String? = null,
    val note: String? = null,
)

data class SnoozeRequest(
    val days: Int = 30,
)

data class RegisterDeviceRequest(
    val token: String,
    val platform: String = "android",
    val appVersion: String? = null,
)

// ── Response Envelopes ──

data class AuthResponse(
    val user: UserDto,
    val token: String,
)

data class UserResponse(
    val user: UserDto,
)

data class MessageResponse(
    val message: String,
)

data class CatResponse(
    val cat: CatDto,
)

data class CatsResponse(
    val cats: List<CatDto>,
)

data class VaccineResponse(
    val vaccine: VaccineDto,
)

data class VaccinesResponse(
    val vaccines: List<VaccineDto>,
)

data class AdministerResponse(
    val vaccine: VaccineDto,
    val nextBooster: VaccineDto?,
)

data class DashboardResponse(
    val cats: List<DashboardItem>,
)

data class DeviceResponse(
    val device: DeviceTokenDto,
)

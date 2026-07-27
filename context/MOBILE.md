# Mobile App — CatVac Android
**Stack:** Kotlin · Jetpack Compose · Hilt · Retrofit  
**Target:** Android 8.0+ (API 26+)  
**Version:** v1.0 · Status: Active

---

## 1. Architecture Overview

The Android app is a native Kotlin + Jetpack Compose application following **Clean Architecture lite**:

```
UI (Compose Screens) → ViewModels → UseCases → Repositories → APIs (Retrofit)
                                                              → Local Storage (EncryptedSharedPreferences)
```

### Layer responsibilities

| Layer | Responsibility | Tech |
|---|---|---|
| **UI** | Stateless composables; render state from ViewModels | Jetpack Compose, Material 3 |
| **ViewModels** | Hold `StateFlow<UiState>`, call repositories/use cases | Hilt ViewModel |
| **Domain** | Pure functions — `ComputeStatusUseCase` mirrors `lib/computeStatus.js` | Plain Kotlin |
| **Data/API** | Retrofit interfaces per server route file, auth interceptor | Retrofit, OkHttp, Gson |
| **Data/Storage** | JWT token encrypted at rest | EncryptedSharedPreferences |

### DI (Dependency Injection) — Hilt

Side-effectful services are injected via Hilt `@Module` + `@Provides`, consistent with the server's DIP pattern (RULES.md §2.5).

---

## 2. Auth Flow (Bearer Token)

Mobile apps cannot use the browser cookie jar, so auth uses **`Authorization: Bearer <JWT>`**:

1. **Login**: POST `/auth/login` → server returns `{ user, token }`. The `token` field is the JWT (same token the server also puts in an httpOnly cookie for the web client).
2. **Storage**: JWT stored in `EncryptedSharedPreferences` (Android Keystore-backed, AES-256-GCM).
3. **Interceptor**: OkHttp interceptor reads the JWT from storage and injects `Authorization: Bearer <token>` on every request.
4. **Session restore**: On app launch, `GET /auth/me` with Bearer header rehydrates the user. If 401, redirect to login.

### Server changes required for mobile

- `auth.middleware.js` — falls back to `req.headers.authorization?.replace('Bearer ', '')` when `req.cookies?.token` is absent.
- `auth.controller.js` — `login` and `signup` return `{ user, token }` in response body (web client ignores the body token; mobile uses it).
- `JWT_EXPIRES_IN` — default lengthened from `7d` to `30d` to match mobile session expectations without a refresh-token rotation.

---

## 3. Project Structure

```
android/
├── app/
│   ├── build.gradle.kts
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── res/                        # Colors, themes, fonts, drawables
│       └── java/com/catvac/app/
│           ├── MainActivity.kt         # Single-activity host
│           ├── CatVacApplication.kt    # @HiltAndroidApp
│           ├── CatVacNavHost.kt        # Compose Navigation (login → dashboard → cat/:id)
│           ├── data/
│           │   ├── model/              # DTOs (Gson @SerializedName)
│           │   ├── remote/             # AuthApi, CatsApi, VaccinesApi, DashboardApi, DevicesApi
│           │   ├── local/              # EncryptedTokenStore
│           │   └── repository/         # AuthRepository, CatsRepository, VaccinesRepository, DashboardRepository
│           ├── domain/                 # ComputeStatusUseCase
│           ├── ui/
│           │   ├── theme/              # Color.kt, Type.kt, Theme.kt (Material 3 from DESIGN.md)
│           │   ├── auth/               # LoginScreen, SignupScreen, ViewModels
│           │   ├── dashboard/          # DashboardScreen, ViewModel
│           │   ├── catdetail/          # CatDetailScreen, ViewModel
│           │   └── components/         # CatCard, VaccineRow, StatusPill
│           └── push/                   # CatVacFcmService
├── build.gradle.kts                    # Plugin declarations
├── settings.gradle.kts
├── gradle.properties
├── local.properties                    # sdk.dir (gitignored)
├── key.properties                      # Signing config (gitignored)
└── gradlew                             # Gradle wrapper
```

---

## 4. Design System (Material 3)

The Android theme is a direct port of DESIGN.md's tokens to Material 3:

| Web token | Material 3 token | Value |
|---|---|---|
| Primary #8B5CF6 | `ColorScheme.primary` | `Color(0xFF8B5CF6)` |
| Accent #F472B6 | `ColorScheme.secondary` | `Color(0xFFF472B6)` |
| Page bg #FAF5FF | `ColorScheme.background` | `Color(0xFFFAF5FF)` |
| Status colors | Custom `StatusPillColors` | blue/amber/red/green/gray/purple |
| Fredoka | `Typography.headlineLarge` → `labelSmall` | 44sp → 13sp, FontWeight SemiBold |
| Nunito | `Typography.bodyLarge` | 17sp, FontWeight Normal |

The full type scale is defined in `Type.kt` matching DESIGN.md §4:

| Level | Size | Weight | Line Height |
|---|---|---|---|
| hero (displayLarge) | 44sp | 600 | 49sp |
| h1 (headlineLarge) | 34sp | 600 | 40sp |
| h2 (headlineMedium) | 26sp | 600 | 31sp |
| h3 (headlineSmall) | 22sp | 600 | 29sp |
| subtitle (titleLarge) | 18sp | 600 | 25sp |
| body (bodyLarge) | 17sp | 400 | 26sp |
| body-sm (bodyMedium) | 15sp | 400 | 23sp |
| caption (labelLarge) | 14sp | 600 | 20sp |
| badge (labelSmall) | 13sp | 700 | 17sp |

---

## 5. Push Notifications (FCM)

### Client side

- **`CatVacFcmService`** extends `FirebaseMessagingService`. On `onNewToken`, the token is available for registration (registered lazily via `DevicesApi` on first dashboard load).
- **Permission**: Android 13+ (API 33+) requires `POST_NOTIFICATIONS` runtime permission. Requested via `rememberLauncherForActivityResult` on first `DashboardScreen` mount.
- **Foreground**: FCM data messages could be displayed as in-app Snackbar (not yet implemented — future).
- **Background**: FCM `notification` payload → system tray (automatic via `FirebaseMessagingService`). The `CatVacFcmService` creates a `NotificationChannel` named "Vaccine Reminders" at `IMPORTANCE_HIGH`.

### Server side

- **`devicetokens` collection**: stores `{ ownerId, token, platform }` — registered via `POST /api/v1/devices` (authed).
- **`PushService`**: constructor-injected FCM client (DI pattern per RULES.md §2.5). Uses `firebase-admin` `messaging.sendEachForMulticast`.
- **Integration with cron**: The nightly reminder engine (`ReminderService.processReminders`) runs both email and push passes. Both use the same `ReminderLog` dedup ledger with a `channel: 'email' | 'push'` discriminator.
- **Env**: `FIREBASE_SERVICE_ACCOUNT` — path to the Firebase Admin SDK service account JSON (or the JSON string itself).

---

## 6. Business Logic Duplication

Per RULES.md §3.5, duplication between `client/`, `server/`, and `android/` is explicitly allowed. Key duplications:

| Code | Server (JS) | Android (Kotlin) |
|---|---|---|
| Status derivation | `lib/computeStatus.js` | `domain/ComputeStatusUseCase.kt` |
| Zod schemas | `schemas/*.js` | `data/model/*Dtos.kt` |
| Error types | `lib/errors.js` | (handled via `try/catch` in ViewModels) |

---

## 7. Testing Philosophy

Mirrors PRD §7.6's pragmatic approach:

- **Unit tests**: JUnit for `ComputeStatusUseCase` only (the single piece of real business logic on-device).
- **Repository/ViewModel tests**: Skipped for v1.
- **UI tests**: Skipped for v1 (no E2E, manual smoke test on real device).
- **Smoke test**: log in → add a cat → add a vaccine → mark administered → reopen app sees persisted state → push notification arrives.

---

## 8. Distribution

Personal-use sideload only (no Play Store):

```bash
# Build debug APK
cd android && ./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Build release APK (signed, minified)
cd android && ./gradlew assembleRelease
# → app/build/outputs/apk/release/app-release.apk
```

Release signing via `key.properties` (gitignored):
```
storeFile=/path/to/catvac.jks
storePassword=...
keyAlias=catvac
keyPassword=...
```

Keystore generated once:
```bash
keytool -genkeypair -v -keystore ~/.android/catvac.jks \
  -keyalg RSA -keysize 2048 -validity 9125 -alias catvac
```

---

## 9. Environment Setup

```bash
# Prerequisites
# Java 17+, Android SDK (platform 34, build-tools 34), ANDROID_HOME set

# Install dependencies (first time)
./gradlew wrapper --gradle-version=8.5

# Build
./gradlew assembleDebug
```

### Required files (gitignored)

| File | Purpose | Obtained from |
|---|---|---|
| `android/app/google-services.json` | Firebase SDK initialization | Firebase Console project |
| `server/firebase-service-account.json` | Firebase Admin SDK (server-side FCM send) | Firebase Console → Service accounts |
| `android/key.properties` | APK signing | Self-generated via keytool |
| `server/.env` | Server env vars (incl. `FIREBASE_SERVICE_ACCOUNT`) | Copied from `.env.example` + secrets |

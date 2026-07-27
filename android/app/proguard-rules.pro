# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.catvac.app.data.model.** { <fields>; }
-keepclassmembers class com.catvac.app.data.model.** { *; }

# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * { @retrofit2.http.* <methods>; }
-dontwarn javax.annotation.**
-dontwarn kotlin.Unit
-dontwarn retrofit2.KotlinExtensions
-dontwarn retrofit2.KotlinExtensions$*

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Hilt
-keepclassmembers class * { @dagger.hilt.android.EarlyEntryPoint *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keepclassmembers class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# EncryptedSharedPreferences
-keep class androidx.security.crypto.** { *; }

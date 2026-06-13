package com.lingua.overlay

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object Prefs {
    private const val FILE = "lingua_secure_prefs"
    private const val KEY_CLAUDE = "claude_api_key"
    private const val KEY_DEEPGRAM = "deepgram_api_key"

    private fun prefs(ctx: Context) = EncryptedSharedPreferences.create(
        ctx,
        FILE,
        MasterKey.Builder(ctx).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun setClaudeKey(ctx: Context, key: String) = prefs(ctx).edit().putString(KEY_CLAUDE, key).apply()
    fun getClaudeKey(ctx: Context): String = prefs(ctx).getString(KEY_CLAUDE, "") ?: ""

    fun setDeepgramKey(ctx: Context, key: String) = prefs(ctx).edit().putString(KEY_DEEPGRAM, key).apply()
    fun getDeepgramKey(ctx: Context): String = prefs(ctx).getString(KEY_DEEPGRAM, "") ?: ""

    fun hasKeys(ctx: Context) = getClaudeKey(ctx).isNotBlank() && getDeepgramKey(ctx).isNotBlank()
}

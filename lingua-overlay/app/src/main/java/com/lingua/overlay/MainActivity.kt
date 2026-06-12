package com.lingua.overlay

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.lingua.overlay.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        binding.btnEnableOverlay.setOnClickListener {
            if (!Settings.canDrawOverlays(this)) {
                AlertDialog.Builder(this)
                    .setTitle("Overlay Permission")
                    .setMessage("Allow LinguaOverlay to draw over other apps so the translation card can appear anywhere on your screen.")
                    .setPositiveButton("Open Settings") { _, _ ->
                        startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:$packageName")))
                    }
                    .show()
            } else {
                Toast.makeText(this, "Overlay permission already granted", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnEnableAccessibility.setOnClickListener {
            if (!isAccessibilityEnabled()) {
                AlertDialog.Builder(this)
                    .setTitle("Accessibility Service")
                    .setMessage("Enable LinguaOverlay in Accessibility Settings so it can detect tapped words across all apps.")
                    .setPositiveButton("Open Settings") { _, _ ->
                        startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    }
                    .show()
            } else {
                Toast.makeText(this, "Accessibility service already enabled", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnMic.setOnClickListener {
            val running = TranscriptionService.isRunning
            if (running) {
                stopService(Intent(this, TranscriptionService::class.java))
                binding.btnMic.text = "Start Live Transcription"
            } else {
                startForegroundService(Intent(this, TranscriptionService::class.java))
                binding.btnMic.text = "Stop Live Transcription"
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    private fun updateStatus() {
        val overlayOk = Settings.canDrawOverlays(this)
        val accessOk = isAccessibilityEnabled()
        val keysOk = Prefs.hasKeys(this)

        binding.statusOverlay.text = if (overlayOk) "✓ Overlay permission granted" else "✗ Overlay permission needed"
        binding.statusAccessibility.text = if (accessOk) "✓ Accessibility service enabled" else "✗ Accessibility service needed"
        binding.statusKeys.text = if (keysOk) "✓ API keys set" else "✗ API keys missing — tap Settings"
        binding.btnMic.text = if (TranscriptionService.isRunning) "Stop Live Transcription" else "Start Live Transcription"
    }

    private fun isAccessibilityEnabled(): Boolean {
        val am = getSystemService(AccessibilityManager::class.java)
        val enabled = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
        return enabled?.contains("$packageName/${OverlayAccessibilityService::class.java.name}") == true
    }
}

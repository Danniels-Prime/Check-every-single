package com.lingua.overlay

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.lingua.overlay.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etClaudeKey.setText(Prefs.getClaudeKey(this))
        binding.etDeepgramKey.setText(Prefs.getDeepgramKey(this))

        binding.btnSave.setOnClickListener {
            val claude = binding.etClaudeKey.text.toString().trim()
            val deepgram = binding.etDeepgramKey.text.toString().trim()
            if (claude.isBlank() || deepgram.isBlank()) {
                Toast.makeText(this, "Both keys are required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            Prefs.setClaudeKey(this, claude)
            Prefs.setDeepgramKey(this, deepgram)
            Toast.makeText(this, "Keys saved", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}

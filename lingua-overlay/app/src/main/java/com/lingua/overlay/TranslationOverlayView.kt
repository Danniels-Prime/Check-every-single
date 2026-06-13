package com.lingua.overlay

import android.content.Context
import android.graphics.PixelFormat
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import com.lingua.overlay.databinding.ViewTranslationOverlayBinding
import java.util.Locale

class TranslationOverlayView(private val context: Context) {

    private val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val handler = Handler(Looper.getMainLooper())
    private var binding: ViewTranslationOverlayBinding? = null
    private var tts: TextToSpeech? = null
    private var dismissRunnable: Runnable? = null

    init {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.ENGLISH
            }
        }
    }

    fun show(word: String, translation: String, explanation: String, examples: String) {
        handler.post {
            dismiss()
            val b = ViewTranslationOverlayBinding.inflate(LayoutInflater.from(context))
            binding = b

            b.tvWord.text = word
            b.tvTranslation.text = translation
            b.tvExplanation.text = explanation
            b.tvExamples.text = if (examples.isNotBlank()) "e.g. $examples" else ""
            b.tvExamples.visibility = if (examples.isNotBlank()) View.VISIBLE else View.GONE

            b.btnClose.setOnClickListener { dismiss() }
            b.btnSpeak.setOnClickListener {
                val toSpeak = "$word. $translation. $explanation"
                tts?.speak(toSpeak, TextToSpeech.QUEUE_FLUSH, null, "lingua_tts")
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                y = 120
            }

            wm.addView(b.root, params)

            // auto-dismiss after 8 seconds
            dismissRunnable = Runnable { dismiss() }
            handler.postDelayed(dismissRunnable!!, 8000)

            // speak immediately
            val toSpeak = "$word. $translation"
            tts?.speak(toSpeak, TextToSpeech.QUEUE_FLUSH, null, "lingua_tts_auto")
        }
    }

    fun showLoading(word: String) {
        handler.post {
            dismiss()
            val b = ViewTranslationOverlayBinding.inflate(LayoutInflater.from(context))
            binding = b
            b.tvWord.text = word
            b.tvTranslation.text = "Looking up…"
            b.tvExplanation.text = ""
            b.tvExamples.visibility = View.GONE
            b.btnSpeak.visibility = View.GONE
            b.btnClose.setOnClickListener { dismiss() }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                y = 120
            }

            wm.addView(b.root, params)
        }
    }

    fun updateContent(word: String, translation: String, explanation: String, examples: String) {
        handler.post {
            val b = binding ?: return@post
            b.tvWord.text = word
            b.tvTranslation.text = translation
            b.tvExplanation.text = explanation
            b.tvExamples.text = if (examples.isNotBlank()) "e.g. $examples" else ""
            b.tvExamples.visibility = if (examples.isNotBlank()) View.VISIBLE else View.GONE
            b.btnSpeak.visibility = View.VISIBLE

            b.btnSpeak.setOnClickListener {
                val toSpeak = "$word. $translation. $explanation"
                tts?.speak(toSpeak, TextToSpeech.QUEUE_FLUSH, null, "lingua_tts")
            }

            dismissRunnable?.let { handler.removeCallbacks(it) }
            dismissRunnable = Runnable { dismiss() }
            handler.postDelayed(dismissRunnable!!, 8000)

            tts?.speak("$word. $translation", TextToSpeech.QUEUE_FLUSH, null, "lingua_tts_auto")
        }
    }

    fun showError(word: String, error: String) {
        handler.post {
            binding?.let {
                it.tvTranslation.text = "Could not look up \"$word\""
                it.tvExplanation.text = error
                it.tvExamples.visibility = View.GONE
                it.btnSpeak.visibility = View.GONE
            }
        }
    }

    fun dismiss() {
        handler.post {
            dismissRunnable?.let { handler.removeCallbacks(it) }
            binding?.let {
                try { wm.removeView(it.root) } catch (_: Exception) {}
            }
            binding = null
        }
    }

    fun destroy() {
        dismiss()
        tts?.shutdown()
    }
}

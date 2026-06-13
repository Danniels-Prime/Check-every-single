package com.lingua.overlay

import android.content.Context
import android.graphics.PixelFormat
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import com.lingua.overlay.databinding.ViewCaptionOverlayBinding

class CaptionOverlayView(private val context: Context) {

    private val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val handler = Handler(Looper.getMainLooper())
    private var binding: ViewCaptionOverlayBinding? = null
    private var onTranslate: ((String) -> Unit)? = null
    private var lastFinalText = ""

    fun setOnTranslateListener(l: (String) -> Unit) { onTranslate = l }

    fun show() {
        handler.post {
            if (binding != null) return@post
            val b = ViewCaptionOverlayBinding.inflate(LayoutInflater.from(context))
            binding = b
            b.tvCaption.text = "Listening…"
            b.btnTranslate.setOnClickListener {
                val text = lastFinalText.ifBlank { b.tvCaption.text.toString() }
                if (text.isNotBlank() && text != "Listening…") {
                    onTranslate?.invoke(text)
                }
            }
            b.btnDismiss.setOnClickListener { hide() }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                y = 80
            }
            wm.addView(b.root, params)
        }
    }

    fun updateInterim(text: String) {
        handler.post {
            binding?.tvCaption?.text = text
        }
    }

    fun updateFinal(text: String) {
        handler.post {
            lastFinalText = text
            binding?.tvCaption?.text = text
        }
    }

    fun hide() {
        handler.post {
            binding?.let {
                try { wm.removeView(it.root) } catch (_: Exception) {}
            }
            binding = null
        }
    }
}

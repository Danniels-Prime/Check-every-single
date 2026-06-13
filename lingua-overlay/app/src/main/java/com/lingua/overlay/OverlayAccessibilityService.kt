package com.lingua.overlay

import android.accessibilityservice.AccessibilityService
import android.content.ClipboardManager
import android.view.accessibility.AccessibilityEvent

class OverlayAccessibilityService : AccessibilityService() {

    private var overlay: TranslationOverlayView? = null
    private var clipboardManager: ClipboardManager? = null
    private var lastText = ""

    private val clipListener = ClipboardManager.OnPrimaryClipChangedListener {
        val clip = clipboardManager?.primaryClip ?: return@OnPrimaryClipChangedListener
        val text = clip.getItemAt(0)?.coerceToText(applicationContext)?.toString()?.trim() ?: return@OnPrimaryClipChangedListener
        if (text.isBlank() || text == lastText || text.length > 200) return@OnPrimaryClipChangedListener
        lastText = text
        translate(text, "")
    }

    override fun onServiceConnected() {
        overlay = TranslationOverlayView(applicationContext)
        clipboardManager = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
        clipboardManager?.addPrimaryClipChangedListener(clipListener)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED) return
        val node = event.source ?: return
        val text = node.text?.toString() ?: return
        val start = node.textSelectionStart
        val end = node.textSelectionEnd
        if (start < 0 || end <= start || end > text.length) return
        val selected = text.substring(start, end).trim()
        if (selected.isBlank() || selected == lastText || selected.length > 200) return
        lastText = selected
        val context = extractContext(text, start, end)
        translate(selected, context)
    }

    private fun translate(text: String, context: String) {
        val apiKey = Prefs.getClaudeKey(applicationContext)
        if (apiKey.isBlank()) {
            overlay?.show(text, "Open LinguaOverlay → Settings → add Claude API key", "", "")
            return
        }
        overlay?.showLoading(text)
        ClaudeApiClient.explain(
            word = text,
            context = context,
            apiKey = apiKey,
            onResult = { translation, explanation, examples ->
                overlay?.updateContent(text, translation, explanation, examples)
            },
            onError = { error ->
                overlay?.showError(text, error)
            }
        )
    }

    private fun extractContext(text: String, start: Int, end: Int): String {
        val from = maxOf(0, start - 60)
        val to = minOf(text.length, end + 60)
        return text.substring(from, to).trim()
    }

    override fun onInterrupt() {
        overlay?.dismiss()
    }

    override fun onDestroy() {
        clipboardManager?.removePrimaryClipChangedListener(clipListener)
        overlay?.destroy()
        super.onDestroy()
    }
}

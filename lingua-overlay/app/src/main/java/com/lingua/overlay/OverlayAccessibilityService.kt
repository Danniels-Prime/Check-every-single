package com.lingua.overlay

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class OverlayAccessibilityService : AccessibilityService() {

    private var overlay: TranslationOverlayView? = null
    private var lastWord = ""

    override fun onServiceConnected() {
        overlay = TranslationOverlayView(applicationContext)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED) return

        val node = event.source ?: return
        val text = node.text?.toString() ?: return
        val start = node.textSelectionStart
        val end = node.textSelectionEnd

        if (start < 0 || end <= start || end > text.length) return

        val selected = text.substring(start, end).trim()
        if (selected.isBlank() || selected == lastWord) return
        if (selected.length > 80) return  // ignore huge selections

        lastWord = selected

        val contextText = extractSurroundingContext(text, start, end)
        val apiKey = Prefs.getClaudeKey(applicationContext)

        if (apiKey.isBlank()) {
            overlay?.show(selected, "Add Claude API key in Settings", "", "")
            return
        }

        overlay?.showLoading(selected)

        ClaudeApiClient.explain(
            word = selected,
            context = contextText,
            apiKey = apiKey,
            onResult = { translation, explanation, examples ->
                overlay?.updateContent(selected, translation, explanation, examples)
            },
            onError = { error ->
                overlay?.showError(selected, error)
            }
        )
    }

    private fun extractSurroundingContext(text: String, start: Int, end: Int): String {
        val from = maxOf(0, start - 60)
        val to = minOf(text.length, end + 60)
        return text.substring(from, to).trim()
    }

    override fun onInterrupt() {
        overlay?.dismiss()
    }

    override fun onDestroy() {
        overlay?.destroy()
        super.onDestroy()
    }
}

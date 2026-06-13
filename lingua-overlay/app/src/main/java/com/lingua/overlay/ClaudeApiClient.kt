package com.lingua.overlay

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

object ClaudeApiClient {

    private val client = OkHttpClient()
    private const val URL = "https://api.anthropic.com/v1/messages"

    fun explain(
        word: String,
        context: String,
        apiKey: String,
        onResult: (translation: String, explanation: String, examples: String) -> Unit,
        onError: (String) -> Unit
    ) {
        val prompt = buildPrompt(word, context)
        val body = JSONObject().apply {
            put("model", "claude-haiku-4-5-20251001")
            put("max_tokens", 300)
            put("messages", JSONArray().apply {
                put(JSONObject().apply {
                    put("role", "user")
                    put("content", prompt)
                })
            })
        }.toString()

        val request = Request.Builder()
            .url(URL)
            .post(body.toRequestBody("application/json".toMediaType()))
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) = onError(e.message ?: "Network error")

            override fun onResponse(call: Call, response: Response) {
                val text = response.body?.string() ?: return onError("Empty response")
                if (!response.isSuccessful) return onError("API error ${response.code}")
                try {
                    val content = JSONObject(text)
                        .getJSONArray("content")
                        .getJSONObject(0)
                        .getString("text")
                    parseResponse(content, onResult, onError)
                } catch (e: Exception) {
                    onError("Parse error: ${e.message}")
                }
            }
        })
    }

    private fun buildPrompt(word: String, context: String): String {
        val ctx = if (context.isNotBlank()) "\nContext: \"$context\"" else ""
        return """Explain the word or phrase: "$word"$ctx

Reply in this exact format (3 lines, no extra text):
TRANSLATION: <English translation in 1-5 words>
EXPLANATION: <natural explanation of meaning/usage in 1-2 sentences>
EXAMPLES: <one short example sentence using it>"""
    }

    private fun parseResponse(
        text: String,
        onResult: (String, String, String) -> Unit,
        onError: (String) -> Unit
    ) {
        val lines = text.trim().lines()
        val translation = lines.firstOrNull { it.startsWith("TRANSLATION:") }
            ?.removePrefix("TRANSLATION:")?.trim() ?: ""
        val explanation = lines.firstOrNull { it.startsWith("EXPLANATION:") }
            ?.removePrefix("EXPLANATION:")?.trim() ?: ""
        val examples = lines.firstOrNull { it.startsWith("EXAMPLES:") }
            ?.removePrefix("EXAMPLES:")?.trim() ?: ""
        if (translation.isBlank() && explanation.isBlank()) {
            onError("Could not parse response")
        } else {
            onResult(translation, explanation, examples)
        }
    }
}

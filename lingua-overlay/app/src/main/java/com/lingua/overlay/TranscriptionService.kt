package com.lingua.overlay

import android.app.*
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.IBinder
import androidx.core.app.NotificationCompat
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class TranscriptionService : Service() {

    companion object {
        var isRunning = false
        private const val CHANNEL_ID = "lingua_transcription"
        private const val NOTIF_ID = 1001
    }

    private var audioRecord: AudioRecord? = null
    private var wsClient: WebSocket? = null
    private val okhttp = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
    private var overlay: TranslationOverlayView? = null
    private var recording = false

    override fun onCreate() {
        super.onCreate()
        overlay = TranslationOverlayView(applicationContext)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIF_ID, buildNotification())
        isRunning = true
        startTranscription()
        return START_NOT_STICKY
    }

    private fun startTranscription() {
        val apiKey = Prefs.getDeepgramKey(applicationContext)
        if (apiKey.isBlank()) {
            stopSelf()
            return
        }

        val url = "wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&interim_results=true&smart_format=true"
        val request = Request.Builder()
            .url(url)
            .header("Authorization", "Token $apiKey")
            .build()

        wsClient = okhttp.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                startAudioCapture(webSocket)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val channel = json.optJSONObject("channel") ?: return
                    val alternatives = channel.optJSONArray("alternatives") ?: return
                    val transcript = alternatives.getJSONObject(0).optString("transcript") ?: return
                    val isFinal = json.optBoolean("is_final", false)
                    if (transcript.isNotBlank() && isFinal) {
                        showTranscriptOverlay(transcript)
                    }
                } catch (_: Exception) {}
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                stopSelf()
            }
        })
    }

    private fun startAudioCapture(ws: WebSocket) {
        val sampleRate = 16000
        val bufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        ) * 4

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        audioRecord?.startRecording()
        recording = true

        Thread {
            val buffer = ByteArray(bufferSize)
            while (recording) {
                val read = audioRecord?.read(buffer, 0, buffer.size) ?: break
                if (read > 0) {
                    ws.send(okio.ByteString.of(*buffer.copyOf(read)))
                }
            }
        }.start()
    }

    private fun showTranscriptOverlay(transcript: String) {
        val apiKey = Prefs.getClaudeKey(applicationContext)
        if (apiKey.isBlank()) {
            overlay?.show(transcript, "Add Claude API key in Settings to get explanations", "", "")
            return
        }

        overlay?.showLoading(transcript)
        ClaudeApiClient.explain(
            word = transcript,
            context = "",
            apiKey = apiKey,
            onResult = { translation, explanation, examples ->
                overlay?.updateContent(transcript, translation, explanation, examples)
            },
            onError = { error ->
                overlay?.showError(transcript, error)
            }
        )
    }

    override fun onDestroy() {
        recording = false
        audioRecord?.stop()
        audioRecord?.release()
        wsClient?.close(1000, "Service stopped")
        overlay?.destroy()
        isRunning = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID, "Live Transcription",
            NotificationManager.IMPORTANCE_LOW
        ).apply { description = "LinguaOverlay live transcription" }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val stopIntent = PendingIntent.getService(
            this, 0,
            Intent(this, TranscriptionService::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_CANCEL_CURRENT
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("LinguaOverlay")
            .setContentText("Listening… tap words to translate")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .addAction(android.R.drawable.ic_media_pause, "Stop", stopIntent)
            .build()
    }
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscribe: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInputButton({
  onTranscribe,
  disabled = false,
  className,
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptText, setTranscriptText] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRecordingRef = useRef(false);

  // Check browser support and permissions on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      setHasPermission(false);
      return;
    }

    // Check permissions
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasPermission(true);
      })
      .catch((error) => {
        console.error("Microphone permission denied:", error);
        setHasPermission(false);
      });
  }, []);

  // Draw waveform visualization
  useEffect(() => {
    if (!isRecording) return;

    const drawWaveform = () => {
      if (!canvasRef.current || !analyserRef.current || !isRecordingRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Get time domain data for waveform
      analyser.getByteTimeDomainData(dataArray);

      // Calculate average volume from frequency data
      const freqData = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqData);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += freqData[i];
      }
      const average = sum / bufferLength;
      setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1

      // Clear canvas
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ef4444";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    // Start the animation loop
    drawWaveform();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    console.log("Starting recording...");

    try {
      // Get microphone access and setup audio context
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error("Speech recognition not available");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log("Recognition started");
        setTranscriptText("");
        finalTranscript = "";
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript = transcript;
          }
        }

        setTranscriptText(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Recognition error:", event.error);

        if (event.error === "not-allowed") {
          alert("Microphone permission denied");
          setHasPermission(false);
        } else if (event.error === "no-speech") {
          // Continue recording
          return;
        }

        if (event.error !== "no-speech" && event.error !== "aborted") {
          stopRecording();
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        if (finalTranscript.trim()) {
          onTranscribe(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      setIsRecording(true);
      isRecordingRef.current = true;
      setIsProcessing(false);

    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Failed to access microphone. Please check permissions.");
      stopRecording();
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
      recognitionRef.current = null;
    }

    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log("Audio context already closed");
      }
      audioContextRef.current = null;
    }

    // Reset refs and state
    analyserRef.current = null;
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsProcessing(false);
    setAudioLevel(0);
    setTranscriptText("");
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  if (hasPermission === false) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToggleRecording}
        disabled={disabled || isProcessing}
        className={cn(
          "relative transition-all duration-200",
          isRecording && "bg-red-100 text-red-600 hover:bg-red-200",
          className
        )}
        aria-label={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Waveform visualization popup */}
      {isRecording && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-red-500 rounded-lg p-4 shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-semibold">Recording...</span>
            </div>

            {/* Waveform canvas */}
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              className="border border-gray-300 rounded"
            />

            {/* Volume level bars */}
            <div className="flex items-center gap-1 h-8">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-sm transition-all duration-75",
                    audioLevel > i * 0.05
                      ? i < 7
                        ? "bg-green-500"
                        : i < 14
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      : "bg-gray-300"
                  )}
                  style={{
                    height: `${Math.sin((i / 19) * Math.PI) * 24 + 8}px`,
                  }}
                />
              ))}
            </div>

            {/* Live transcript */}
            {transcriptText && (
              <div className="w-full max-w-sm p-2 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700 text-center">{transcriptText}</p>
              </div>
            )}

            <p className="text-xs text-gray-500">Click the mic button to stop</p>
          </div>
        </div>
      )}
    </div>
  );
}
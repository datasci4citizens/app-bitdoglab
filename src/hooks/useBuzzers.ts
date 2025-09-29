import { useEffect, useRef, useState } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { BuzzersController } from "../utils/buzzersController";
import type { Note } from "../types/notes";
import { noteToFrequency } from "../types/notes";

/**
 * Custom hook to manage Piano Buzzer state and recording
 * @param sendCommand - Function to send commands to the device
 * @param isRecording - Whether the app is currently recording a performance
 */
export const useBuzzers = (
  sendCommand: (command: string) => Promise<void>,
  isRecording: boolean
) => {
  const buzzersController = useRef<BuzzersController | null>(null);
  const hasInitialized = useRef(false);
  const [octave, setOctave] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Gravação
  const recordingBuffer = useRef<any[]>([]);
  const recordingStartTime = useRef<number | null>(null);
  const lastEventTime = useRef<number | null>(null);

  // Inicializa o controller uma vez só
  useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;
  
  const initBuzzer = async () => {
    buzzersController.current = new BuzzersController(sendCommand);
    // Faz o setup imediatamente e garante que o buzzer esteja parado
    try {
      await buzzersController.current.setupBuzzer();
      // Envia comando de stop para garantir que o buzzer esteja parado
      await buzzersController.current.stopBuzzer(0);
    } catch (error) {
      console.error("Erro na inicialização do buzzer:", error);
    }
  };
  
  initBuzzer();
}, [sendCommand]);

  // Bloqueia landscape
  useEffect(() => {
    ScreenOrientation.lock({ orientation: "landscape" });
    return () => {
      ScreenOrientation.lock({ orientation: "portrait" });
    };
  }, []);

  // Quando inicia a gravação, zera buffer e timestamps
  useEffect(() => {
    if (isRecording) {
      recordingBuffer.current = [];
      recordingStartTime.current = Date.now();
      lastEventTime.current = recordingStartTime.current;
    }
  }, [isRecording]);

  /**
   * Manipula o evento de pressionar uma tecla (onMouseDown)
   * @param note - Nota musical pressionada
   */
  const handleNotePress = async (note: Note) => {
    const selectedOctave = octave;
    const frequency = noteToFrequency(note, selectedOctave);
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    // Lógica de gravação
    if (isRecording && recordingStartTime.current && lastEventTime.current) {
      const now = Date.now();
      const delay = now - lastEventTime.current;
      recordingBuffer.current.push({
        frequency: Math.round(frequency),
        delay,
        isPressed: true
      });
      lastEventTime.current = now;
    }

    try {
      await buzzersController.current?.startBuzzer(frequency);
    } catch (error) {
      console.error("Erro ao iniciar nota:", error);
      setIsPlaying(false);
    }
  };

  /**
   * Manipula o evento de soltar uma tecla (onMouseUp)
   * @param note - Nota musical que foi solta
   */
  const handleNoteRelease = async () => {
    if (!startTimeRef.current) return;

    const duration = Date.now() - startTimeRef.current;
    const minDuration = Math.max(duration, 50);
    setIsPlaying(false);
    startTimeRef.current = null;

    // Lógica de gravação
    if (isRecording && lastEventTime.current) {
      const now = Date.now();
      // O delay do "release" pode não ser necessário, mas pode ser interessante registrar
      recordingBuffer.current.push({
        isPressed: false,
        duration: duration,
        delay: now - lastEventTime.current
      });
      lastEventTime.current = now;
    }

    try {
      await buzzersController.current?.stopBuzzer(minDuration);
    } catch (error) {
      console.error("Erro ao parar nota:", error);
    }
  };

  // Expondo o buffer de gravação para uso futuro, se necessário
  const getRecordingBuffer = () => recordingBuffer.current;

  return {
    octave,
    setOctave,
    isPlaying,
    handleNotePress,
    handleNoteRelease,
    getRecordingBuffer, // pode ser usado depois para exportar/salvar
	buzzersController: buzzersController.current 
  };
};
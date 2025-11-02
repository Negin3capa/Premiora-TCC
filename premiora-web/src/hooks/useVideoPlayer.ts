/**
 * Hook personalizado para gerenciar player de vídeo
 * Centraliza lógica de estado e controles do player
 */
import { useState, useRef, useCallback } from 'react';

/**
 * Estado do player de vídeo
 */
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

/**
 * Hook para gerenciar player de vídeo
 */
export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estado do player
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false
  });

  /**
   * Atualiza estado do player
   */
  const updatePlayerState = useCallback((updates: Partial<VideoPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handler para play/pause
   */
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (playerState.isPlaying) {
      videoRef.current.pause();
      updatePlayerState({ isPlaying: false });
    } else {
      videoRef.current.play();
      updatePlayerState({ isPlaying: true });
    }
  }, [playerState.isPlaying, updatePlayerState]);

  /**
   * Handler para atualização de tempo
   */
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    updatePlayerState({ currentTime: videoRef.current.currentTime });
  }, [updatePlayerState]);

  /**
   * Handler para metadados carregados
   */
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    updatePlayerState({ duration: videoRef.current.duration });
  }, [updatePlayerState]);

  /**
   * Handler para seek (busca)
   */
  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = time;
    updatePlayerState({ currentTime: time });
  }, [updatePlayerState]);

  /**
   * Handler para mudança de volume
   */
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;

    videoRef.current.volume = newVolume;
    updatePlayerState({
      volume: newVolume,
      isMuted: newVolume === 0
    });
  }, [updatePlayerState]);

  /**
   * Handler para mute/unmute
   */
  const handleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMutedState = !playerState.isMuted;
    videoRef.current.muted = newMutedState;
    updatePlayerState({ isMuted: newMutedState });
  }, [playerState.isMuted, updatePlayerState]);

  /**
   * Handler para fullscreen
   */
  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!playerState.isFullscreen) {
      videoRef.current.requestFullscreen?.();
      updatePlayerState({ isFullscreen: true });
    } else {
      document.exitFullscreen?.();
      updatePlayerState({ isFullscreen: false });
    }
  }, [playerState.isFullscreen, updatePlayerState]);

  /**
   * Formata tempo para display
   */
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Reseta estado do player
   */
  const resetPlayer = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setPlayerState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      isFullscreen: false
    });
  }, []);

  return {
    // Referência do vídeo
    videoRef,

    // Estado
    playerState,

    // Handlers
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    handleMute,
    handleFullscreen,
    formatTime,
    resetPlayer,

    // Utilitários
    updatePlayerState
  };
};

import { useState, useEffect, useCallback } from 'react';

export interface PhotoState {
  src: string;
  x: number;
  y: number;
  width: number;
}

const DEFAULT_PHOTO: PhotoState = {
  src: '',
  x: 80,
  y: 5,
  width: 15,
};

const STORAGE_KEY = 'cv-photo-storage';

// 存储监听器，用于跨组件同步
const listeners = new Set<(value: PhotoState) => void>();

function getStoredPhoto(): PhotoState {
  if (typeof window === 'undefined') return DEFAULT_PHOTO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PhotoState) : DEFAULT_PHOTO;
  } catch {
    return DEFAULT_PHOTO;
  }
}

function setStoredPhoto(value: PhotoState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    // 通知所有监听器
    listeners.forEach(listener => listener(value));
  } catch {
    /* ignore */
  }
}

export function usePhoto() {
  const [photo, setPhotoState] = useState<PhotoState>(getStoredPhoto);

  const setPhoto = useCallback((value: PhotoState) => {
    setPhotoState(value);
    setStoredPhoto(value);
  }, []);

  useEffect(() => {
    const listener = (value: PhotoState) => {
      setPhotoState(value);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { photo, setPhoto };
}


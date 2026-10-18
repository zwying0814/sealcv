"use client";

import { useState, useEffect, useCallback } from "react";

// 存储每个 key 的监听器
const listeners = new Map<string, Set<(value: string | null) => void>>();

function emitStorageChange(key: string, value: string | null) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach(listener => listener(value));
  }
}

/**
 * A simple localStorage-backed state hook.
 * Reads the initial value from localStorage (if available), and writes
 * back on every change. Safe for SSR — returns the default value when
 * `window` is undefined.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      // 通知其他使用相同 key 的组件
      emitStorageChange(key, JSON.stringify(value));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const listener = (stored: string | null) => {
      try {
        const newValue = stored !== null ? (JSON.parse(stored) as T) : defaultValue;
        setValue(newValue);
      } catch {
        setValue(defaultValue);
      }
    };

    // 添加监听器
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key)!.add(listener);

    // 监听 storage 事件（跨标签页同步）
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        listener(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      listeners.get(key)?.delete(listener);
      if (listeners.get(key)?.size === 0) {
        listeners.delete(key);
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [key, defaultValue]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue(v);
  }, []);

  return [value, set];
}

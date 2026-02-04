'use client';

import { useEffect, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket, startGeneration, answerQuestion, getSocket } from '@/lib/socket';
import { useContextStore } from '@/store/contextStore';
import { useCalculatorStore } from '@/store/calculatorStore';

export function useSocket() {
  const isConnected = useRef(false);
  const {
    sessionId,
    projectName,
    businessType,
    businessDescription,
    targetAudience,
    mainFeatures,
    budget,
    designPreferences,
    integrations,
    timeline,
    setGenerationStatus,
  } = useContextStore();

  const { getSelectedOptionsArray } = useCalculatorStore();

  // Socket connection is now optional - we use BullMQ pipeline instead
  // Only connect when explicitly needed for legacy features
  useEffect(() => {
    // Don't auto-connect - socket server may not be running
    // Connection will happen on-demand when startKpGeneration is called
    return () => {
      // Cleanup on unmount
    };
  }, []);

  // Start generation
  const startKpGeneration = useCallback(async () => {
    // Set initial status
    setGenerationStatus({
      state: 'queued',
      progress: 0,
      currentStep: 'analysis',
    });

    // Get selected services from calculator
    const selectedServices = getSelectedOptionsArray().map((opt) => ({
      name: opt.name,
      price: opt.price,
      quantity: opt.quantity,
    }));

    // Build context
    const context = {
      projectName,
      businessType,
      businessDescription,
      targetAudience,
      mainFeatures,
      budget,
      designPreferences,
      integrations,
      timeline,
    };

    // Start generation via socket
    startGeneration({
      sessionId,
      context,
      selectedServices,
    });
  }, [
    sessionId,
    projectName,
    businessType,
    businessDescription,
    targetAudience,
    mainFeatures,
    budget,
    designPreferences,
    integrations,
    timeline,
    setGenerationStatus,
    getSelectedOptionsArray,
  ]);

  // Answer BMAD question
  const submitAnswer = useCallback((jobId: string, questionId: string, answer: string) => {
    answerQuestion(jobId, questionId, answer);
  }, []);

  // Check connection status
  const checkConnection = useCallback(() => {
    const socket = getSocket();
    return socket.connected;
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    disconnectSocket();
    connectSocket();
  }, []);

  return {
    startKpGeneration,
    submitAnswer,
    checkConnection,
    reconnect,
    disconnect: disconnectSocket,
  };
}

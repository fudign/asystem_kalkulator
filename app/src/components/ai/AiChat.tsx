'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/cn';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useContextStore, useIsReadyToGenerate, useGenerationStatus } from '@/store/contextStore';
import { askAi } from '@/app/actions/ai';
import { categories } from '@/data/categories';
import { GenerateButton } from '@/components/generation';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Здравствуйте! Расскажите, что хотите создать — сайт, приложение, бот? Я подберу услуги и сразу выберу их в калькуляторе!',
      role: 'assistant',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getSelectedOptionsArray, getTotal, toggleOption, reset } = useCalculatorStore();

  // Context tracking for КП generation
  const contextStore = useContextStore();
  const { extractContextFromMessage, addMessage, updateField, setGenerationStatus } = contextStore;
  const isReadyToGenerate = useIsReadyToGenerate();
  const generationStatus = useGenerationStatus();
  const { data: session } = useSession();

  // Poll project status and notify when complete
  const pollProjectStatus = async (projectId: string) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`/api/generator/status?projectId=${projectId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setGenerationStatus({
            state: 'completed',
            progress: 100,
            result: data,
          });

          const completedMessage: Message = {
            id: Date.now().toString(),
            content: `🎉 **Ваш сайт готов!**\n\n` +
              `🌐 **Демо-сайт:** [Открыть](${data.deployedUrl})\n\n` +
              (data.kpPdfUrl ? `📄 **КП:** Скачать PDF\n\n` : '') +
              (data.presentationPdfUrl ? `📊 **Презентация:** Скачать PDF\n\n` : '') +
              `Спасибо что выбрали ASYSTEM.KG!`,
            role: 'assistant',
          };
          setMessages((prev) => [...prev, completedMessage]);
          return;
        }

        if (data.status === 'failed') {
          setGenerationStatus({
            state: 'failed',
            progress: 0,
            error: data.lastError || 'Ошибка генерации',
          });
          return;
        }

        // Update progress based on status
        const progressMap: Record<string, number> = {
          'pending': 5,
          'researching': 15,
          'planning': 30,
          'approved': 40,
          'generating': 60,
          'deploying': 80,
          'generating_documents': 90,
        };

        setGenerationStatus({
          state: 'generating',
          progress: progressMap[data.status] || 50,
          currentStep: data.status,
        });

        // Continue polling if not done
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Status poll error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  // Handler for starting КП generation via BullMQ pipeline
  const handleGenerate = async () => {
    if (!session?.user) {
      const loginMessage: Message = {
        id: Date.now().toString(),
        content: '⚠️ Для генерации КП необходимо войти в систему.',
        role: 'assistant',
      };
      setMessages((prev) => [...prev, loginMessage]);
      return;
    }

    // Set generating status
    setGenerationStatus({
      state: 'generating',
      progress: 5,
      currentStep: 'intake',
    });

    // Add a message to chat
    const generatingMessage: Message = {
      id: Date.now().toString(),
      content: '🚀 Запускаю генерацию КП и демо-сайта. Pipeline: Анализ → Исследование → Планирование → Генерация → Деплой → Документы. Это займёт несколько минут!',
      role: 'assistant',
    };
    setMessages((prev) => [...prev, generatingMessage]);

    try {
      // Collect intake data from context
      const intakeData = {
        companyName: contextStore.projectName || 'Без названия',
        businessType: contextStore.businessType || 'Другое',
        businessDescription: contextStore.businessDescription || '',
        targetAudience: contextStore.targetAudience || '',
        competitors: [],
        siteGoals: Array.isArray(contextStore.mainFeatures) ? contextStore.mainFeatures : [],
        designPreferences: contextStore.designPreferences || '',
        additionalNotes: '',
        contactName: (session.user as any).name || 'Клиент',
        contactEmail: (session.user as any).email || '',
        contactPhone: (session.user as any).phone || '',
      };

      // Submit to BullMQ pipeline via API
      const response = await fetch('/api/generator/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeData),
      });

      const result = await response.json();

      if (response.ok) {
        setGenerationStatus({
          state: 'generating',
          progress: 10,
          currentStep: 'research',
        });

        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `✅ Отлично! Ваш сайт генерируется. Это займёт 2-3 минуты. Когда будет готово - вы получите уведомление и ссылку на демо-сайт, КП и презентацию прямо сюда в чат!`,
          role: 'assistant',
        };
        setMessages((prev) => [...prev, successMessage]);

        // Start polling for status
        pollProjectStatus(result.projectId);
      } else {
        throw new Error(result.error || 'Ошибка создания проекта');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus({
        state: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Ошибка: ${error instanceof Error ? error.message : 'Не удалось запустить генерацию'}`,
        role: 'assistant',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Note: Completion/failure messages are now handled by pollProjectStatus

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Extract context from user message for КП generation
    extractContextFromMessage(content);
    addMessage({ role: 'user', content });

    try {
      const selectedOptions = getSelectedOptionsArray();
      const total = getTotal();

      // Передаём полную информацию об услугах включая ID
      const context = {
        selectedServices: selectedOptions.map((opt) => ({
          name: opt.name,
          quantity: opt.quantity,
          price: opt.price,
        })),
        total,
        availableCategories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          options: cat.options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            categoryId: cat.id,
            price: opt.price,
          })),
        })),
      };

      const response = await askAi(content, context);

      // Если AI сказал очистить — сбрасываем весь выбор
      if (response.clearFirst) {
        reset();
      }

      // Автоматически выбираем услуги, которые рекомендовал AI
      if (response.selectServices && response.selectServices.length > 0) {
        for (const service of response.selectServices) {
          // Проверяем, что услуга существует
          const category = categories.find((c) => c.id === service.categoryId);
          const option = category?.options.find((o) => o.id === service.id);

          if (option && category) {
            toggleOption(category.id, option.id, option.price, option.name, option.hasQuantity);
          }
        }
      }

      // Обрабатываем извлечённый контекст от AI
      if (response.extractedContext) {
        const ctx = response.extractedContext;
        if (ctx.projectName) updateField('projectName', ctx.projectName);
        if (ctx.businessType) updateField('businessType', ctx.businessType);
        if (ctx.targetAudience) updateField('targetAudience', ctx.targetAudience);
        if (ctx.mainFeatures && ctx.mainFeatures.length > 0) {
          updateField('mainFeatures', ctx.mainFeatures);
        }
        if (ctx.budget) updateField('budget', ctx.budget);
        if (ctx.timeline) updateField('timeline', ctx.timeline);

        console.log('[AiChat] Extracted context:', ctx);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        role: 'assistant',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full',
          'bg-blue-500 text-white shadow-lg',
          'flex items-center justify-center',
          'hover:bg-blue-600 transition-colors',
          'z-40',
          isOpen && 'hidden'
        )}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 w-96 h-[500px] max-h-[80vh]',
          'bg-white rounded-2xl shadow-2xl border border-gray-200',
          'flex flex-col overflow-hidden',
          'z-50 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-500 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="font-medium">AI Помощник</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              role={message.role}
            />
          ))}
          {isLoading && (
            <MessageBubble content="" role="assistant" isLoading />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Generate Button - shows progress and button when ready */}
        <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0 bg-white">
          <GenerateButton onGenerate={handleGenerate} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </>
  );
}

'use client';

import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Calculator } from '@/components/calculator';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { AiChat } from '@/components/ai';
import { ProgressPanel, QuestionModal, ResultPanel } from '@/components/generation';
import { UserMenu } from '@/components/auth';
import { useGenerationStatus, useContextStore } from '@/store/contextStore';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const status = useGenerationStatus();
  const { generationJobId } = useContextStore();
  const { submitAnswer } = useSocket();

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    if (generationJobId) {
      submitAnswer(generationJobId, questionId, answer);
    }
  };

  const isGenerating = status && status.state !== 'completed' && status.state !== 'failed';
  const isCompleted = status?.state === 'completed';

  return (
    <div className="min-h-screen bg-white">
      {/* User Menu - fixed in top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <UserMenu />
      </div>

      <Header />
      <main>
        <Hero />
        <Calculator />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <AiChat />

      {/* Generation UI - shown during КП generation process */}
      {/* Progress/Result Panel - appears as overlay on left side */}
      {(isGenerating || isCompleted) && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 w-80 max-h-[80vh] overflow-y-auto">
          {isGenerating && <ProgressPanel />}
          {isCompleted && <ResultPanel />}
        </div>
      )}

      {/* Question Modal - full screen overlay */}
      <QuestionModal onAnswer={handleQuestionAnswer} />
    </div>
  );
}

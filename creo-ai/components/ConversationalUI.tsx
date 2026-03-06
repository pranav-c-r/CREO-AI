'use client';

/**
 * Conversational UI Components
 * Interactive components for the question-answer flow
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationQuestion, ConversationState } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { ChevronRight, ChevronLeft, Loader2, Check, X } from 'lucide-react';

interface ConversationalQuestionProps {
  question: ConversationQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
  isLoading?: boolean;
}

export function ConversationalQuestion({
  question,
  answer,
  onAnswer,
  onNext,
  onBack,
  canGoBack,
  isLastQuestion,
  isLoading = false
}: ConversationalQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(answer || []);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    try {
      // Validate answer
      if (question.required && (!localAnswer && selectedOptions.length === 0)) {
        setError('This question is required');
        return;
      }

      if (question.type === 'text' || question.type === 'textarea') {
        if (question.validation?.min && localAnswer.length < question.validation.min) {
          setError(`Minimum ${question.validation.min} characters required`);
          return;
        }
        if (question.validation?.max && localAnswer.length > question.validation.max) {
          setError(`Maximum ${question.validation.max} characters allowed`);
          return;
        }
        onAnswer(localAnswer);
      } else if (question.type === 'select') {
        onAnswer(localAnswer);
      } else if (question.type === 'multiselect') {
        onAnswer(selectedOptions);
      } else if (question.type === 'number') {
        const num = Number(localAnswer);
        if (isNaN(num)) {
          setError('Please enter a valid number');
          return;
        }
        if (question.validation?.min && num < question.validation.min) {
          setError(`Minimum value is ${question.validation.min}`);
          return;
        }
        if (question.validation?.max && num > question.validation.max) {
          setError(`Maximum value is ${question.validation.max}`);
          return;
        }
        onAnswer(num);
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid answer');
    }
  };

  const handleMultiSelectToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full"
            disabled={isLoading}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full resize-none"
            disabled={isLoading}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full"
            disabled={isLoading}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={localAnswer}
              onChange={(e) => setLocalAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
              disabled={isLoading}
            >
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleMultiSelectToggle(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}
        {question.required && (
          <p className="text-xs text-red-500 font-medium">* Required</p>
        )}
      </div>

      {/* Question Input */}
      <div className="space-y-4">
        {renderQuestionInput()}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          disabled={!canGoBack || isLoading}
          variant="outline"
          size="sm"
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          size="sm"
          icon={isLoading ? null : <ChevronRight className="w-4 h-4" />}
          className="min-w-25"
        >
          {isLoading ? 'Processing...' : isLastQuestion ? 'Complete' : 'Next'}
        </Button>
      </div>
    </motion.div>
  );
}

interface ConversationalFlowProps {
  conversation: ConversationState;
  onAnswer: (answer: any) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
  isLoading?: boolean;
  currentQuestion: ConversationQuestion | null;
  progress: { current: number; total: number; percentage: number };
}

export function ConversationalFlow({
  conversation,
  onAnswer,
  onNext,
  onBack,
  onReset,
  isLoading = false,
  currentQuestion,
  progress
}: ConversationalFlowProps) {
  if (conversation.isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">All Set!</h3>
        <p className="text-gray-600 mb-6">
          We've gathered all the information needed to create your perfect social media post.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={onReset}
            variant="outline"
            icon={<X className="w-4 h-4" />}
          >
            Start Over
          </Button>
          <Button
            onClick={onNext}
            loading={isLoading}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            Generate Content
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Question {progress.current + 1} of {progress.total}</span>
          <span className="text-gray-800 font-medium">{progress.percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <Card className="p-6">
            <ConversationalQuestion
              question={currentQuestion}
              answer={conversation.answers[currentQuestion.id]}
              onAnswer={onAnswer}
              onNext={onNext}
              onBack={onBack}
              canGoBack={progress.current > 0}
              isLastQuestion={progress.current === progress.total - 1}
              isLoading={isLoading}
            />
          </Card>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          icon={<X className="w-4 h-4" />}
          className="text-gray-500 hover:text-gray-700"
        >
          Reset Conversation
        </Button>
      </div>
    </div>
  );
}

interface ConversationStarterProps {
  onStart: (flowId: string) => void;
  isLoading?: boolean;
}

export function ConversationStarter({ onStart, isLoading = false }: ConversationStarterProps) {
  const [selectedFlow, setSelectedFlow] = useState('');
  const [customInput, setCustomInput] = useState('');

  const flows = [
    { id: 'product-promotion', name: 'Product Promotion', desc: 'Sell your products effectively' },
    { id: 'service-business', name: 'Service Business', desc: 'Promote your professional services' },
    { id: 'event-promotion', name: 'Event Promotion', desc: 'Create buzz for your events' },
    { id: 'general-content', name: 'General Content', desc: 'For any other type of post' }
  ];

  const handleStart = () => {
    if (selectedFlow) {
      onStart(selectedFlow);
    } else if (customInput.trim()) {
      // Auto-detect flow from custom input
      onStart('auto-detect');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">Let's Create Your Post Together</h3>
        <p className="text-gray-600">
          I'll ask you a few questions to understand exactly what you need, then create the perfect content for you.
        </p>
      </div>

      {/* Quick Start Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {flows.map((flow) => (
          <motion.button
            key={flow.id}
            onClick={() => setSelectedFlow(flow.id)}
            className={`p-4 border-2 rounded-xl text-left transition-all ${
              selectedFlow === flow.id
                ? 'bg-blue-50 border-blue-500 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="font-semibold text-gray-800 mb-1">{flow.name}</h4>
            <p className="text-sm text-gray-600">{flow.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Or describe what you want in your own words:</p>
        <div className="max-w-md mx-auto">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g., Instagram post for my handmade jewelry business"
            className="w-full"
          />
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStart}
          disabled={(!selectedFlow && !customInput.trim()) || isLoading}
          loading={isLoading}
          size="lg"
          icon={<ChevronRight className="w-5 h-5" />}
          className="min-w-37.5"
        >
          {isLoading ? 'Starting...' : 'Start Conversation'}
        </Button>
      </div>
    </motion.div>
  );
}

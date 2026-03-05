'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationQuestion, ConversationState } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Check, 
  X,
  Sparkles,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Circle,
  ArrowRight,
  Send,
  Bot,
  User,
  Star,
  Zap,
  Target,
  Calendar,
  Hash,
  Globe2,
  Palette,
  Music,
  Camera,
  Film,
  Mic,
  PenTool,
  Rocket,
  Shield,
  Heart,
  Smile
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const questionVariants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    x: -50, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

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

function QuestionInput({ question, value, onChange, error, isLoading }: any) {
  const [isFocused, setIsFocused] = useState(false);

  const getIcon = () => {
    switch (question.type) {
      case 'text': return <PenTool className="w-5 h-5" />;
      case 'textarea': return <MessageCircle className="w-5 h-5" />;
      case 'number': return <Hash className="w-5 h-5" />;
      case 'select': return <Target className="w-5 h-5" />;
      case 'multiselect': return <CheckCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (question.type) {
      case 'text': return 'from-blue-500 to-blue-600';
      case 'textarea': return 'from-purple-500 to-purple-600';
      case 'number': return 'from-green-500 to-green-600';
      case 'select': return 'from-orange-500 to-orange-600';
      case 'multiselect': return 'from-pink-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <motion.div
            className="relative"
            animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder}
              className="w-full pl-12 pr-4 py-4 text-base border-2 focus:border-blue-500 rounded-2xl transition-all"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-${getColors().split('-')[1]}-500`}
              animate={isFocused ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
            >
              {getIcon()}
            </motion.div>
          </motion.div>
        );

      case 'textarea':
        return (
          <motion.div
            animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder}
              rows={5}
              className="w-full p-4 text-base border-2 focus:border-purple-500 rounded-2xl transition-all resize-none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
          </motion.div>
        );

      case 'number':
        return (
          <motion.div
            className="relative"
            animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder}
              className="w-full pl-12 pr-4 py-4 text-base border-2 focus:border-green-500 rounded-2xl transition-all"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
            <motion.div 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500"
              animate={isFocused ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
            >
              {getIcon()}
            </motion.div>
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            className="relative"
            animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-4 pl-12 text-base border-2 border-gray-200 rounded-2xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            >
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <motion.div 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
              animate={isFocused ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
            >
              {getIcon()}
            </motion.div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </motion.div>
        );

      case 'multiselect':
        return (
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {question.options?.map((option, index) => (
              <motion.label
                key={option}
                variants={itemVariants}
                custom={index}
                className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  value.includes(option)
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() => {}}
                  className="hidden"
                />
                <motion.div 
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-3 ${
                    value.includes(option)
                      ? 'border-pink-500 bg-pink-500'
                      : 'border-gray-300'
                  }`}
                  animate={value.includes(option) ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {value.includes(option) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </motion.div>
                <span className="text-gray-700 font-medium">{option}</span>
                {value.includes(option) && (
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </motion.div>
                )}
              </motion.label>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-2 mt-2"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      if (question.required && (!localAnswer && selectedOptions.length === 0)) {
        setError('This question is required');
        setIsSubmitting(false);
        return;
      }

      if (question.type === 'text' || question.type === 'textarea') {
        if (question.validation?.min && localAnswer.length < question.validation.min) {
          setError(`Minimum ${question.validation.min} characters required`);
          setIsSubmitting(false);
          return;
        }
        if (question.validation?.max && localAnswer.length > question.validation.max) {
          setError(`Maximum ${question.validation.max} characters allowed`);
          setIsSubmitting(false);
          return;
        }
        await onAnswer(localAnswer);
      } else if (question.type === 'select') {
        await onAnswer(localAnswer);
      } else if (question.type === 'multiselect') {
        await onAnswer(selectedOptions);
      } else if (question.type === 'number') {
        const num = Number(localAnswer);
        if (isNaN(num)) {
          setError('Please enter a valid number');
          setIsSubmitting(false);
          return;
        }
        if (question.validation?.min && num < question.validation.min) {
          setError(`Minimum value is ${question.validation.min}`);
          setIsSubmitting(false);
          return;
        }
        if (question.validation?.max && num > question.validation.max) {
          setError(`Maximum value is ${question.validation.max}`);
          setIsSubmitting(false);
          return;
        }
        await onAnswer(num);
      }

      setTimeout(() => {
        onNext();
        setIsSubmitting(false);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid answer');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && question.type !== 'textarea') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
      onKeyDown={handleKeyDown}
    >
      {/* Question Header with Icon */}
      <div className="flex items-start gap-4">
        <motion.div 
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
            question.type === 'text' ? 'from-blue-500 to-blue-600' :
            question.type === 'textarea' ? 'from-purple-500 to-purple-600' :
            question.type === 'number' ? 'from-green-500 to-green-600' :
            question.type === 'select' ? 'from-orange-500 to-orange-600' :
            'from-pink-500 to-pink-600'
          } flex items-center justify-center shadow-lg`}
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {question.type === 'text' && <PenTool className="w-6 h-6 text-white" />}
          {question.type === 'textarea' && <MessageCircle className="w-6 h-6 text-white" />}
          {question.type === 'number' && <Hash className="w-6 h-6 text-white" />}
          {question.type === 'select' && <Target className="w-6 h-6 text-white" />}
          {question.type === 'multiselect' && <CheckCircle className="w-6 h-6 text-white" />}
        </motion.div>
        
        <div className="flex-1 space-y-2">
          <motion.h3 
            className="text-xl font-bold text-gray-900"
            variants={itemVariants}
          >
            {question.question}
          </motion.h3>
          
          {question.description && (
            <motion.p 
              className="text-sm text-gray-500"
              variants={itemVariants}
            >
              {question.description}
            </motion.p>
          )}
          
          {question.required && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                Required
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Question Input */}
      <motion.div variants={itemVariants}>
        <QuestionInput
          question={question}
          value={question.type === 'multiselect' ? selectedOptions : localAnswer}
          onChange={(val: any) => {
            if (question.type === 'multiselect') {
              setSelectedOptions(prev => 
                prev.includes(val) 
                  ? prev.filter(item => item !== val)
                  : [...prev, val]
              );
            } else {
              setLocalAnswer(val);
            }
          }}
          error={error}
          isLoading={isLoading || isSubmitting}
        />
      </motion.div>

      {/* Validation hint */}
      {question.validation && (question.type === 'text' || question.type === 'textarea') && (
        <motion.div 
          className="flex items-center gap-2 text-xs text-gray-400"
          variants={itemVariants}
        >
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(localAnswer.length / (question.validation.max || 100)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span>
            {localAnswer.length} / {question.validation.max || 100}
          </span>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <motion.div 
        className="flex justify-between items-center pt-4"
        variants={itemVariants}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onBack}
            disabled={!canGoBack || isLoading || isSubmitting}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            loading={isSubmitting}
            size="lg"
            className={`min-w-[140px] bg-gradient-to-r ${
              isLastQuestion 
                ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            } text-white shadow-lg`}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                {isLastQuestion ? 'Complete' : 'Next'}
                {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                {isLastQuestion && <Check className="w-4 h-4" />}
              </span>
            )}
          </Button>

          {/* Keyboard shortcut hint */}
          {!isSubmitting && question.type !== 'textarea' && (
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Press Enter ↵
            </motion.div>
          )}
        </motion.div>
      </motion.div>
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center py-12"
      >
        <motion.div
          variants={itemVariants}
          className="relative inline-block"
        >
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, (i % 3 - 1) * 50, 0],
                y: [0, (Math.floor(i / 3) - 1) * 50, 0],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity
              }}
            />
          ))}
        </motion.div>

        <motion.h3 
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          All Set!
        </motion.h3>
        
        <motion.p 
          variants={itemVariants}
          className="text-gray-500 mb-8 max-w-md mx-auto"
        >
          We've gathered all the information needed to create your perfect social media post.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Start Over
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onNext}
              loading={isLoading}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg gap-2"
            >
              Generate Content
              <Rocket className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress Bar with Animation */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Question {progress.current + 1} of {progress.total}
            </span>
            <div className="flex gap-1">
              {[...Array(progress.total)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= progress.current 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  animate={i === progress.current ? { scale: [1, 1.5, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
          <motion.span 
            className="text-sm font-bold text-blue-600"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {progress.percentage}%
          </motion.span>
        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <Card className="p-8 border-2 border-gray-100 shadow-xl overflow-hidden relative">
            {/* Background decoration */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity }}
            />
            
            {/* Bot avatar */}
            <motion.div
              className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative">
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
            </div>
          </Card>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-center"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 gap-2"
          >
            <X className="w-4 h-4" />
            Reset Conversation
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface ConversationStarterProps {
  onStart: (flowId: string) => void;
  isLoading?: boolean;
}

export function ConversationStarter({ onStart, isLoading = false }: ConversationStarterProps) {
  const [selectedFlow, setSelectedFlow] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);

  const flows = [
    { 
      id: 'product-promotion', 
      name: 'Product Promotion', 
      desc: 'Sell your products effectively',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-500',
      color: 'yellow'
    },
    { 
      id: 'service-business', 
      name: 'Service Business', 
      desc: 'Promote your professional services',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    { 
      id: 'event-promotion', 
      name: 'Event Promotion', 
      desc: 'Create buzz for your events',
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple'
    },
    { 
      id: 'general-content', 
      name: 'General Content', 
      desc: 'For any other type of post',
      icon: <PenTool className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    }
  ];

  const handleStart = () => {
    if (selectedFlow) {
      onStart(selectedFlow);
    } else if (customInput.trim()) {
      onStart('auto-detect');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="text-center space-y-4"
      >
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Bot className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Let's Create Your Post Together</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            I'll ask you a few questions to understand exactly what you need, then create the perfect content for you.
          </p>
        </div>
      </motion.div>

      {/* Quick Start Options */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {flows.map((flow) => (
          <motion.button
            key={flow.id}
            onClick={() => setSelectedFlow(flow.id)}
            onHoverStart={() => setHoveredFlow(flow.id)}
            onHoverEnd={() => setHoveredFlow(null)}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
              selectedFlow === flow.id
                ? `border-${flow.color}-500 bg-${flow.color}-50/50 shadow-xl`
                : 'border-gray-200 hover:border-gray-300 bg-white/50 backdrop-blur-sm'
            }`}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient overlay on hover */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${flow.gradient} opacity-0`}
              animate={hoveredFlow === flow.id ? { opacity: 0.05 } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={hoveredFlow === flow.id ? { x: ['-100%', '200%'] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div 
                className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${flow.gradient} flex items-center justify-center shadow-lg`}
                animate={selectedFlow === flow.id ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {flow.icon}
              </motion.div>
              
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900 mb-1">{flow.name}</h4>
                <p className="text-sm text-gray-500">{flow.desc}</p>
              </div>

              {selectedFlow === flow.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className={`w-6 h-6 rounded-full bg-${flow.color}-500 flex items-center justify-center`}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Custom Input */}
      <motion.div 
        variants={itemVariants}
        className="text-center"
      >
        <p className="text-sm text-gray-500 mb-4">Or describe what you want in your own words:</p>
        <motion.div 
          className="max-w-md mx-auto relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g., Instagram post for my handmade jewelry business"
            className="w-full pl-12 pr-4 py-4 text-base border-2 focus:border-blue-500 rounded-2xl transition-all"
          />
          <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.div>

      {/* Start Button */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={handleStart}
            disabled={(!selectedFlow && !customInput.trim()) || isLoading}
            loading={isLoading}
            size="lg"
            className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl text-base py-6"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <span className="flex items-center gap-3">
                Start Conversation
                <Send className="w-4 h-4" />
              </span>
            )}
          </Button>

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ zIndex: -1 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
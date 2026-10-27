import React from 'react';
import { Sparkles, Flag, Lightbulb, ArrowRight } from 'lucide-react';
import { OfficialQuestion, RulesDatabase } from '@/core/types';
import { QuestionMediaViewer } from './QuestionMediaViewer';
import { AnswerOptionsList } from './AnswerOptionsList';
import { ExplanationCard } from './ExplanationCard';

interface QuestionCardProps {
  question: OfficialQuestion;
  rules?: RulesDatabase | null;
  selectedOption: number | null;
  isStrictExam: boolean;
  shouldShowExplanation: boolean;
  inspectedRuleId: string | null;
  currentIndex: number;
  totalQuestions: number;
  onSelectOption: (index: number) => void;
  onZoomImage: (imagePath: string) => void;
  onOpenReportModal: () => void;
  onOpenHintModal: () => void;
  onManualShowExplain: () => void;
  onToggleInspectRule: (ruleId: string) => void;
  onCloseInspectRule: () => void;
  onNextQuestion: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  rules,
  selectedOption,
  isStrictExam,
  shouldShowExplanation,
  inspectedRuleId,
  currentIndex,
  totalQuestions,
  onSelectOption,
  onZoomImage,
  onOpenReportModal,
  onOpenHintModal,
  onManualShowExplain,
  onToggleInspectRule,
  onCloseInspectRule,
  onNextQuestion,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Meta & Report Flag */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Розділ {question.section}: {question.section_title}
          </span>
          {question.isAiGenerated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/30">
              <Sparkles className="w-3 h-3" />
              <span>ШІ-моделювання (2D Сцена)</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
          title="Повідомити про помилку в завданні"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Повідомити про помилку в завданні</span>
        </button>
      </div>

      {/* Media (Scene or Raster Image) */}
      <QuestionMediaViewer
        question={question}
        rules={rules}
        onZoomImage={onZoomImage}
      />

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl font-bold leading-snug">
        {question.question}
      </h2>

      {/* Vertical Options */}
      <AnswerOptionsList
        options={question.options}
        selectedOption={selectedOption}
        correctIndex={question.answer_index}
        onSelectOption={onSelectOption}
      />

      {/* Explanation Box */}
      {shouldShowExplanation && (
        <ExplanationCard
          explanation={question.explanation}
          ruleIds={question.rule_ids}
          rules={rules}
          inspectedRuleId={inspectedRuleId}
          onToggleInspectRule={onToggleInspectRule}
          onCloseInspectRule={onCloseInspectRule}
        />
      )}

      {/* Footer Controls & Next Question */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {!isStrictExam ? (
          selectedOption === null ? (
            <button
              type="button"
              onClick={onOpenHintModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Пояснити відповідь (Підказка)</span>
            </button>
          ) : !shouldShowExplanation ? (
            <button
              type="button"
              onClick={onManualShowExplain}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Показати пояснення</span>
            </button>
          ) : (
            <div />
          )
        ) : (
          <span className="text-xs text-slate-400">
            Режим суворого іспиту СЦ МВС (без підказок та коментарів)
          </span>
        )}

        {selectedOption !== null && (
          <button
            type="button"
            onClick={onNextQuestion}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <span>
              {currentIndex + 1 < totalQuestions
                ? 'Наступне питання'
                : 'Завершити тестування'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface PromptTestModalProps {
  isOpen: boolean;
  promptText: string;
  generatingPrompt: boolean;
  geminiApiKeyInput: string;
  showKeyConfig: boolean;
  onClose: () => void;
  onChangePrompt: (text: string) => void;
  onChangeKeyInput: (key: string) => void;
  onToggleKeyConfig: () => void;
  onSubmit: () => void;
}

const QUICK_EXAMPLES = [
  'Круговий рух та перевага трамвая на перехресті',
  'Сигнали регулювальника та додаткова секція світлофора',
  'Табличка 7.8 напрямок головної дороги та перешкода справа',
  'Проїзд спецтранспорту з маячками та пішохідні переходи вночі',
  'Рух через залізничні переїзди та габаритні автопоїзди',
];

export const PromptTestModal: React.FC<PromptTestModalProps> = ({
  isOpen,
  promptText,
  generatingPrompt,
  geminiApiKeyInput,
  showKeyConfig,
  onClose,
  onChangePrompt,
  onChangeKeyInput,
  onToggleKeyConfig,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Створення тесту за промптом
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Включає генерацію динамічних 2D-сцен дорожніх ситуацій та підбір відповідних питань ПДР
        </p>

        {/* Quick Prompt Examples */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Швидкі сценарії (натисніть для підстановки):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => onChangePrompt(example)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs transition cursor-pointer text-left"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Опишіть, які ситуації ви хочете потренувати (наприклад: проїзд перехресть з трамваями або зупинка і стоянка)..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
        />

        {/* Optional Gemini API Key Toggle */}
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleKeyConfig}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
          >
            {showKeyConfig
              ? 'Сховати налаштування Gemini API Key'
              : 'Налаштувати власний Gemini 2.5 Flash API Key (опційно)'}
          </button>
          {showKeyConfig && (
            <div className="mt-2 space-y-1">
              <input
                type="password"
                value={geminiApiKeyInput}
                onChange={(e) => onChangeKeyInput(e.target.value)}
                placeholder="AIzaSy... (якщо порожньо — працює вбудований 2D-двигун)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                За замовчуванням система миттєво генерує 2D-сцени за допомогою вбудованого двигуна сценаріїв ПДР.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Закрити
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={generatingPrompt}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {generatingPrompt ? 'ШІ створює магію...' : 'Згенерувати тест'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X } from 'lucide-react';

interface TopicSectionItem {
  section: string;
  title: string;
  questionCount: number;
}

interface TopicPickerModalProps {
  isOpen: boolean;
  availableSections: TopicSectionItem[];
  selectedTopics: string[];
  onClose: () => void;
  onToggleTopic: (section: string) => void;
  onSelectAll: () => void;
  onSelectBasic: () => void;
  onStartTest: () => void;
}

export const TopicPickerModal: React.FC<TopicPickerModalProps> = ({
  isOpen,
  availableSections,
  selectedTopics,
  onClose,
  onToggleTopic,
  onSelectAll,
  onSelectBasic,
  onStartTest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              Вибір розділів для тестування
            </h3>
            <p className="text-xs text-slate-500">
              Оберіть один або декілька розділів ПДР для цільової практики
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-2">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Обрати всі ({availableSections.length})
            </button>
            <button
              type="button"
              onClick={onSelectBasic}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Лише базові
            </button>
          </div>

          {availableSections.map((sec) => {
            const checked = selectedTopics.includes(sec.section);
            return (
              <label
                key={sec.section}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  checked
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTopic(sec.section)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    Розділ {sec.section}. {sec.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-2">
                  {sec.questionCount} пит.
                </span>
              </label>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onStartTest}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Почати тест ({selectedTopics.length} тем)
          </button>
        </div>
      </div>
    </div>
  );
};

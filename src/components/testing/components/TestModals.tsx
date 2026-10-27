import React from 'react';
import { X } from 'lucide-react';

interface ConfirmHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmHintModal: React.FC<ConfirmHintModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <h3 className="font-bold text-lg">Підтвердження підказки</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Ви впевнені, що хочете використати підказку? Це запитання буде зараховано як неправильне.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Так, показати пояснення
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReportMistakeModalProps {
  isOpen: boolean;
  reason: string;
  comment: string;
  onClose: () => void;
  onChangeReason: (reason: string) => void;
  onChangeComment: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const REPORT_REASONS = [
  'Неправильна відповідь',
  'Помилка в тексті',
  'Некоректне зображення',
  'Інше',
];

export const ReportMistakeModal: React.FC<ReportMistakeModalProps> = ({
  isOpen,
  reason,
  comment,
  onClose,
  onChangeReason,
  onChangeComment,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Що не так з цим питанням?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <input
                type="radio"
                name="reportReason"
                checked={reason === r}
                onChange={() => onChangeReason(r)}
                className="accent-blue-600"
              />
              <span className="text-sm font-medium">{r}</span>
            </label>
          ))}
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => onChangeComment(e.target.value)}
          placeholder="Додатковий коментар (необов'язково)..."
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-blue-500"
        />

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Відправити звіт
          </button>
        </div>
      </form>
    </div>
  );
};

interface ConfirmExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <h3 className="font-bold text-lg">Підтвердження виходу з тесту</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Ви дійсно хочете перервати тест? Ваш прогрес у поточній сесії не буде збережено.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Залишитись
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Вийти
          </button>
        </div>
      </div>
    </div>
  );
};

interface ImageLightboxModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageSrc,
  onClose,
}) => {
  if (!imageSrc) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
    >
      <img
        src={imageSrc}
        alt="Збільшене зображення дорожньої ситуації"
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
      />
    </div>
  );
};

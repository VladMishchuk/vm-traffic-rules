import React from 'react';
import { ZoomIn } from 'lucide-react';
import { OfficialQuestion, RulesDatabase } from '@/core/types';
import RoadSceneRenderer from '@/components/road-scene';

interface QuestionMediaViewerProps {
  question: OfficialQuestion;
  rules?: RulesDatabase | null;
  onZoomImage: (imagePath: string) => void;
}

export const QuestionMediaViewer: React.FC<QuestionMediaViewerProps> = ({
  question,
  rules,
  onZoomImage,
}) => {
  return (
    <div className="space-y-4">
      {/* 2D Vector Road Scene */}
      {question.sceneConfig && (
        <RoadSceneRenderer scene={question.sceneConfig} rules={rules} />
      )}

      {/* Raster Image with Zoom */}
      {question.image_path && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-center p-4 group">
          <img
            src={question.image_path}
            alt={question.question}
            onClick={() => onZoomImage(question.image_path!)}
            className="max-h-80 object-contain rounded-lg cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
          />
          <button
            type="button"
            onClick={() => onZoomImage(question.image_path!)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/75 text-white text-xs font-medium backdrop-blur-xs hover:bg-slate-900 transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Збільшити зображення</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { DiscussionThread } from '@/modules/community/components/DiscussionThread/DiscussionThread';

interface QuestionDiscussionProps {
  questionId: string;
}

export const QuestionDiscussion: React.FC<QuestionDiscussionProps> = ({
  questionId,
}) => {
  return <DiscussionThread targetId={questionId} variant="card" />;
};

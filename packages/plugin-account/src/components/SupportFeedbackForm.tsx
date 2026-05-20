import { useState, type FormEvent } from 'react';

import { createSupportFeedback, type SupportFeedback } from '../beta-ops';

export interface SupportFeedbackFormProps {
  accountId: string;
  onSubmit(feedback: SupportFeedback): void;
  nowMs?: () => number;
}

export function SupportFeedbackForm({ accountId, onSubmit, nowMs }: SupportFeedbackFormProps) {
  const [category, setCategory] = useState<SupportFeedback['category']>('sync');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const feedback = createSupportFeedback({ accountId, category, message }, nowMs);
    onSubmit(feedback);
    setMessage('');
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Support feedback">
      <label>
        Category
        <select value={category} onChange={(event) => setCategory(event.currentTarget.value as SupportFeedback['category'])}>
          <option value="sync">Sync</option>
          <option value="bug">Bug</option>
          <option value="billing">Billing</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        Message
        <textarea value={message} onChange={(event) => setMessage(event.currentTarget.value)} />
      </label>
      <button type="submit">Send</button>
    </form>
  );
}

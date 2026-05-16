import { useState } from 'react';
import styles from './ChooseSubscriptionButton.module.css';

interface ChooseSubscriptionButtonProps {
  planId: string;
}

export function ChooseSubscriptionButton({ planId }: ChooseSubscriptionButtonProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <button
      className={`${styles.button} ${isSelected ? styles.selected : ''}`}
      type="button"
      data-plan-id={planId}
      aria-pressed={isSelected}
      onClick={() => setIsSelected((value) => !value)}
    >
      {isSelected ? 'Тариф выбран' : 'Выбрать тариф'}
    </button>
  );
}

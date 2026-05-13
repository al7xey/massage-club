interface ChooseSubscriptionButtonProps {
  planId: string;
}

export function ChooseSubscriptionButton({ planId }: ChooseSubscriptionButtonProps) {
  return (
    <button className="ui-btn ui-btn-primary ui-btn-block" type="button" data-plan-id={planId}>
      Выбрать тариф
    </button>
  );
}

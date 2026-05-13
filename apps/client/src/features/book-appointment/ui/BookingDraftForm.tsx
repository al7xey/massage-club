export function BookingDraftForm() {
  return (
    <form className="card form-grid">
      <input className="input" placeholder="Услуга" />
      <input className="input" placeholder="Студия" />
      <input className="input" placeholder="Мастер" />
      <input className="input" type="datetime-local" />
      <button className="button" type="button">
        Подготовить запись
      </button>
    </form>
  );
}

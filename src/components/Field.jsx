// Un câmp de formular: eticheta, controlul (input/select/textarea) și,
// dacă există, mesajul de eroare de sub el.
export default function Field({label, error, children}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

import {Icon} from './Icons.jsx';

function pageList(current, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total);
  sorted.sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({page, total, onPage}) {
  if (total <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagini">
      <button
        className="pager-step"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <Icon name="left" size={16} />
        Anterior
      </button>
      {pageList(page, total).map((p, i) =>
        p === '…' ? (
          <span key={`gap${i}`} className="pager-gap">
            …
          </span>
        ) : (
          <button
            key={p}
            className={p === page ? 'pager-num active' : 'pager-num'}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="pager-step"
        disabled={page === total}
        onClick={() => onPage(page + 1)}
      >
        Următor
        <Icon name="right" size={16} />
      </button>
    </nav>
  );
}

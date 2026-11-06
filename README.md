# RRM – Frontend (React + Vite)

## Cum îl pornești

1. Instalează Node.js (versiunea 18 sau mai nouă): https://nodejs.org
2. În folderul proiectului rulezi:
   npm install
   npm run dev
3. Deschizi http://localhost:5173 în browser.

## Mod test vs. backend real

În fișierul `.env`:

- `VITE_USE_MOCK=true`: merge fără backend, cu date de test (pentru 3.6).
- `VITE_USE_MOCK=false`: folosește backend-ul de la `VITE_API_URL` (pentru 3.7).
  După ce modifici `.env`, oprești (Ctrl+C) și repornești `npm run dev`.

## Ce așteaptă frontend-ul de la backend

- GET /api/resources → listă de resurse
- POST /api/resources → creează o resursă
- PUT /api/resources/{id} → modifică o resursă
- DELETE /api/resources/{id} → șterge o resursă

O resursă arată așa:
{ "id": 1, "name": "Robot NAO", "type": "EQUIPMENT" | "ROOM",
"location": "C201", "capacity": 30 | null,
"status": "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE", "description": "..." }

Backend-ul trebuie să permită CORS pentru http://localhost:5173.

## Stilul codului (3.5)

Frontend-ul urmează Google JavaScript Style Guide, verificat cu ESLint și Prettier.
Înainte de fiecare pull request:
npm run format
npm run lint

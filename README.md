# RRM – Frontend (React + Vite)

Implementează ecranul **Catalog** din prototipul Figma și pagina
**Administrare → Gestionare resurse** (adăugare, editare, ștergere).

## Pornire

    npm install
    npm run dev

Apoi deschideți http://localhost:5173

## Mod test vs. backend real (fișierul .env)

- `VITE_USE_MOCK=true`: merge fără backend, cu datele din prototip.
- `VITE_USE_MOCK=false`: folosește backend-ul de la `VITE_API_URL`.
  După modificarea `.env`, opriți (Ctrl+C) și reporniți `npm run dev`.

## Ce așteaptă frontend-ul de la backend

| Metodă | Adresă              | Răspuns              |
| ------ | ------------------- | -------------------- |
| GET    | /api/resources      | listă de resurse     |
| POST   | /api/resources      | resursa creată (201) |
| PUT    | /api/resources/{id} | resursa actualizată  |
| DELETE | /api/resources/{id} | 204, fără conținut   |

O resursă:

    {
      "id": 1,
      "name": "Robot humanoid NAO v6",
      "category": "ROBOT",            // ROBOT | MEASUREMENT | COMPUTE | ROOM
      "description": "Robot programabil...",
      "building": "Corp C",
      "room": "Sala C204",
      "status": "AVAILABLE",          // AVAILABLE | UNAVAILABLE
      "requiresApproval": true,
      "statusNote": null,             // motivul, dacă e UNAVAILABLE
      "unavailableUntil": null        // dată "AAAA-LL-ZZ", dacă e UNAVAILABLE
    }

Erori de validare (opțional): `{"message": "...", "errors": {"name": "..."}}`

Backend-ul trebuie să permită CORS pentru http://localhost:5173.

Starea „Ocupat” și bara de disponibilitate vor veni din rezervări, într-o
etapă următoare; până atunci, resursele de la backend apar ca „Liber”.

## Stilul codului

Google JavaScript Style Guide, verificat cu ESLint și Prettier.
Înainte de fiecare pull request:
npm run format
npm run lint

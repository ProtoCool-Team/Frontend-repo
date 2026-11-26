# RRM – Frontend (React + Vite)

Implementează ecranul **Catalog** din prototipul Figma, pagina
**Administrare → Gestionare resurse** (adăugare, editare, ștergere) și pagina
**Rezervările mele** (KAN-32).

## Pornire

1. Porniți backend-ul (vezi README-ul din Backend-repo); implicit răspunde la
   http://localhost:8000/api/v1.
2. Copiați `.env.example` în `.env` (fișierul `.env` nu se urcă pe GitHub).
3. Rulați:

   ```
   npm install
   npm run dev
   ```

4. Deschideți http://localhost:5173

## Mod test vs. backend real (fișierul .env)

- `VITE_USE_MOCK=true`: merge fără backend, cu datele din prototip.
- `VITE_USE_MOCK=false`: folosește backend-ul de la `VITE_API_URL`.
  După modificarea `.env`, opriți (Ctrl+C) și reporniți `npm run dev`.

## Ce folosește frontend-ul din backend

Adresa API-ului: `http://localhost:8000/api/v1` (`VITE_API_URL`). Backend-ul
permite CORS pentru http://localhost:5173.

| Metodă | Adresă                              | Răspuns                                       |
| ------ | ----------------------------------- | --------------------------------------------- |
| GET    | /api/v1/resources                   | listă de resurse, cu locația fiecăreia        |
| POST   | /api/v1/resources                   | resursa creată (201)                          |
| PUT    | /api/v1/resources/{id}              | resursa actualizată                           |
| DELETE | /api/v1/resources/{id}              | 204; 409 dacă are rezervări                   |
| GET    | /api/v1/locations                   | locațiile, pentru lista „Locație”             |
| GET    | /api/v1/me/reservations             | rezervările mele                              |
| PATCH  | /api/v1/me/reservations/{id}/cancel | anulează rezervarea; 409 dacă nu se mai poate |
| POST   | /api/v1/auth/login                  | `{token, user}` (KAN-19)                      |
| POST   | /api/v1/auth/register               | cont nou + `{token, user}` (KAN-28)           |
| GET    | /api/v1/auth/me                     | contul logat, cu rolul actual (KAN-20)        |
| GET    | /api/v1/users                       | utilizatorii, pentru Administrare (KAN-20)    |
| PATCH  | /api/v1/users/{id}/role             | schimbă rolul unui utilizator (KAN-20)        |

## Login și Creează cont (KAN-28)

- Login-ul cere email și parolă la backend (`src/auth.js`). Token-ul primit
  se păstrează în browser (`src/session.js`) și se trimite la fiecare cerere
  ca `Authorization: Bearer <token>` (`request()` din `src/api/resources.js`).
- „Creează cont” face un cont nou de cercetător și te loghează direct.
- Dacă sesiunea expiră (401), aplicația te întoarce la pagina de Login.
- Cu `VITE_USE_MOCK=true`, login-ul rămâne simulat (orice email și parolă).
- Butoanele „SSO” și „Ai uitat parola?” arată încă „în curând”.

## Roluri (KAN-20)

- `RESEARCHER` (student / cercetător) nu vede meniul „Administrare”; dacă
  deschide `#admin` sau `#users`, ajunge în catalog.
- `ADMINISTRATOR` (cadru didactic) vede „Administrare”, cu două secțiuni:
  „Resurse” și „Utilizatori și roluri” (`src/pages/ManageUsersPage.jsx`).
- La pornire, aplicația recitește contul (`GET /auth/me`), ca rolul să fie
  cel actual. Backend-ul verifică oricum rolul la fiecare cerere.
- O sesiune salvată fără token (de la vechiul login simulat) e ștearsă și
  apare pagina de Login.
- În modul mock, contul de test are rolul de administrator.

## Rezervările mele (KAN-32)

„Eu” este utilizatorul logat (din token). Pentru teste fără login se pot
folosi `DEMO_USER_ID` (backend) sau `VITE_USER_ID` (frontend), doar dacă
backend-ul are `ALLOW_DEMO_AUTH=true`.

Gata: cardurile de sumar, filtrele (status, categorie), căutarea, sortarea,
filele, „Active și viitoare” (cu progres și anulare), „Istoric” cu paginare.
Statusul afișat se calculează după oră (`displayStatus` din
`src/reservationStatus.js`), iar filtrarea e în `src/reservationFilters.js`.

De făcut (căutați `TODO` în cod):

- mini-calendarul și panoul de notificări (`ReservationSidebar.jsx`;
  notificările au nevoie de `GET /api/v1/me/notifications` în backend);
- butoanele Detalii, Prelungește, Rezervă din nou și Exportă CSV;
- filtrul „Perioadă” (`ReservationFilters.jsx`);
- vederea Calendar (KAN-34).

O resursă, așa cum vine de la backend:

    {
      "resource_id": "c0000000-0000-0000-0000-000000000001",
      "name": "Robot KUKA KR 6",
      "type": "ROBOT",       // ROBOT | MEASURING_DEVICE | COMPUTE_CLUSTER | LAB_ROOM
      "status": "AVAILABLE", // AVAILABLE | UNAVAILABLE
      "location_id": "b0000000-0000-0000-0000-000000000001",
      "building": "Corp C", "room": "C102", "floor": 1,  // din tabelul locations
      "requires_approval": true,
      "attributes": {}       // aici stau și statusNote / unavailableUntil
    }

`src/api/resources.js` o transformă în forma folosită de componente
(`id`, `category`, `requiresApproval` …). Erorile vin ca `{"error": "..."}`
sau `{"errors": ["...", "..."]}` și sunt afișate în pagină.

Starea „Ocupat” și bara de disponibilitate vor veni din rezervări, într-o
etapă următoare; până atunci, resursele de la backend apar ca „Liber”.

## Stilul codului

Google JavaScript Style Guide, verificat cu ESLint și Prettier.
Înainte de fiecare pull request:
npm run format
npm run lint

# Local Express Backend

This backend now provides a broader local persistent API for the legacy frontend, not just auth.

See [SCHEMA_CONTEXT.md](./SCHEMA_CONTEXT.md) for notes derived from the original Laravel migrations and model layer.

## Covered areas

- Auth and session tokens
- Generic CRUD for the main admin resources
- Aggregate employee read endpoints built from `user + profile + employment`
- Datatable search and pagination
- Select-option endpoints used by forms
- Assessment assignment and save flows
- Dashboard statistics and CSV exports
- Employee and department analytics
- Publication buckets, uploads, and approval
- Mock PDF document delivery for publication detail screens
- Import endpoints for the Excel importer UI
- Persistent JSON database stored at `backend/data/app-db.json`

## Main endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/user`
- `GET /api/gravatar/:id`
- `GET /mock-publications/:fileName`
- `GET /api/employees`
- `POST /api/employees/search`
- `GET /api/employees/:id`
- `GET /api/:resource`
- `POST /api/:resource/search`
- `GET /api/:resource/:id`
- `POST /api/:resource`
- `PATCH /api/:resource/:id`
- `DELETE /api/:resource/:id`

## Demo credentials

- Email: `demo@example.com`
- Password: `password`

Additional seeded users also use `password`:

- `sara.manager@example.com`
- `agus.engineer@example.com`
- `dina.engineer@example.com`

## Run

```sh
npm install
npm run dev
```

## Reset local data

```sh
npm run reset-db
```

## Contract check

```sh
npm run check
```

## Aggregate employee layer

`/api/employees` is a read-only facade over the normalized storage model:

- `users` keeps auth and authorization data
- `profiles` keeps person/biodata fields
- `employments` keeps position, org, hierarchy, and assessment context

The aggregate response exposes one employee-shaped object with flat summary fields plus sibling nested objects:

- `user`
- `profile`
- `employment`

Mutations still belong to the normalized resources, not the aggregate endpoint.

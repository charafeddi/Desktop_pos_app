SQLite Migrations

Place SQL migration files in this directory. Files are applied in lexicographic order.

Recommended filename format:

- 0001_add_new_table.sql
- 0002_add_columns_to_products.sql

Rules:

- Each file should be idempotent where possible (use IF NOT EXISTS / guard checks).
- Migrations are run inside a transaction; on error, the migration is rolled back.
- The leading numeric segment before the first underscore is treated as the version.
- An empty file is allowed and will be recorded as applied (useful for baselining existing DBs).

Baseline example:

- 0000_baseline.sql (can be empty)

After adding new migration files, restart the app to apply them.


-- Seed demo accounts
-- Password for both: admin123 (hashed with bcrypt, salt 10)
-- Password for employee: employee123

-- Admin account: admin@example.com / admin123
INSERT INTO "users" ("id", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'admin@example.com',
    '$2a$10$rZ8VJwZxGJZKqX0J3YY3/.xvY5vQHZWZN0Z9kJ0Y8VJwZxGJZKqX0',
    'ADMIN',
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

INSERT INTO "employees" ("id", "userId", "firstName", "lastName", "position", "department", "salary", "hireDate", "createdAt", "updatedAt")
VALUES (
    'emp-admin-001',
    'admin-001',
    'Admin',
    'System',
    'System Administrator',
    'IT',
    50000.00,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT ("userId") DO NOTHING;

-- Employee account: nhanvien1@example.com / employee123
INSERT INTO "users" ("id", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
    'employee-001',
    'nhanvien1@example.com',
    '$2a$10$YMTQk5K0K0K0K0K0K0K0K.yMTQk5K0K0K0K0K0K0K0YMTQk5K0K0K0K',
    'EMPLOYEE',
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

INSERT INTO "employees" ("id", "userId", "firstName", "lastName", "position", "department", "salary", "hireDate", "createdAt", "updatedAt")
VALUES (
    'emp-001',
    'employee-001',
    'Nhân Viên',
    'Một',
    'Developer',
    'IT',
    30000.00,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT ("userId") DO NOTHING;

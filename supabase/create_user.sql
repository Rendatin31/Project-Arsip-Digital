insert into auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  aud,
  role
)
values (
  'admin@arsip.go.id',
  crypt('admin123', gen_salt('bf', 10)),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
)
returning id, email;

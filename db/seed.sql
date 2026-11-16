INSERT INTO departments (id, name, is_academic) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Computer Science Department', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Student Football & Athletics Club', FALSE),
  ('33333333-3333-3333-3333-333333333333', 'Campus Estates & Facilities', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO facilities (name, category, capacity, location, requires_approval, setup_buffer_mins, strike_buffer_mins) VALUES
  ('Main Auditorium', 'AUDITORIUM', 500, 'Central Admin Block', TRUE, 60, 30),
  ('School Football Park A', 'SPORTS', 40, 'North Sports Complex', FALSE, 0, 15),
  ('Lecture Theatre 1', 'LECTURE_THEATRE', 200, 'Engineering Wing', FALSE, 0, 0),
  ('Computer Science Lab B', 'LAB', 60, 'ICT Building Floor 2', TRUE, 15, 15);

USE stmark;

INSERT INTO Student (roll, name, dept, section) VALUES
('23CS001', 'Arun Kumar', 'CSE', 'A'),
('23CS002', 'Bhavya Sri', 'CSE', 'A'),
('23IT003', 'Dinesh Raj', 'IT', 'B'),
('23EC004', 'Esha N', 'ECE', 'A');

INSERT INTO Activity (name, date, max_mark) VALUES
('Technical Quiz', '2026-01-15', 100),
('Coding Marathon', '2026-02-10', 150),
('Poster Design', '2026-03-05', 50);

INSERT INTO Event (name, date, level) VALUES
('Football Tournament', '2026-01-20', 'College'),
('Hack Fest', '2026-02-14', 'Intercollege'),
('Athletics Meet', '2026-03-12', 'State');

INSERT INTO Student_Activity (stid, actid, mark) VALUES
('23CS001', 1, 82),
('23CS001', 2, 120),
('23CS002', 1, 76),
('23IT003', 2, 135),
('23EC004', 3, 41);

INSERT INTO Student_Event (stid, evid, prize) VALUES
('23CS001', 1, 'Participation'),
('23CS002', 2, '2nd'),
('23IT003', 2, '1st'),
('23EC004', 3, '3rd');

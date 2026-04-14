CREATE DATABASE IF NOT EXISTS stmark;
USE stmark;

DROP TABLE IF EXISTS Student_Event;
DROP TABLE IF EXISTS Student_Activity;
DROP TABLE IF EXISTS Event;
DROP TABLE IF EXISTS Activity;
DROP TABLE IF EXISTS Student;

CREATE TABLE Student (
  roll VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dept VARCHAR(50) NOT NULL,
  section VARCHAR(20) NOT NULL
);

CREATE TABLE Activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  max_mark INT NOT NULL CHECK (max_mark > 0)
);

CREATE TABLE Event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  level ENUM('College', 'Intercollege', 'State', 'National') NOT NULL
);

CREATE TABLE Student_Activity (
  stid VARCHAR(20) NOT NULL,
  actid INT NOT NULL,
  mark INT NOT NULL CHECK (mark >= 0),
  PRIMARY KEY (stid, actid),
  CONSTRAINT fk_sa_student FOREIGN KEY (stid) REFERENCES Student (roll) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sa_activity FOREIGN KEY (actid) REFERENCES Activity (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Student_Event (
  stid VARCHAR(20) NOT NULL,
  evid INT NOT NULL,
  prize ENUM('1st', '2nd', '3rd', 'Participation') NOT NULL,
  PRIMARY KEY (stid, evid),
  CONSTRAINT fk_se_student FOREIGN KEY (stid) REFERENCES Student (roll) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_se_event FOREIGN KEY (evid) REFERENCES Event (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_student_dept ON Student (dept);
CREATE INDEX idx_student_section ON Student (section);
CREATE INDEX idx_activity_date ON Activity (date);
CREATE INDEX idx_event_date ON Event (date);

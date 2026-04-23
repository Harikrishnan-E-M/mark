USE stmark;

-- =============================
-- INDEXES (advanced)
-- =============================
DROP INDEX IF EXISTS idx_student_dept_section ON Student;
DROP INDEX IF EXISTS idx_sa_actid_mark ON Student_Activity;
DROP INDEX IF EXISTS idx_se_evid_prize ON Student_Event;

CREATE INDEX idx_student_dept_section ON Student (dept, section);
CREATE INDEX idx_sa_actid_mark ON Student_Activity (actid, mark);
CREATE INDEX idx_se_evid_prize ON Student_Event (evid, prize);

-- =============================
-- JOIN OPERATION (view)
-- =============================
DROP VIEW IF EXISTS vw_student_performance;
CREATE VIEW vw_student_performance AS
SELECT
  s.roll,
  s.name,
  s.dept,
  s.section,
  ROUND(AVG(sa.mark), 2) AS avg_mark,
  COUNT(DISTINCT sa.actid) AS activity_count,
  COUNT(DISTINCT se.evid) AS event_count
FROM Student s
LEFT JOIN Student_Activity sa ON sa.stid = s.roll
LEFT JOIN Student_Event se ON se.stid = s.roll
GROUP BY s.roll, s.name, s.dept, s.section;

-- =============================
-- TRIGGERS (mark validation)
-- =============================
DROP TRIGGER IF EXISTS trg_sa_validate_mark_before_insert;
DROP TRIGGER IF EXISTS trg_sa_validate_mark_before_update;

DELIMITER $$

CREATE TRIGGER trg_sa_validate_mark_before_insert
BEFORE INSERT ON Student_Activity
FOR EACH ROW
BEGIN
  DECLARE v_max_mark INT;

  SELECT max_mark INTO v_max_mark
  FROM Activity
  WHERE id = NEW.actid;

  IF v_max_mark IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid activity id for Student_Activity';
  END IF;

  IF NEW.mark < 0 OR NEW.mark > v_max_mark THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'mark must be between 0 and activity max_mark';
  END IF;
END$$

CREATE TRIGGER trg_sa_validate_mark_before_update
BEFORE UPDATE ON Student_Activity
FOR EACH ROW
BEGIN
  DECLARE v_max_mark INT;

  SELECT max_mark INTO v_max_mark
  FROM Activity
  WHERE id = NEW.actid;

  IF v_max_mark IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid activity id for Student_Activity';
  END IF;

  IF NEW.mark < 0 OR NEW.mark > v_max_mark THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'mark must be between 0 and activity max_mark';
  END IF;
END$$

-- =============================
-- FUNCTIONS
-- =============================
DROP FUNCTION IF EXISTS fn_student_avg_mark$$
CREATE FUNCTION fn_student_avg_mark(p_roll VARCHAR(20))
RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_avg DECIMAL(10, 2);

  SELECT ROUND(AVG(mark), 2)
  INTO v_avg
  FROM Student_Activity
  WHERE stid = p_roll;

  RETURN IFNULL(v_avg, 0.00);
END$$

DROP FUNCTION IF EXISTS fn_student_activity_count$$
CREATE FUNCTION fn_student_activity_count(p_roll VARCHAR(20))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_count INT;

  SELECT COUNT(*)
  INTO v_count
  FROM Student_Activity
  WHERE stid = p_roll;

  RETURN IFNULL(v_count, 0);
END$$

-- =============================
-- PROCEDURES + CURSOR
-- =============================
DROP TABLE IF EXISTS Student_Summary$$
CREATE TABLE Student_Summary (
  roll VARCHAR(20) PRIMARY KEY,
  avg_mark DECIMAL(10, 2) NOT NULL,
  activity_count INT NOT NULL,
  event_count INT NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ss_student FOREIGN KEY (roll) REFERENCES Student (roll) ON DELETE CASCADE ON UPDATE CASCADE
)$$

DROP PROCEDURE IF EXISTS sp_refresh_student_summary$$
CREATE PROCEDURE sp_refresh_student_summary()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_roll VARCHAR(20);
  DECLARE v_avg DECIMAL(10, 2);
  DECLARE v_activity_count INT;
  DECLARE v_event_count INT;

  DECLARE cur_students CURSOR FOR
    SELECT roll FROM Student;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  TRUNCATE TABLE Student_Summary;

  OPEN cur_students;

  read_loop: LOOP
    FETCH cur_students INTO v_roll;

    IF done = 1 THEN
      LEAVE read_loop;
    END IF;

    SET v_avg = fn_student_avg_mark(v_roll);
    SET v_activity_count = fn_student_activity_count(v_roll);

    SELECT COUNT(*)
    INTO v_event_count
    FROM Student_Event
    WHERE stid = v_roll;

    INSERT INTO Student_Summary (roll, avg_mark, activity_count, event_count)
    VALUES (v_roll, v_avg, v_activity_count, IFNULL(v_event_count, 0));
  END LOOP;

  CLOSE cur_students;
END$$

DROP PROCEDURE IF EXISTS sp_get_leaderboard$$
CREATE PROCEDURE sp_get_leaderboard(IN p_dept VARCHAR(50), IN p_section VARCHAR(20))
BEGIN
  SELECT
    s.roll,
    s.name,
    s.dept,
    s.section,
    fn_student_avg_mark(s.roll) AS avg_mark,
    fn_student_activity_count(s.roll) AS activity_count,
    (
      SELECT COUNT(*)
      FROM Student_Event se
      WHERE se.stid = s.roll
    ) AS event_count
  FROM Student s
  WHERE (p_dept IS NULL OR p_dept = '' OR dept = p_dept)
    AND (p_section IS NULL OR p_section = '' OR section = p_section)
  ORDER BY avg_mark DESC, activity_count DESC, event_count DESC;
END$$

DELIMITER ;

-- Optional demo calls:
-- CALL sp_refresh_student_summary();
-- CALL sp_get_leaderboard(NULL, NULL);
-- SELECT fn_student_avg_mark('23CS001') AS avg_mark_demo;

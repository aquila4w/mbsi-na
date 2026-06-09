/*
  # Add Tithes and Converts columns to Student Metrics Records

  The SY 2025-26 spreadsheet tracks two additional metrics not in the original schema:
  - Tithes (numeric) — student tithe contributions
  - Converts (integer) — number of converts through student ministry
*/

ALTER TABLE student_metrics_records ADD COLUMN IF NOT EXISTS tithes numeric(12,2) DEFAULT 0;
ALTER TABLE student_metrics_records ADD COLUMN IF NOT EXISTS converts integer DEFAULT 0;

-- Add sentiment analysis columns to surveys table
ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS sentiment_score integer,
  ADD COLUMN IF NOT EXISTS sentiment_label text,
  ADD COLUMN IF NOT EXISTS confidence text;

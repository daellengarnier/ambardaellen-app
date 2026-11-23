-- Wunsch Alain 2026-11-23: Selbstvorstellung aus der Lektion Thư 16.11. entfernen.
UPDATE "decks" SET "topic" = 'Auf dem Markt einkaufen und handeln, Mengen, Früchte' WHERE "id" = 'thu-2026-11-16';
--> statement-breakpoint
DELETE FROM "cards" WHERE "deck_id" = 'thu-2026-11-16' AND "front" IN (
  'Tôi tên là Alain.',
  'Năm nay tôi 34 tuổi.',
  'Tôi sống ở thủ đô Thụy Sĩ.',
  'Tôi làm quản lý dự án.',
  'Sở thích của tôi là nhạc, guitar, đi du lịch và đồ ăn.',
  'Tôi đã đi du lịch 15 nước.',
  'Tôi học tiếng Việt vì tôi có họ hàng ở Việt Nam.',
  'Tôi từng học tiếng Việt một tháng nhưng tôi quên hết rồi.'
);

-- Wunsch Alain 2026-11-16: Kennenlernen und Nachfragen (phải không) aus der Lektion Thư 16.11. entfernen.
UPDATE "decks" SET "title" = 'Thư 16.11.: Einkaufen auf dem Markt', "topic" = 'Auf dem Markt einkaufen und handeln, Mengen, Früchte, Selbstvorstellung' WHERE "id" = 'thu-2026-11-16';
--> statement-breakpoint
DELETE FROM "cards" WHERE "deck_id" = 'thu-2026-11-16' AND "front" IN (
  'tên',
  'tuổi',
  'năm sinh',
  'sống ở',
  'nơi ở / nơi sống',
  'quốc tịch',
  'Thụy Sĩ',
  'thủ đô',
  'công việc',
  'quản lý dự án',
  'giáo viên',
  'đồ ăn',
  'mua sắm',
  'lý do',
  'họ hàng',
  'trình độ',
  'hiện tại',
  'từng',
  'quên hết',
  'phải không / phải hong / đúng hong',
  'chính xác',
  'đúng rồi',
  'dạ phải / vâng',
  'không phải / dạ hong phải',
  '... phải không? / ... phải hong? / ... đúng hong? / ... hả?',
  'Anh sống ở chợ Bến Thành phải hong?',
  'Dạ hong phải, anh sống ở Củ Chi.',
  'Dạ phải.'
);

-- Erstes Deck Vietnamesisch, Quelle: Jarvis-Repo areas/privat-lernen/vietnamesisch/decks/svff-l2-b1.json
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language") VALUES ('svff-l2-b1', 'Bài 1: Anh muốn mua gì vậy?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', 'Einkaufen, Preise, Früchte, Vergleiche', 'https://svff.online/learn/lesson/74/overview?course=4&module=6', 'vi') ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "position") VALUES
  ('svff-l2-b1', 'vocab', 'chục', 'zehn (ein Zehner, beim Zählen in Zehnergruppen)', 'ten', '', 'noun', 'Zahlen', '', '', 0),
  ('svff-l2-b1', 'vocab', 'người mua', 'Käufer/in', 'buyer', '', 'noun', 'Einkaufen', '', '', 1),
  ('svff-l2-b1', 'vocab', 'đồng ý', 'einverstanden sein, zustimmen', 'to agree', '', 'verb', 'Einkaufen', '', '', 2),
  ('svff-l2-b1', 'vocab', 'loại', 'Sorte, Art, Typ', 'type, kind', '', 'noun', 'Einkaufen', '', '', 3),
  ('svff-l2-b1', 'vocab', 'bảo hành', 'Garantie', 'warranty', '', 'noun', 'Einkaufen', '', '', 4),
  ('svff-l2-b1', 'vocab', 'ngon', 'lecker (umgangssprachlich auch: attraktiv, eher vulgär)', 'delicious; slang: attractive', '', 'adjective', 'Eigenschaften', '', '', 5),
  ('svff-l2-b1', 'vocab', 'rộng', 'weit, breit, geräumig', 'wide, spacious', '', 'adjective', 'Eigenschaften', '', '', 6),
  ('svff-l2-b1', 'vocab', 'áo sơ mi', 'Hemd', 'shirt', '', 'noun', 'Kleidung', '', '', 7),
  ('svff-l2-b1', 'vocab', 'áo dài', 'Áo dài, traditionelles vietnamesisches Gewand', 'traditional Vietnamese dress', '', 'noun', 'Kleidung', '', '', 8),
  ('svff-l2-b1', 'vocab', 'đồng hồ', 'Uhr', 'clock, watch', '', 'noun', 'Gegenstände', '', '', 9),
  ('svff-l2-b1', 'vocab', 'đồng hồ treo tường', 'Wanduhr', 'wall clock', '', 'noun', 'Gegenstände', '', '', 10),
  ('svff-l2-b1', 'vocab', 'tủ lạnh', 'Kühlschrank', 'refrigerator', '', 'noun', 'Gegenstände', '', '', 11),
  ('svff-l2-b1', 'vocab', 'máy ảnh', 'Fotokamera', 'camera', '', 'noun', 'Gegenstände', '', '', 12),
  ('svff-l2-b1', 'vocab', 'tivi', 'Fernseher', 'TV', '', 'noun', 'Gegenstände', '', '', 13),
  ('svff-l2-b1', 'vocab', 'sầu riêng', 'Durian (Stinkfrucht)', 'durian', '', 'noun', 'Früchte', '', '', 14),
  ('svff-l2-b1', 'vocab', 'chôm chôm', 'Rambutan', 'rambutan', '', 'noun', 'Früchte', '', '', 15),
  ('svff-l2-b1', 'vocab', 'thơm / dứa', 'Ananas (im Süden meist thơm)', 'pineapple', '', 'noun', 'Früchte', '', '', 16),
  ('svff-l2-b1', 'vocab', 'chuối', 'Banane', 'banana', '', 'noun', 'Früchte', '', '', 17),
  ('svff-l2-b1', 'vocab', 'xoài', 'Mango', 'mango', '', 'noun', 'Früchte', '', '', 18),
  ('svff-l2-b1', 'vocab', 'bưởi', 'Pomelo', 'pomelo / grapefruit', '', 'noun', 'Früchte', '', '', 19),
  ('svff-l2-b1', 'vocab', 'ổi', 'Guave', 'guava', '', 'noun', 'Früchte', '', '', 20),
  ('svff-l2-b1', 'vocab', 'mãng cầu xiêm', 'Stachelannone (Soursop)', 'soursop', '', 'noun', 'Früchte', '', '', 21),
  ('svff-l2-b1', 'vocab', 'măng cụt', 'Mangostane', 'mangosteen', '', 'noun', 'Früchte', '', '', 22),
  ('svff-l2-b1', 'grammar', 'đã ... bao giờ chưa? / đã ... lần nào chưa?', 'Hast du schon jemals ...? Frage nach Erfahrung, v.a. wenn die Handlung für den Gefragten eher ungewöhnlich ist.', '', '', '', '', 'Anh đã ăn nem chua bao giờ chưa?', 'Hast du schon mal nem chua gegessen?', 23),
  ('svff-l2-b1', 'grammar', '... chứ (am Satzende)', 'Betont Gewissheit/Bestätigung in der gesprochenen Sprache, etwa: aber klar, natürlich.', '', '', '', '', 'Anh có muốn đi du lịch cùng chúng tôi không? → Có chứ!', 'Willst du mit uns reisen? → Na klar!', 24),
  ('svff-l2-b1', 'grammar', 'cái + Adjektiv/Verb (Nominalisierer)', 'Macht aus einer Eigenschaft ein abstraktes Nomen (cái đẹp = das Schöne, cái khó = die Schwierigkeit). Nicht verwechseln mit dem Klassifikator cái für Gegenstände.', '', '', '', '', 'Cái đẹp', 'Das Schöne, die Schönheit', 25),
  ('svff-l2-b1', 'grammar', 'A + Adjektiv + hơn + B', 'Komparativ: A ist [Adjektiv]-er als B. Verstärker (nhiều, một chút, hẳn) kommen nach hơn.', '', '', '', '', 'Chất lượng âm thanh cái máy nghe nhạc này tệ hơn cái kia.', 'Die Tonqualität dieses Musikplayers ist schlechter als die von jenem.', 26),
  ('svff-l2-b1', 'phrase', 'Nach dem Preis fragen', 'Wie viel kostet ein Kilo von dieser Mango?', '', 'Xoài này bao nhiêu một ký vậy cô?', '', '', '', '', 27),
  ('svff-l2-b1', 'phrase', 'Nach dem Preis fragen (Gegenstand)', 'Wie viel kostet dieses Oberteil?', '', 'Cái áo này giá bao nhiêu vậy anh?', '', '', '', '', 28),
  ('svff-l2-b1', 'phrase', 'không những ... mà còn ... (nicht nur ... sondern auch)', 'Dieser Computer ist nicht nur hochwertig, sondern auch schön.', '', 'Cái máy tính này không những chất lượng cao mà còn đẹp nữa.', '', '', '', '', 29),
  ('svff-l2-b1', 'phrase', 'không những ... mà còn ... (Beispiel 2)', 'Bánh xèo ist nicht nur lecker, sondern auch günstig.', '', 'Bánh xèo ăn không những ngon mà giá còn rẻ nữa.', '', '', '', '', 30),
  ('svff-l2-b1', 'phrase', 'Vergleich mit hơn', 'Dieser Samsung-Fernseher ist teurer als jener Sony-Fernseher. (mắc = teuer, südlich)', '', 'Cái tivi Samsung này mắc hơn cái tivi Sony kia.', '', '', '', '', 31),
  ('svff-l2-b1', 'phrase', 'Vergleich mit hơn (Beispiel 2)', 'Dieses Buch liest sich besser als jenes.', '', 'Cuốn sách này đọc hay hơn cuốn sách đó.', '', '', '', '', 32)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
-- Lernstand: Vokabeln und Sätze in beide Richtungen, Grammatik nur VI→DE.
INSERT INTO "card_states" ("card_id", "direction")
SELECT c."id", d.dir FROM "cards" c
CROSS JOIN (VALUES ('vi_de'), ('de_vi')) AS d(dir)
WHERE c."deck_id" = 'svff-l2-b1' AND (d.dir = 'vi_de' OR c."type" <> 'grammar')
ON CONFLICT DO NOTHING;

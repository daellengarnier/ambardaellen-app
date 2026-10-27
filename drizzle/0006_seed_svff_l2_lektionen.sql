-- SVFF Level 02, Lektionen 1 bis 12. Quelle: Jarvis-Repo areas/privat-lernen/vietnamesisch/decks/.
UPDATE "decks" SET "position" = 1 WHERE "id" = 'svff-l2-b1';
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b1', 'sentence', 'Chất lượng âm thanh cái máy nghe nhạc này tệ hơn cái kia.', 'Die Tonqualität dieses Musikplayers ist schlechter als die vom anderen.', '', '', '', '', '', '', 'Adj + hơn = Komparativ', 33),
  ('svff-l2-b1', 'sentence', 'Anh đã ăn nem chua bao giờ chưa?', 'Hast du schon mal Nem chua gegessen?', '', '', '', '', '', '', 'đã ... bao giờ chưa? = schon einmal?', 34),
  ('svff-l2-b1', 'sentence', 'Anh có muốn đi du lịch cùng chúng tôi không? – Có chứ!', 'Willst du mit uns verreisen? – Aber klar!', '', '', '', '', '', '', 'chứ = Bekräftigung', 35)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b2', 'Bài 2: Hôm nay anh nhìn có vẻ mệt', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 2) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b2', 'vocab', 'khó chịu', 'unwohl, unangenehm', 'uncomfortable', '', '', '', '', '', '', 0),
  ('svff-l2-b2', 'vocab', 'dễ chịu', 'angenehm, wohlig', 'pleasant, comfortable', '', '', '', '', '', '', 1),
  ('svff-l2-b2', 'vocab', 'đau bụng', 'Bauchschmerzen', 'stomachache', '', '', '', '', '', '', 2),
  ('svff-l2-b2', 'vocab', 'cảm thấy', 'fühlen, empfinden', 'to feel', '', '', '', '', '', '', 3),
  ('svff-l2-b2', 'vocab', 'đau đầu / nhức đầu', 'Kopfschmerzen', 'headache', '', '', '', '', '', '', 4),
  ('svff-l2-b2', 'vocab', 'khó thở', 'Atemnot, schwer atmen', 'shortness of breath', '', '', '', '', '', '', 5),
  ('svff-l2-b2', 'vocab', 'bị bệnh', 'krank sein', 'to be sick', '', '', '', '', '', '', 6),
  ('svff-l2-b2', 'vocab', 'bệnh nhân', 'Patient/in', 'patient', '', '', '', '', '', '', 7),
  ('svff-l2-b2', 'vocab', 'phòng khám tư', 'Privatklinik, Privatpraxis', 'private clinic', '', '', '', '', '', '', 8),
  ('svff-l2-b2', 'vocab', 'khám bệnh', 'zum Arzt gehen, untersucht werden', 'to see a doctor', '', '', '', '', '', '', 9),
  ('svff-l2-b2', 'vocab', 'như thế nào', 'wie (Art und Weise, Zustand)', 'how', '', '', '', '', '', '', 10),
  ('svff-l2-b2', 'vocab', 'viên', 'Zähleinheit für Tabletten, Bonbons', 'classifier for pills', '', '', '', '', '', '', 11),
  ('svff-l2-b2', 'sentence', 'Anh Nam bị chóng mặt và buồn nôn nên mọi người đã đưa ảnh tới bệnh viện.', 'Nam war schwindlig und übel, darum haben ihn alle ins Spital gebracht.', '', '', '', '', '', '', 'Symptome beschreiben', 12),
  ('svff-l2-b2', 'sentence', 'Chị Lan phải đi khám bác sĩ vì chỉ bị đau bụng từ hôm qua.', 'Lan muss zum Arzt, weil sie seit gestern Bauchschmerzen hat.', '', '', '', '', '', '', 'Symptome beschreiben', 13),
  ('svff-l2-b2', 'sentence', 'Trời đang mưa nên chắc là anh ấy không tới đâu.', 'Es regnet, also kommt er wahrscheinlich nicht.', '', '', '', '', '', '', 'chắc là = wahrscheinlich', 14),
  ('svff-l2-b2', 'sentence', 'Cuối tuần này tôi có nhiều việc nên chắc là không đi du lịch được.', 'Dieses Wochenende habe ich viel zu tun, ich kann also wahrscheinlich nicht verreisen.', '', '', '', '', '', '', 'chắc là = wahrscheinlich', 15),
  ('svff-l2-b2', 'sentence', 'Nhanh lên, chắc là mọi người đang chờ tụi mình đó.', 'Beeil dich, wahrscheinlich warten alle schon auf uns.', '', '', '', '', '', '', 'chắc là = wahrscheinlich', 16),
  ('svff-l2-b2', 'sentence', 'Chi thấy rất vui khi gặp Lan.', 'Chi freut sich sehr, Lan zu treffen.', '', '', '', '', '', '', 'thấy + Adj = sich ... fühlen', 17),
  ('svff-l2-b2', 'sentence', 'Hôm nay làm việc cả ngày nên anh thấy mệt quá.', 'Heute habe ich den ganzen Tag gearbeitet, darum bin ich so müde.', '', '', '', '', '', '', 'thấy + Adj = sich ... fühlen', 18),
  ('svff-l2-b2', 'sentence', 'Tôi thấy hơi đau bụng.', 'Ich habe etwas Bauchweh.', '', '', '', '', '', '', 'thấy + Adj = sich ... fühlen', 19),
  ('svff-l2-b2', 'sentence', 'Lan được bạn tặng quà vào ngày sinh nhật.', 'Lan hat zum Geburtstag von einer Freundin ein Geschenk bekommen.', '', '', '', '', '', '', 'được = etwas Gutes widerfährt', 20),
  ('svff-l2-b2', 'sentence', 'Tôi được ba mẹ dẫn đi du lịch.', 'Meine Eltern haben mich auf eine Reise mitgenommen.', '', '', '', '', '', '', 'được = etwas Gutes widerfährt', 21),
  ('svff-l2-b2', 'sentence', 'Ảnh được giám đốc khen.', 'Er wurde vom Direktor gelobt.', '', '', '', '', '', '', 'được = etwas Gutes widerfährt', 22),
  ('svff-l2-b2', 'sentence', 'Tôi bị đau bụng từ tối hôm qua.', 'Ich habe seit gestern Abend Bauchschmerzen.', '', '', '', '', '', '', 'bị = etwas Schlechtes widerfährt', 23),
  ('svff-l2-b2', 'sentence', 'Cô ấy bị mất tiền.', 'Sie hat Geld verloren.', '', '', '', '', '', '', 'bị = etwas Schlechtes widerfährt', 24)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b3', 'Bài 3: Anh có nhắn gì không?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 3) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b3', 'vocab', 'coi phim', 'einen Film schauen (Süden)', 'to watch a movie', '', '', '', '', '', '', 0),
  ('svff-l2-b3', 'vocab', 'giùm / làm ơn', 'bitte (giùm: locker, làm ơn: höflicher)', 'please (help)', '', '', '', '', '', '', 1),
  ('svff-l2-b3', 'vocab', 'rảnh rỗi', 'frei, Freizeit haben', 'free, idle', '', '', '', '', '', '', 2),
  ('svff-l2-b3', 'vocab', 'xài', 'benutzen; Geld ausgeben (Süden)', 'to use, to spend', '', '', '', '', '', '', 3),
  ('svff-l2-b3', 'vocab', 'số điện thoại', 'Telefonnummer', 'phone number', '', '', '', '', '', '', 4),
  ('svff-l2-b3', 'vocab', 'bắt máy', 'abnehmen (Telefon)', 'to answer the phone', '', '', '', '', '', '', 5),
  ('svff-l2-b3', 'vocab', 'nhắn tin', 'eine Nachricht schreiben', 'to text', '', '', '', '', '', '', 6),
  ('svff-l2-b3', 'vocab', 'điện thoại bàn', 'Festnetztelefon', 'landline', '', '', '', '', '', '', 7),
  ('svff-l2-b3', 'vocab', 'ra ngoài', 'rausgehen, draussen sein', 'to go out', '', '', '', '', '', '', 8),
  ('svff-l2-b3', 'vocab', 'điện thoại di động', 'Handy', 'mobile phone', '', '', '', '', '', '', 9),
  ('svff-l2-b3', 'sentence', 'Làm ơn cho tôi nói chuyện với cô Thủy.', 'Bitte verbinden Sie mich mit Frau Thủy.', '', '', '', '', '', '', 'Telefonieren', 10),
  ('svff-l2-b3', 'sentence', 'A lô! Chào cô! Cô cho con gặp bạn Minh ạ!', 'Hallo! Guten Tag! Kann ich bitte mit Minh sprechen?', '', '', '', '', '', '', 'Telefonieren', 11),
  ('svff-l2-b3', 'sentence', 'Hình như sáng nay cô Lan không được vui lắm! Tôi thấy cô ấy không chào mọi người như hàng ngày.', 'Anscheinend ist Frau Lan heute Morgen nicht so gut drauf. Sie hat nicht wie sonst alle begrüsst.', '', '', '', '', '', '', 'hình như = anscheinend', 12),
  ('svff-l2-b3', 'sentence', 'Em nghe sếp nói hình như tuần sau công ty tụi mình đi du lịch.', 'Ich habe den Chef sagen hören, dass unsere Firma nächste Woche anscheinend einen Ausflug macht.', '', '', '', '', '', '', 'hình như = anscheinend', 13),
  ('svff-l2-b3', 'sentence', 'Hình như trời sắp mưa rồi.', 'Es sieht so aus, als würde es gleich regnen.', '', '', '', '', '', '', 'hình như = anscheinend', 14),
  ('svff-l2-b3', 'sentence', 'Vì làm việc xa nhà nên mỗi năm chị Hoa chỉ về quê thăm gia đình 2 lần.', 'Weil sie weit weg von zu Hause arbeitet, besucht Hoa ihre Familie nur zweimal im Jahr.', '', '', '', '', '', '', 'vì ... nên ... = weil ... deshalb', 15),
  ('svff-l2-b3', 'sentence', 'Vì ngày mai có bài kiểm tra nên tối nay em phải học bài tới khuya.', 'Weil morgen ein Test ist, muss ich heute Abend bis spät lernen.', '', '', '', '', '', '', 'vì ... nên ... = weil ... deshalb', 16),
  ('svff-l2-b3', 'sentence', 'Vì bận họp nên tôi không đi chơi được.', 'Weil ich eine Sitzung habe, kann ich nicht ausgehen.', '', '', '', '', '', '', 'vì ... nên ... = weil ... deshalb', 17),
  ('svff-l2-b3', 'sentence', 'Con coi phim đã. Rồi con ăn cơm.', 'Ich schaue zuerst noch den Film, dann esse ich.', '', '', '', '', '', '', 'V + đã = zuerst kurz', 18),
  ('svff-l2-b3', 'sentence', 'Tôi sẽ gọi lại sau.', 'Ich rufe später zurück.', '', '', '', '', '', '', 'V + lại = nochmals, zurück', 19)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b4', 'Bài 4: Anh đã đi Hà Nội bao giờ chưa?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 4) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b4', 'vocab', 'khí hậu', 'Klima', 'climate', '', '', '', '', '', '', 0),
  ('svff-l2-b4', 'vocab', 'hành lý', 'Gepäck', 'luggage', '', '', '', '', '', '', 1),
  ('svff-l2-b4', 'vocab', 'thú vị', 'interessant, spannend', 'interesting', '', '', '', '', '', '', 2),
  ('svff-l2-b4', 'vocab', 'đảo', 'Insel', 'island', '', '', '', '', '', '', 3),
  ('svff-l2-b4', 'vocab', 'mát mẻ', 'angenehm kühl', 'pleasantly cool', '', '', '', '', '', '', 4),
  ('svff-l2-b4', 'vocab', 'bình yên', 'friedlich, ruhig', 'peaceful', '', '', '', '', '', '', 5),
  ('svff-l2-b4', 'vocab', 'giúp / phụ', 'helfen', 'to help', '', '', '', '', '', '', 6),
  ('svff-l2-b4', 'vocab', 'bảo tàng', 'Museum', 'museum', '', '', '', '', '', '', 7),
  ('svff-l2-b4', 'vocab', 'đặc biệt', 'besonders', 'special', '', '', '', '', '', '', 8),
  ('svff-l2-b4', 'vocab', 'nổi tiếng', 'berühmt', 'famous', '', '', '', '', '', '', 9),
  ('svff-l2-b4', 'vocab', 'nghỉ mát', 'Ferien machen (am Meer, in den Bergen)', 'to go on holiday', '', '', '', '', '', '', 10),
  ('svff-l2-b4', 'vocab', 'lịch sử', 'Geschichte', 'history', '', '', '', '', '', '', 11),
  ('svff-l2-b4', 'vocab', 'có dịp', 'Gelegenheit haben', 'to have the chance', '', '', '', '', '', '', 12),
  ('svff-l2-b4', 'vocab', 'tham quan', 'besichtigen', 'to go sightseeing', '', '', '', '', '', '', 13),
  ('svff-l2-b4', 'vocab', 'hướng dẫn', 'anleiten, führen, erklären', 'to guide, instruct', '', '', '', '', '', '', 14),
  ('svff-l2-b4', 'vocab', 'danh lam thắng cảnh', 'Sehenswürdigkeit (landschaftlich)', 'scenic spot', '', '', '', '', '', '', 15),
  ('svff-l2-b4', 'vocab', 'di tích văn hóa', 'Kulturdenkmal', 'cultural relic', '', '', '', '', '', '', 16),
  ('svff-l2-b4', 'sentence', 'Tháng sau anh sẽ đi du lịch Đà Lạt và tham quan nhiều nơi nổi tiếng ở đó.', 'Nächsten Monat reise ich nach Đà Lạt und besichtige dort viele berühmte Orte.', '', '', '', '', '', '', 'Über Reisen sprechen', 17),
  ('svff-l2-b4', 'sentence', 'Cô Lan thích đi Hà Nội vì không những được đi tham quan nhiều danh lam thắng cảnh mà cô còn được nghe kể về lịch sử Việt Nam.', 'Frau Lan reist gern nach Hà Nội, weil sie dort nicht nur viele Sehenswürdigkeiten besichtigen, sondern auch etwas über die Geschichte Vietnams hören kann.', '', '', '', '', '', '', 'Über Reisen sprechen', 18),
  ('svff-l2-b4', 'sentence', 'Em thấy món này chị nấu ngon lắm!', 'Ich finde das Gericht, das du gekocht hast, sehr lecker!', '', '', '', '', '', '', 'thấy = finden (Meinung)', 19),
  ('svff-l2-b4', 'sentence', 'Cô thấy bài kiểm tra này em làm chưa tốt.', 'Ich finde, diesen Test hast du noch nicht gut gemacht.', '', '', '', '', '', '', 'thấy = finden (Meinung)', 20),
  ('svff-l2-b4', 'sentence', 'Anh thấy món ăn này thế nào?', 'Wie findest du dieses Gericht?', '', '', '', '', '', '', 'thấy = finden (Meinung)', 21),
  ('svff-l2-b4', 'sentence', 'Nghe nói chị Linh sắp kết hôn rồi đó!', 'Ich habe gehört, Linh heiratet bald!', '', '', '', '', '', '', 'nghe nói = ich habe gehört', 22),
  ('svff-l2-b4', 'sentence', 'Em nghe nói nhà hàng này ăn ngon lắm!', 'Ich habe gehört, das Essen in diesem Restaurant ist sehr gut!', '', '', '', '', '', '', 'nghe nói = ich habe gehört', 23),
  ('svff-l2-b4', 'sentence', 'Tôi nghe nói cổ sắp đi du lịch Pháp.', 'Ich habe gehört, sie reist bald nach Frankreich.', '', '', '', '', '', '', 'nghe nói = ich habe gehört', 24),
  ('svff-l2-b4', 'sentence', 'Tại sao sáng nay con không đi học mà ở nhà?', 'Warum bist du heute Morgen nicht zur Schule gegangen, sondern zu Hause geblieben?', '', '', '', '', '', '', 'mà = entgegen der Erwartung', 25),
  ('svff-l2-b4', 'sentence', 'Bé My không ăn cơm mà chỉ coi tivi.', 'Die kleine My isst nicht, sondern schaut nur fern.', '', '', '', '', '', '', 'mà = entgegen der Erwartung', 26),
  ('svff-l2-b4', 'sentence', 'Bộ quần áo đó đẹp như vậy mà chị không thích hả?', 'Das Outfit ist so schön, und du magst es nicht?', '', '', '', '', '', '', 'mà = entgegen der Erwartung', 27),
  ('svff-l2-b4', 'sentence', 'Chị đã đi du lịch nước ngoài bao giờ chưa?', 'Bist du schon mal ins Ausland gereist?', '', '', '', '', '', '', 'đã ... bao giờ chưa? = schon einmal?', 28),
  ('svff-l2-b4', 'sentence', 'Anh đã bao giờ ăn sầu riêng chưa?', 'Hast du schon mal Durian gegessen?', '', '', '', '', '', '', 'đã bao giờ ... chưa? = schon einmal?', 29),
  ('svff-l2-b4', 'sentence', 'Anh đã gặp cổ bao giờ chưa?', 'Hast du sie schon einmal getroffen?', '', '', '', '', '', '', 'đã ... bao giờ chưa? = schon einmal?', 30),
  ('svff-l2-b4', 'sentence', 'Mai nghỉ hả?', 'Morgen ist frei, echt?', '', '', '', '', '', '', 'hả = echt?', 31)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b5', 'Bài 5: Phòng loại một bao nhiêu một đêm?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 5) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b5', 'vocab', 'tiện nghi', 'komfortabel, gut ausgestattet', 'well-equipped, convenient', '', '', '', '', '', '', 0),
  ('svff-l2-b5', 'vocab', 'dưới', 'unter, unten', 'below, under', '', '', '', '', '', '', 1),
  ('svff-l2-b5', 'vocab', 'giặt đồ', 'Wäsche waschen', 'to do laundry', '', '', '', '', '', '', 2),
  ('svff-l2-b5', 'vocab', 'nhận phòng / trả phòng', 'einchecken / auschecken', 'check in / check out', '', '', '', '', '', '', 3),
  ('svff-l2-b5', 'vocab', 'miễn phí', 'gratis', 'free of charge', '', '', '', '', '', '', 4),
  ('svff-l2-b5', 'vocab', 'phòng đôi', 'Doppelzimmer', 'double room', '', '', '', '', '', '', 5),
  ('svff-l2-b5', 'vocab', 'thuê', 'mieten', 'to rent', '', '', '', '', '', '', 6),
  ('svff-l2-b5', 'vocab', 'máy lạnh', 'Klimaanlage (Süden)', 'air conditioner', '', '', '', '', '', '', 7),
  ('svff-l2-b5', 'vocab', 'trên', 'auf, über, oben', 'on, above', '', '', '', '', '', '', 8),
  ('svff-l2-b5', 'vocab', 'sạch sẽ', 'sauber', 'clean', '', '', '', '', '', '', 9),
  ('svff-l2-b5', 'vocab', 'ngoài', 'ausserhalb, draussen', 'outside', '', '', '', '', '', '', 10),
  ('svff-l2-b5', 'vocab', 'thoáng mát', 'luftig und kühl', 'airy, cool', '', '', '', '', '', '', 11),
  ('svff-l2-b5', 'vocab', 'tất cả', 'alle, alles', 'all', '', '', '', '', '', '', 12),
  ('svff-l2-b5', 'vocab', 'phục vụ', 'bedienen, servieren', 'to serve', '', '', '', '', '', '', 13),
  ('svff-l2-b5', 'sentence', 'Tuy giá ở đây rất mắc nhưng tụi tôi vẫn rất thích ăn ở nhà hàng này.', 'Obwohl es hier sehr teuer ist, essen wir trotzdem sehr gern in diesem Restaurant.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 14),
  ('svff-l2-b5', 'sentence', 'Tuy rất mệt nhưng chị Mai vẫn phải cố gắng làm xong việc.', 'Obwohl Mai sehr müde ist, muss sie sich trotzdem anstrengen, die Arbeit fertig zu machen.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 15),
  ('svff-l2-b5', 'sentence', 'Ổng đồng ý, tuy rằng ổng không muốn cho lắm.', 'Er war einverstanden, obwohl er nicht wirklich wollte.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 16),
  ('svff-l2-b5', 'sentence', 'Cuốn sách của con nằm ở trên bàn.', 'Dein Buch liegt auf dem Tisch.', '', '', '', '', '', '', 'Position angeben', 17),
  ('svff-l2-b5', 'sentence', 'Con chó của tôi đang chơi ở ngoài sân.', 'Mein Hund spielt draussen im Hof.', '', '', '', '', '', '', 'Position angeben', 18)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b6', 'Bài 6: Chị ấy làm nghề gì vậy?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 6) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b6', 'vocab', 'trả giá', 'feilschen', 'to bargain', '', '', '', '', '', '', 0),
  ('svff-l2-b6', 'vocab', 'đề nghị', 'vorschlagen, beantragen (formell)', 'to propose', '', '', '', '', '', '', 1),
  ('svff-l2-b6', 'vocab', 'nông trại', 'Bauernhof', 'farm', '', '', '', '', '', '', 2),
  ('svff-l2-b6', 'vocab', 'tòa lâu đài', 'Schloss, Burg', 'castle', '', '', '', '', '', '', 3),
  ('svff-l2-b6', 'vocab', 'cuốn', 'Zähleinheit für Bücher, Hefte', 'classifier for books', '', '', '', '', '', '', 4),
  ('svff-l2-b6', 'vocab', 'xây', 'bauen', 'to build', '', '', '', '', '', '', 5),
  ('svff-l2-b6', 'vocab', 'bò sữa', 'Milchkuh', 'dairy cow', '', '', '', '', '', '', 6),
  ('svff-l2-b6', 'vocab', 'bức tranh', 'Gemälde, Bild', 'painting', '', '', '', '', '', '', 7),
  ('svff-l2-b6', 'vocab', 'làm ăn', 'Geschäfte machen, seinen Lebensunterhalt verdienen', 'to do business', '', '', '', '', '', '', 8),
  ('svff-l2-b6', 'vocab', 'hàng xóm', 'Nachbar/in', 'neighbour', '', '', '', '', '', '', 9),
  ('svff-l2-b6', 'sentence', 'Tôi được mời đi đến tiệc sinh nhật của người bạn thân.', 'Ich wurde zur Geburtstagsparty eines guten Freundes eingeladen.', '', '', '', '', '', '', 'được = etwas Gutes widerfährt', 10),
  ('svff-l2-b6', 'sentence', 'Tuần sau bé Bi bắt đầu được nghỉ hè nên bé rất vui.', 'Nächste Woche beginnen für den kleinen Bi die Sommerferien, darum freut er sich sehr.', '', '', '', '', '', '', 'được = etwas Gutes widerfährt', 11),
  ('svff-l2-b6', 'sentence', 'Anh ấy bị trễ giờ vì ảnh ngủ quên.', 'Er kam zu spät, weil er verschlafen hat.', '', '', '', '', '', '', 'bị = etwas Schlechtes widerfährt', 12),
  ('svff-l2-b6', 'sentence', 'Lan bị cô giáo la vì ẻm quên làm bài tập về nhà.', 'Lan wurde von der Lehrerin geschimpft, weil sie die Hausaufgaben vergessen hat.', '', '', '', '', '', '', 'bị = etwas Schlechtes widerfährt', 13),
  ('svff-l2-b6', 'sentence', 'Tôi thấy hơi khó chịu. Chắc là tôi bị bệnh rồi.', 'Ich fühle mich etwas unwohl. Wahrscheinlich bin ich krank.', '', '', '', '', '', '', 'chắc là = wahrscheinlich', 14),
  ('svff-l2-b6', 'sentence', 'Trời mưa rồi! Chắc là chiều nay ảnh không tới được đâu.', 'Es regnet! Wahrscheinlich kann er heute Nachmittag nicht kommen.', '', '', '', '', '', '', 'chắc là = wahrscheinlich', 15),
  ('svff-l2-b6', 'sentence', 'Hình như em quên đem theo tiền rồi.', 'Ich glaube, ich habe vergessen, Geld mitzunehmen.', '', '', '', '', '', '', 'hình như = anscheinend', 16),
  ('svff-l2-b6', 'sentence', 'Hình như ngày mai là sinh nhật của anh Nam đó!', 'Anscheinend hat Nam morgen Geburtstag!', '', '', '', '', '', '', 'hình như = anscheinend', 17),
  ('svff-l2-b6', 'sentence', 'Vì bây giờ còn sớm nên tôi muốn ra ngoài đi dạo.', 'Weil es noch früh ist, will ich einen Spaziergang machen.', '', '', '', '', '', '', 'vì ... nên ... = weil ... deshalb', 18),
  ('svff-l2-b6', 'sentence', 'Vì hôm qua ngủ trễ nên hôm nay tôi thức dậy trễ.', 'Weil ich gestern spät ins Bett ging, bin ich heute spät aufgewacht.', '', '', '', '', '', '', 'vì ... nên ... = weil ... deshalb', 19),
  ('svff-l2-b6', 'sentence', 'Anh Nam không những giỏi tiếng Anh mà còn giỏi tiếng Pháp nữa.', 'Nam ist nicht nur gut in Englisch, sondern auch in Französisch.', '', '', '', '', '', '', 'không những ... mà còn ... = nicht nur ... sondern auch', 20),
  ('svff-l2-b6', 'sentence', 'Cái điện thoại này không những không tốt mà còn mắc nữa.', 'Dieses Handy ist nicht nur schlecht, sondern auch teuer.', '', '', '', '', '', '', 'không những ... mà còn ... = nicht nur ... sondern auch', 21),
  ('svff-l2-b6', 'sentence', 'Cô ấy không những thông minh mà còn siêng năng nữa.', 'Sie ist nicht nur klug, sondern auch fleissig.', '', '', '', '', '', '', 'không những ... mà còn ... = nicht nur ... sondern auch', 22),
  ('svff-l2-b6', 'sentence', 'Tuy nhà tôi nhỏ nhưng bên trong rất tiện nghi.', 'Obwohl mein Haus klein ist, ist es innen sehr komfortabel.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 23),
  ('svff-l2-b6', 'sentence', 'Tuy nhà xa trường nhưng ngày nào bé Hoa cũng đi học đúng giờ.', 'Obwohl ihr Haus weit von der Schule weg ist, kommt die kleine Hoa jeden Tag pünktlich.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 24)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b7', 'Bài 7: Tôi thích nhà này nhưng...', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 7) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b7', 'vocab', 'ban công', 'Balkon', 'balcony', '', '', '', '', '', '', 0),
  ('svff-l2-b7', 'vocab', 'đằng kia', 'dort drüben', 'over there', '', '', '', '', '', '', 1),
  ('svff-l2-b7', 'vocab', 'nhà tắm', 'Badezimmer', 'bathroom', '', '', '', '', '', '', 2),
  ('svff-l2-b7', 'vocab', 'chật', 'eng', 'cramped, tight', '', '', '', '', '', '', 3),
  ('svff-l2-b7', 'vocab', 'sẵn sàng', 'bereit', 'ready', '', '', '', '', '', '', 4),
  ('svff-l2-b7', 'vocab', 'tự nhiên', 'natürlich, spontan', 'natural', '', '', '', '', '', '', 5),
  ('svff-l2-b7', 'vocab', 'thư giãn', 'entspannen', 'to relax', '', '', '', '', '', '', 6),
  ('svff-l2-b7', 'vocab', 'biệt thự', 'Villa', 'villa', '', '', '', '', '', '', 7),
  ('svff-l2-b7', 'vocab', 'diện tích', 'Fläche', 'area', '', '', '', '', '', '', 8),
  ('svff-l2-b7', 'vocab', 'trang trí', 'dekorieren', 'to decorate', '', '', '', '', '', '', 9),
  ('svff-l2-b7', 'vocab', 'ở mặt tiền đường', 'direkt an der Strasse gelegen', 'on the street front', '', '', '', '', '', '', 10),
  ('svff-l2-b7', 'vocab', 'ngôi chùa', 'Pagode', 'pagoda', '', '', '', '', '', '', 11),
  ('svff-l2-b7', 'vocab', 'phòng khách', 'Wohnzimmer', 'living room', '', '', '', '', '', '', 12),
  ('svff-l2-b7', 'vocab', 'phòng ngủ', 'Schlafzimmer', 'bedroom', '', '', '', '', '', '', 13),
  ('svff-l2-b7', 'vocab', 'nhà vệ sinh', 'Toilette', 'toilet', '', '', '', '', '', '', 14),
  ('svff-l2-b7', 'sentence', 'Người em thì rất siêng học, còn người anh thì thích chơi game hơn học.', 'Der Jüngere lernt sehr fleissig, der Ältere gamet hingegen lieber, als zu lernen.', '', '', '', '', '', '', 'A thì ..., còn B thì ... = Gegenüberstellung', 15),
  ('svff-l2-b7', 'sentence', 'Phòng tắm thì rộng, còn phòng ngủ thì chật.', 'Das Bad ist geräumig, das Schlafzimmer hingegen eng.', '', '', '', '', '', '', 'A thì ..., còn B thì ... = Gegenüberstellung', 16),
  ('svff-l2-b7', 'sentence', 'Chị tui thì hoạt bát lắm, còn anh tui thì nhút nhát kinh khủng.', 'Meine Schwester ist sehr aufgeweckt, mein Bruder hingegen extrem schüchtern.', '', '', '', '', '', '', 'A thì ..., còn B thì ... = Gegenüberstellung', 17),
  ('svff-l2-b7', 'sentence', 'Nhà của tôi có 4 phòng: 2 phòng ngủ, 1 nhà bếp và 1 phòng tắm.', 'Mein Haus hat 4 Räume: 2 Schlafzimmer, 1 Küche und 1 Bad.', '', '', '', '', '', '', 'Über die Wohnung sprechen', 18),
  ('svff-l2-b7', 'sentence', 'Căn nhà của chị Mai nằm ở tầng 5 một khu chung cư.', 'Mais Wohnung liegt im 5. Stock eines Wohnblocks.', '', '', '', '', '', '', 'Über die Wohnung sprechen', 19),
  ('svff-l2-b7', 'sentence', 'Tất cả các ngôi nhà ở đây đều được xây dựng từ trước năm 1930.', 'Alle Häuser hier wurden vor 1930 gebaut.', '', '', '', '', '', '', 'các / những = Plural', 20),
  ('svff-l2-b7', 'sentence', 'Mình đang tìm một căn hộ nhỏ nhưng tiện nghi.', 'Ich suche eine kleine, aber gut ausgestattete Wohnung.', '', '', '', '', '', '', 'căn / ngôi / tòa = Zählwörter für Gebäude', 21)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b8', 'Bài 8: Lúc rảnh anh hay làm gì?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 8) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b8', 'vocab', 'khó khăn', 'Schwierigkeit, schwierig', 'difficulty', '', '', '', '', '', '', 0),
  ('svff-l2-b8', 'vocab', 'đọc sách', 'lesen', 'to read', '', '', '', '', '', '', 1),
  ('svff-l2-b8', 'vocab', 'chơi thể thao', 'Sport treiben', 'to play sports', '', '', '', '', '', '', 2),
  ('svff-l2-b8', 'vocab', 'cãi nhau', 'streiten', 'to quarrel', '', '', '', '', '', '', 3),
  ('svff-l2-b8', 'vocab', 'đi mua sắm', 'einkaufen gehen', 'to go shopping', '', '', '', '', '', '', 4),
  ('svff-l2-b8', 'vocab', 'thưởng', 'Bonus, Belohnung; belohnen', 'bonus, reward', '', '', '', '', '', '', 5),
  ('svff-l2-b8', 'vocab', 'nghiên cứu', 'forschen, recherchieren', 'to research', '', '', '', '', '', '', 6),
  ('svff-l2-b8', 'vocab', 'luôn luôn', 'immer', 'always', '', '', '', '', '', '', 7),
  ('svff-l2-b8', 'vocab', 'gọi điện thoại', 'anrufen', 'to call', '', '', '', '', '', '', 8),
  ('svff-l2-b8', 'vocab', 'thăm', 'besuchen', 'to visit', '', '', '', '', '', '', 9),
  ('svff-l2-b8', 'vocab', 'tiểu thuyết', 'Roman', 'novel', '', '', '', '', '', '', 10),
  ('svff-l2-b8', 'vocab', 'phim hài', 'Komödie', 'comedy film', '', '', '', '', '', '', 11),
  ('svff-l2-b8', 'sentence', 'Cô ấy tự mua cho mình một cái áo vào ngày sinh nhật của cổ.', 'Sie hat sich an ihrem Geburtstag selbst ein Oberteil gekauft.', '', '', '', '', '', '', 'mình = sich selbst / ich (locker)', 12),
  ('svff-l2-b8', 'sentence', 'Cô ấy bị bệnh vì cổ đã không quan tâm đến bản thân mình.', 'Sie ist krank geworden, weil sie nicht auf sich selbst geachtet hat.', '', '', '', '', '', '', 'mình = sich selbst / ich (locker)', 13),
  ('svff-l2-b8', 'sentence', 'Mình đi trước nha, hẹn gặp lại.', 'Ich gehe schon mal, bis bald.', '', '', '', '', '', '', 'mình = sich selbst / ich (locker)', 14),
  ('svff-l2-b8', 'sentence', 'Cuối tuần này cả nhà tôi sẽ đi du lịch.', 'Dieses Wochenende verreist meine ganze Familie.', '', '', '', '', '', '', 'cả = ganz, gesamt', 15),
  ('svff-l2-b8', 'sentence', 'Cả lớp đang làm bài kiểm tra.', 'Die ganze Klasse schreibt gerade einen Test.', '', '', '', '', '', '', 'cả = ganz, gesamt', 16),
  ('svff-l2-b8', 'sentence', 'Ngày mai, cả lớp đi Vũng Tàu.', 'Morgen fährt die ganze Klasse nach Vũng Tàu.', '', '', '', '', '', '', 'cả = ganz, gesamt', 17),
  ('svff-l2-b8', 'sentence', 'Tất cả các bạn nhớ mang theo căn cước nha.', 'Denkt alle daran, eure ID mitzunehmen.', '', '', '', '', '', '', 'tất cả = alle', 18),
  ('svff-l2-b8', 'sentence', 'Sầu riêng càng ăn càng thấy ngon.', 'Je mehr man Durian isst, desto besser schmeckt sie.', '', '', '', '', '', '', 'càng ... càng ... = je mehr ... desto', 19),
  ('svff-l2-b8', 'sentence', 'Trời mưa càng ngày càng lớn nên tôi không đi ra ngoài được.', 'Der Regen wird immer stärker, darum kann ich nicht rausgehen.', '', '', '', '', '', '', 'càng ... càng ... = je mehr ... desto', 20),
  ('svff-l2-b8', 'sentence', 'Càng ngày họ càng hiểu nhau hơn.', 'Sie verstehen sich von Tag zu Tag besser.', '', '', '', '', '', '', 'càng ... càng ... = je mehr ... desto', 21),
  ('svff-l2-b8', 'sentence', 'Tôi luôn luôn thức dậy lúc 6 giờ sáng để tập thể dục.', 'Ich stehe immer um 6 Uhr auf, um Sport zu machen.', '', '', '', '', '', '', 'Häufigkeit: luôn luôn = immer', 22),
  ('svff-l2-b8', 'sentence', 'Chị ấy thường đi làm vào lúc 8 giờ sáng.', 'Sie geht normalerweise um 8 Uhr zur Arbeit.', '', '', '', '', '', '', 'Häufigkeit: thường = normalerweise', 23),
  ('svff-l2-b8', 'sentence', 'Anh ấy thỉnh thoảng đi du lịch vào cuối tuần.', 'Er verreist manchmal am Wochenende.', '', '', '', '', '', '', 'Häufigkeit: thỉnh thoảng = manchmal', 24),
  ('svff-l2-b8', 'sentence', 'Tôi hiếm khi uống cà phê vào buổi tối.', 'Ich trinke selten abends Kaffee.', '', '', '', '', '', '', 'Häufigkeit: hiếm khi = selten', 25),
  ('svff-l2-b8', 'sentence', 'Tôi không bao giờ bỏ bữa sáng.', 'Ich lasse nie das Frühstück aus.', '', '', '', '', '', '', 'Häufigkeit: không bao giờ = nie', 26)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b9', 'Bài 9: Em thích mọi thứ trừ...', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 9) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b9', 'vocab', 'phóng viên', 'Journalist/in', 'journalist', '', '', '', '', '', '', 0),
  ('svff-l2-b9', 'vocab', 'sưu tầm', 'sammeln', 'to collect', '', '', '', '', '', '', 1),
  ('svff-l2-b9', 'vocab', 'cuối cùng', 'schliesslich, endlich', 'finally', '', '', '', '', '', '', 2),
  ('svff-l2-b9', 'vocab', 'kế hoạch', 'Plan', 'plan', '', '', '', '', '', '', 3),
  ('svff-l2-b9', 'vocab', 'phỏng vấn', 'interviewen', 'to interview', '', '', '', '', '', '', 4),
  ('svff-l2-b9', 'vocab', 'chẳng hạn', 'zum Beispiel', 'for example', '', '', '', '', '', '', 5),
  ('svff-l2-b9', 'vocab', 'tâm lý', 'Psychologie, Gemütszustand', 'psychology, mindset', '', '', '', '', '', '', 6),
  ('svff-l2-b9', 'vocab', 'xã hội', 'Gesellschaft', 'society', '', '', '', '', '', '', 7),
  ('svff-l2-b9', 'vocab', 'thói quen', 'Gewohnheit', 'habit', '', '', '', '', '', '', 8),
  ('svff-l2-b9', 'vocab', 'sở thích', 'Hobby', 'hobby', '', '', '', '', '', '', 9),
  ('svff-l2-b9', 'vocab', 'truyện ngắn', 'Kurzgeschichte', 'short story', '', '', '', '', '', '', 10),
  ('svff-l2-b9', 'vocab', 'âm nhạc', 'Musik', 'music', '', '', '', '', '', '', 11),
  ('svff-l2-b9', 'vocab', 'trường quay', 'Filmstudio', 'studio', '', '', '', '', '', '', 12),
  ('svff-l2-b9', 'vocab', 'nhạc nhẹ', 'leichte Musik, Softmusik', 'light music', '', '', '', '', '', '', 13),
  ('svff-l2-b9', 'vocab', 'diễn viên', 'Schauspieler/in', 'actor', '', '', '', '', '', '', 14),
  ('svff-l2-b9', 'sentence', 'Trời đang mưa. Hãy cẩn thận khi lái xe!', 'Es regnet. Fahr vorsichtig!', '', '', '', '', '', '', 'hãy + V = Imperativ', 15),
  ('svff-l2-b9', 'sentence', 'Anh hãy nói cho em biết đi!', 'Sag es mir doch!', '', '', '', '', '', '', 'hãy + V = Imperativ', 16),
  ('svff-l2-b9', 'sentence', 'Anh hãy đi ra đi!', 'Geh raus!', '', '', '', '', '', '', 'hãy + V = Imperativ', 17),
  ('svff-l2-b9', 'sentence', 'Em đang muốn ăn gì đó, bánh xèo chẳng hạn.', 'Ich hätte Lust auf etwas, zum Beispiel Bánh xèo.', '', '', '', '', '', '', 'chẳng hạn = zum Beispiel', 18),
  ('svff-l2-b9', 'sentence', 'Sắp tới tui sẽ đi du lịch nhiều nơi, ví dụ như đi Đà Lạt chẳng hạn.', 'Demnächst reise ich an viele Orte, zum Beispiel nach Đà Lạt.', '', '', '', '', '', '', 'chẳng hạn = zum Beispiel', 19),
  ('svff-l2-b9', 'sentence', 'Tui muốn ăn cái gì đó, mì chẳng hạn.', 'Ich will etwas essen, zum Beispiel Nudeln.', '', '', '', '', '', '', 'chẳng hạn = zum Beispiel', 20),
  ('svff-l2-b9', 'sentence', 'Ngoài học ra, anh cần phải tập nói tiếng Việt nhiều hơn nữa.', 'Ausser zu lernen musst du auch mehr Vietnamesisch sprechen üben.', '', '', '', '', '', '', 'ngoài ... ra = ausser ... (noch)', 21),
  ('svff-l2-b9', 'sentence', 'Cổ thích ăn món Hàn, món Trung, ngoài ra còn có món Việt nữa.', 'Sie isst gern koreanisch und chinesisch, ausserdem auch vietnamesisch.', '', '', '', '', '', '', 'ngoài ra = ausserdem', 22),
  ('svff-l2-b9', 'sentence', 'Ngoài tui ra, còn có năm người nữa ở đây.', 'Ausser mir sind noch fünf andere Leute hier.', '', '', '', '', '', '', 'ngoài ... ra = ausser ... (noch)', 23),
  ('svff-l2-b9', 'sentence', 'Hôm nay, cả lớp đều đi học, trừ My.', 'Heute sind alle in der Schule, ausser My.', '', '', '', '', '', '', 'trừ = ausser', 24),
  ('svff-l2-b9', 'sentence', 'Tôi thích tất cả các loại trái cây, trừ sầu riêng.', 'Ich mag alle Früchte, ausser Durian.', '', '', '', '', '', '', 'trừ = ausser', 25),
  ('svff-l2-b9', 'sentence', 'Mình mời hết mọi người đi tiệc rồi, trừ thằng người yêu cũ của mình.', 'Ich habe alle zur Party eingeladen, ausser meinen Ex.', '', '', '', '', '', '', 'trừ = ausser', 26)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b10', 'Bài 10: Tôi không còn làm ở đó nữa', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 10) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b10', 'vocab', 'năng suất', 'Produktivität', 'productivity', '', '', '', '', '', '', 0),
  ('svff-l2-b10', 'vocab', 'cử nhân', 'Bachelor (Abschluss)', 'bachelor''s degree', '', '', '', '', '', '', 1),
  ('svff-l2-b10', 'vocab', 'vô dụng', 'nutzlos', 'useless', '', '', '', '', '', '', 2),
  ('svff-l2-b10', 'vocab', 'kinh nghiệm', 'Erfahrung', 'experience', '', '', '', '', '', '', 3),
  ('svff-l2-b10', 'vocab', 'đồng nghiệp', 'Arbeitskolleg/in', 'colleague', '', '', '', '', '', '', 4),
  ('svff-l2-b10', 'vocab', 'vất vả', 'anstrengend, mühsam', 'toilsome, hard', '', '', '', '', '', '', 5),
  ('svff-l2-b10', 'vocab', 'thăng tiến', 'befördert werden, aufsteigen', 'to get promoted', '', '', '', '', '', '', 6),
  ('svff-l2-b10', 'vocab', 'ổn định', 'stabil, sicher', 'stable', '', '', '', '', '', '', 7),
  ('svff-l2-b10', 'vocab', 'căng thẳng', 'Stress, gestresst', 'stress', '', '', '', '', '', '', 8),
  ('svff-l2-b10', 'vocab', 'kế toán', 'Buchhalter/in', 'accountant', '', '', '', '', '', '', 9),
  ('svff-l2-b10', 'vocab', 'khó tính', 'schwierig, pingelig', 'hard to please', '', '', '', '', '', '', 10),
  ('svff-l2-b10', 'vocab', 'chứng chỉ', 'Zertifikat', 'certificate', '', '', '', '', '', '', 11),
  ('svff-l2-b10', 'vocab', 'căng', 'stressig, angespannt (Süden)', 'tense, stressful', '', '', '', '', '', '', 12),
  ('svff-l2-b10', 'vocab', 'áp lực', 'Druck', 'pressure', '', '', '', '', '', '', 13),
  ('svff-l2-b10', 'vocab', 'chuyên môn', 'Fachgebiet, Fachkompetenz', 'expertise', '', '', '', '', '', '', 14),
  ('svff-l2-b10', 'vocab', 'chuyển', 'wechseln, verschieben, überweisen', 'to move, transfer', '', '', '', '', '', '', 15),
  ('svff-l2-b10', 'vocab', 'mặc dù', 'obwohl', 'although', '', '', '', '', '', '', 16),
  ('svff-l2-b10', 'vocab', 'lương bổng', 'Lohn, Gehalt', 'salary', '', '', '', '', '', '', 17),
  ('svff-l2-b10', 'vocab', 'mất việc', 'den Job verlieren', 'to lose one''s job', '', '', '', '', '', '', 18),
  ('svff-l2-b10', 'sentence', 'Ủa? Cuối tuần mà anh không đi ra ngoài chơi hả?', 'Hä? Es ist Wochenende und du gehst nicht raus?', '', '', '', '', '', '', 'hả / sao = überraschte Rückfrage', 19),
  ('svff-l2-b10', 'sentence', 'Chị thấy món này ăn không ngon sao?', 'Du findest das Gericht nicht lecker?', '', '', '', '', '', '', 'hả / sao = überraschte Rückfrage', 20),
  ('svff-l2-b10', 'sentence', 'Tối qua bạn không đi coi phim sao?', 'Du warst gestern Abend nicht im Kino?', '', '', '', '', '', '', 'hả / sao = überraschte Rückfrage', 21),
  ('svff-l2-b10', 'sentence', 'Sao anh lại nói với chỉ như vậy? Chỉ buồn đó!', 'Warum sagst du so etwas zu ihr? Sie ist traurig!', '', '', '', '', '', '', 'lại + V = entgegen der Erwartung', 22),
  ('svff-l2-b10', 'sentence', 'Món này ngon vậy mà ảnh lại không thích.', 'Das Gericht ist so lecker, und trotzdem mag er es nicht.', '', '', '', '', '', '', 'lại + V = entgegen der Erwartung', 23),
  ('svff-l2-b10', 'sentence', 'Nắng vậy sao lại ra sân ngồi?', 'Bei der Sonne, warum sitzt du draussen im Hof?', '', '', '', '', '', '', 'lại + V = entgegen der Erwartung', 24),
  ('svff-l2-b10', 'sentence', 'Mặc dù học rất giỏi ở đại học nhưng cổ không tìm được một công việc phù hợp.', 'Obwohl sie an der Uni sehr gut war, findet sie keine passende Stelle.', '', '', '', '', '', '', 'mặc dù ... nhưng ... = obwohl', 25),
  ('svff-l2-b10', 'sentence', 'Mặc dù bị sốt nhưng tôi vẫn phải đến trường để làm bài kiểm tra.', 'Obwohl ich Fieber habe, muss ich trotzdem zur Schule, um den Test zu schreiben.', '', '', '', '', '', '', 'mặc dù ... nhưng ... = obwohl', 26),
  ('svff-l2-b10', 'sentence', 'Mặc dù ảnh đẹp trai nhưng vẫn ế.', 'Obwohl er gut aussieht, ist er immer noch Single.', '', '', '', '', '', '', 'mặc dù ... nhưng ... = obwohl', 27)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b11', 'Bài 11: Ảnh là người như thế nào?', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 11) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b11', 'vocab', 'hài hước', 'humorvoll, lustig', 'funny', '', '', '', '', '', '', 0),
  ('svff-l2-b11', 'vocab', 'quầy tiếp tân', 'Empfang, Rezeption', 'front desk', '', '', '', '', '', '', 1),
  ('svff-l2-b11', 'vocab', 'sang trọng', 'luxuriös, elegant', 'luxurious', '', '', '', '', '', '', 2),
  ('svff-l2-b11', 'vocab', 'vui tính', 'fröhlich, gut gelaunt (Charakter)', 'cheerful', '', '', '', '', '', '', 3),
  ('svff-l2-b11', 'vocab', 'tính tình', 'Charakter, Temperament', 'personality', '', '', '', '', '', '', 4),
  ('svff-l2-b11', 'vocab', 'lời khen', 'Kompliment', 'compliment', '', '', '', '', '', '', 5),
  ('svff-l2-b11', 'vocab', 'tóc vàng', 'blonde Haare', 'blond hair', '', '', '', '', '', '', 6),
  ('svff-l2-b11', 'vocab', 'cao', 'gross (Körper), hoch', 'tall', '', '', '', '', '', '', 7),
  ('svff-l2-b11', 'vocab', 'nói thiệt', 'ehrlich gesagt (Süden)', 'to be honest', '', '', '', '', '', '', 8),
  ('svff-l2-b11', 'vocab', 'mắt xanh', 'blaue Augen', 'blue eyes', '', '', '', '', '', '', 9),
  ('svff-l2-b11', 'vocab', 'mập', 'dick', 'fat', '', '', '', '', '', '', 10),
  ('svff-l2-b11', 'vocab', 'thái độ', 'Haltung, Einstellung', 'attitude', '', '', '', '', '', '', 11),
  ('svff-l2-b11', 'sentence', 'Cuối tuần này tui không đi đâu hết.', 'Dieses Wochenende gehe ich nirgendwohin.', '', '', '', '', '', '', 'không ... hết = absolute Verneinung', 12),
  ('svff-l2-b11', 'sentence', 'Ở trường mới, anh ấy không quen ai hết.', 'An der neuen Schule kennt er niemanden.', '', '', '', '', '', '', 'không ... hết = absolute Verneinung', 13),
  ('svff-l2-b11', 'sentence', 'Không ngày nào cô ấy vắng mặt.', 'Sie fehlt keinen einzigen Tag.', '', '', '', '', '', '', 'không N nào = kein einziges', 14),
  ('svff-l2-b11', 'sentence', 'Mẹ la bé Bi vì nó vừa đọc truyện vừa ăn cơm.', 'Mama schimpft mit dem kleinen Bi, weil er beim Essen liest.', '', '', '', '', '', '', 'vừa ... vừa ... = gleichzeitig', 15),
  ('svff-l2-b11', 'sentence', 'Anh Nam là một người vừa đẹp trai vừa tài giỏi.', 'Nam ist gutaussehend und talentiert zugleich.', '', '', '', '', '', '', 'vừa ... vừa ... = sowohl ... als auch', 16),
  ('svff-l2-b11', 'sentence', 'Ông giám đốc đó vừa khó tính vừa không có năng lực.', 'Dieser Direktor ist sowohl schwierig als auch inkompetent.', '', '', '', '', '', '', 'vừa ... vừa ... = sowohl ... als auch', 17),
  ('svff-l2-b11', 'sentence', 'Chị Linh khoảng 26 tuổi, hơi cao và gầy.', 'Linh ist etwa 26, eher gross und schlank.', '', '', '', '', '', '', 'Aussehen beschreiben', 18),
  ('svff-l2-b11', 'sentence', 'Anh Long rất đẹp trai. Ảnh cao và hơi ốm, tóc và mắt đều đen.', 'Long sieht sehr gut aus. Er ist gross und eher schlank, Haare und Augen sind schwarz.', '', '', '', '', '', '', 'Aussehen beschreiben', 19),
  ('svff-l2-b11', 'sentence', 'Tui và Lan cao bằng nhau.', 'Lan und ich sind gleich gross.', '', '', '', '', '', '', 'bằng = gleich ... wie', 20),
  ('svff-l2-b11', 'sentence', 'Không ai nấu ăn ngon bằng mẹ tui, nhất là món bún thịt nướng.', 'Niemand kocht so gut wie meine Mutter, vor allem Bún thịt nướng.', '', '', '', '', '', '', 'không ai ... bằng = niemand so ... wie', 21),
  ('svff-l2-b11', 'sentence', 'Biển này đẹp không đâu bằng.', 'Nirgends ist das Meer so schön wie hier.', '', '', '', '', '', '', 'không đâu bằng = nirgends so ... wie', 22)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
INSERT INTO "decks" ("id", "title", "course", "level", "topic", "source", "language", "position") VALUES ('svff-l2-b12', 'Bài 12: Mặc dù không có nhiều thời gian, nhưng...', 'SVFF Complete Vietnamese Course, Level 02, Southern', 'A2', '', '', 'vi', 12) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cards" ("deck_id", "type", "front", "back_de", "back_en", "back_vi", "pos", "category", "example_vi", "example_de", "note", "position") VALUES
  ('svff-l2-b12', 'vocab', 'quan trọng', 'wichtig', 'important', '', '', '', '', '', '', 0),
  ('svff-l2-b12', 'vocab', 'tự mình', 'selbst, aus eigener Kraft', 'by oneself', '', '', '', '', '', '', 1),
  ('svff-l2-b12', 'vocab', 'bài viết', 'Text, Artikel', 'article, piece of writing', '', '', '', '', '', '', 2),
  ('svff-l2-b12', 'vocab', 'giảm giá', 'Rabatt, Preisnachlass', 'discount', '', '', '', '', '', '', 3),
  ('svff-l2-b12', 'vocab', 'vị trí', 'Lage, Position, Stelle', 'location, position', '', '', '', '', '', '', 4),
  ('svff-l2-b12', 'vocab', 'quê hương', 'Heimat', 'hometown', '', '', '', '', '', '', 5),
  ('svff-l2-b12', 'vocab', 'nhà cho thuê', 'Mietshaus, Haus zu vermieten', 'house for rent', '', '', '', '', '', '', 6),
  ('svff-l2-b12', 'vocab', 'sắc đẹp', 'Schönheit', 'beauty', '', '', '', '', '', '', 7),
  ('svff-l2-b12', 'vocab', 'tương xứng', 'angemessen, entsprechend', 'proportionate', '', '', '', '', '', '', 8),
  ('svff-l2-b12', 'vocab', 'đóng cửa', 'schliessen (Tür, Geschäft)', 'to close', '', '', '', '', '', '', 9),
  ('svff-l2-b12', 'vocab', 'phim kinh dị', 'Horrorfilm', 'horror film', '', '', '', '', '', '', 10),
  ('svff-l2-b12', 'sentence', 'Nhà tôi thì rộng, còn phòng ngủ tôi thì nhỏ.', 'Mein Haus ist geräumig, mein Schlafzimmer hingegen klein.', '', '', '', '', '', '', 'A thì ..., còn B thì ... = Gegenüberstellung', 11),
  ('svff-l2-b12', 'sentence', 'Anh trai em thích học, còn em thì thích đi chơi.', 'Mein älterer Bruder lernt gern, ich hingegen gehe lieber aus.', '', '', '', '', '', '', 'A thì ..., còn B thì ... = Gegenüberstellung', 12),
  ('svff-l2-b12', 'sentence', 'Chỗ thì mưa lũ, chỗ thì hạn hán.', 'An manchen Orten gibt es Überschwemmungen, an anderen Dürre.', '', '', '', '', '', '', 'N thì ..., N thì ... = die einen ..., die anderen', 13),
  ('svff-l2-b12', 'sentence', 'Ảnh lái xe càng lúc càng nhanh.', 'Er fährt immer schneller.', '', '', '', '', '', '', 'càng ... càng ... = immer mehr', 14),
  ('svff-l2-b12', 'sentence', 'Chị ấy học càng ngày càng giỏi.', 'Sie wird beim Lernen immer besser.', '', '', '', '', '', '', 'càng ... càng ... = immer mehr', 15),
  ('svff-l2-b12', 'sentence', 'Chúng ta không nên vừa ăn vừa coi điện thoại.', 'Wir sollten nicht gleichzeitig essen und aufs Handy schauen.', '', '', '', '', '', '', 'vừa ... vừa ... = gleichzeitig', 16),
  ('svff-l2-b12', 'sentence', 'Chị Ly vừa xinh đẹp vừa tốt bụng.', 'Ly ist hübsch und gutherzig zugleich.', '', '', '', '', '', '', 'vừa ... vừa ... = sowohl ... als auch', 17),
  ('svff-l2-b12', 'sentence', 'Mặc dù rất buồn ngủ nhưng anh Minh phải thức khuya để ôn bài.', 'Obwohl er sehr müde ist, muss Minh lange aufbleiben, um zu repetieren.', '', '', '', '', '', '', 'mặc dù ... nhưng ... = obwohl', 18),
  ('svff-l2-b12', 'sentence', 'Tuy bây giờ còn rất sớm nhưng chị My phải thức dậy để đi làm.', 'Obwohl es noch sehr früh ist, muss My aufstehen, um zur Arbeit zu gehen.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 19),
  ('svff-l2-b12', 'sentence', 'Gia đình họ tuy nghèo nhưng hạnh phúc.', 'Ihre Familie ist zwar arm, aber glücklich.', '', '', '', '', '', '', 'tuy ... nhưng ... = obwohl', 20),
  ('svff-l2-b12', 'sentence', 'Ngoài chả giò ra, tui còn thích ăn bánh xèo, bánh mì và phở nữa.', 'Ausser Chả giò esse ich auch gern Bánh xèo, Bánh mì und Phở.', '', '', '', '', '', '', 'ngoài ... ra = ausser ... (noch)', 21),
  ('svff-l2-b12', 'sentence', 'Cô Hoa đã đi du lịch nhiều nước ở châu Á như Hàn Quốc, Nhật Bản... Ngoài ra, cô còn đi du lịch ở châu Âu nữa.', 'Frau Hoa ist in viele Länder Asiens gereist, etwa Korea und Japan. Ausserdem war sie auch in Europa.', '', '', '', '', '', '', 'ngoài ra = ausserdem', 22),
  ('svff-l2-b12', 'sentence', 'Ảnh học tiếng Anh, tiếng Pháp. Ngoài ra, ảnh còn học tiếng Hàn Quốc.', 'Er lernt Englisch und Französisch. Ausserdem lernt er Koreanisch.', '', '', '', '', '', '', 'ngoài ra = ausserdem', 23),
  ('svff-l2-b12', 'sentence', 'Tôi thích tất cả các bạn trong lớp, trừ lớp trưởng.', 'Ich mag alle in der Klasse, ausser den Klassensprecher.', '', '', '', '', '', '', 'trừ = ausser', 24),
  ('svff-l2-b12', 'sentence', 'Tôi ăn được tất cả các món, trừ hải sản.', 'Ich kann alles essen, ausser Meeresfrüchte.', '', '', '', '', '', '', 'trừ = ausser', 25)
ON CONFLICT ("deck_id", "type", "front") DO NOTHING;
--> statement-breakpoint
-- Lernstand: alles in beide Richtungen, Grammatik nur VI→DE.
INSERT INTO "card_states" ("card_id", "direction")
SELECT c."id", d.dir FROM "cards" c
CROSS JOIN (VALUES ('vi_de'), ('de_vi')) AS d(dir)
WHERE c."deck_id" LIKE 'svff-l2-b%' AND (d.dir = 'vi_de' OR c."type" <> 'grammar')
ON CONFLICT DO NOTHING;

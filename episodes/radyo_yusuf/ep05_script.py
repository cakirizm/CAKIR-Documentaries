# ÇAKIR RADYO TİYATROSU — Hz. Yusuf: Bir Rüyanın İzinde — Bölüm 05: Birkaç Dirhem
# Ana kaynak: Yusuf Suresi 20. Rivayetler (İbn Kesîr, Taberî): ağabeylerin kuyuya dönüp kervanı bulması, Yusuf'u
# "kaçak kölemiz" diye satmaları, Yusuf'un sessiz kalması, fiyatın yirmi dirhem civarında olduğu ve kardeşler arasında paylaşıldığı.
# Rivayet olmayan dramatik ayrıntılar anlatıcı tarafından rivayet gibi sunulmaz.
EPISODE = {"no": 5, "title": "Birkaç Dirhem", "next": "Mısır Yolunda"}

INTRO = [("L", "ANLATICI", "Çakır Radyo Tiyatrosu sunar... [pause] Hazreti Yusuf... [pause] Bir Rüyanın İzinde. [pause] Beşinci Bölüm: Birkaç Dirhem.", {})]
OUTRO = [("L", "ANLATICI", "Çakır Radyo Tiyatrosu... [pause] Hazreti Yusuf, Bir Rüyanın İzinde. [pause] Beşinci bölümün sonu. [pause] Gelecek bölüm: Mısır Yolunda.", {})]

Y = {"pan": -0.18}
M_ = {"pan": 0.2}
S_ = {"pan": -0.3}
BU = {"pan": 0.4}
LAVI = {"pan": -0.35}
RUBIL = {"pan": 0.3}
SEMUN = {"pan": 0.05}
YAHUDA = {"pan": 0.45}

SCRIPT = [
    # ---------------------------------------------------------------- SAHNE 1 — Boş kuyu
    ("SCENE", "s1", {"amb": ["morning_birds", "open_field"], "room": "outdoor", "title": "Boş Kuyu"}),
    ("P", 1.5),
    ("L", "ANLATICI", "[calm, tense] Şafak sökerken Yahuda yine kuyunun başındaydı. Elinde bir parça ekmek, bir kap su vardı.", {}),
    ("FXW", "steps_dirt", -27, {"pan": 0.3}),
    ("L", "KARDES_D", "[whispering down the well] Yusuf? [pause] Yusuf, benim. Ekmek getirdim.", YAHUDA),
    ("P", 2.2),
    ("L", "KARDES_D", "[louder, worried] Yusuf! [pause] Cevap ver!", YAHUDA),
    ("P", 2.0),
    ("FX", "stone_click", -26, {"pan": 0.4}),
    ("L", "KARDES_D", "[alarmed, to himself] Ayak izleri... deve izleri. Burada bir kervan durmuş!", YAHUDA),
    ("FXW", "run_two", -25, {"pan": -0.2}),
    ("P", 1.0),

    # ---------------------------------------------------------------- SAHNE 2 — Ağabeylerin telaşı
    ("SCENE", "s2", {"amb": ["morning_birds", "sheep_far"], "room": "outdoor", "title": "Telaş"}),
    ("L", "KARDES_D", "[out of breath] Kalkın! Kuyu boş! [pause] Yusuf yok!", YAHUDA),
    ("L", "KARDES_B", "[relieved and frightened at once] Yaşıyor mu? Biri onu çıkarmış mı?", RUBIL),
    ("L", "KARDES_D", "[breathless] Bir kervan geçmiş. İzler güneye gidiyor. Daha uzaklaşmamışlardır.", YAHUDA),
    ("L", "KARDES_C", "[sharp, getting up] Güneye mi? [pause] Mısır yoluna.", SEMUN),
    ("L", "KARDES_A", "[nervous] Ya Yusuf her şeyi anlatırsa? Ya babamıza haber giderse?", LAVI),
    ("P", 1.4),
    ("L", "KARDES_C", "[cold, quick decision] Anlatmayacak. [pause] Çünkü onu biz satacağız.", SEMUN),
    ("L", "KARDES_B", "[shocked] Satmak mı? Şem'un, o bizim kardeşimiz!", RUBIL),
    ("L", "KARDES_C", "[hard] Dün de kardeşimizdi, Rubil. [pause] Yürüyün.", SEMUN),
    ("FXW", "steps_heavy", -25, {"pan": 0.0}),
    ("P", 1.0),

    # ---------------------------------------------------------------- SAHNE 3 — Kervanın yanında
    ("SCENE", "s3", {"amb": ["open_field", "caravan"], "room": "outdoor", "title": "Kaçak Köle"}),
    ("L", "ANLATICI", "[calm] Kervan yükünü yeni bağlamıştı ki on adam kumların arasından çıkageldi.", {}),
    ("FXW", "steps_heavy", -25, {"pan": -0.3}),
    ("L", "BUSRA", "[wary] Efendim... yanımıza adamlar geliyor.", BU),
    ("L", "MALIK", "[guarded] Selam size. Yolcu musunuz, tüccar mı?", M_),
    ("L", "KARDES_C", "[measured, cold] Ne yolcuyuz ne tüccar. [pause] Sizin yanınızdaki o çocuk... bizim kölemiz. Bizden kaçtı.", SEMUN),
    ("P", 1.8),
    ("L", "SUCU", "[whispering, to Yusuf] Yusuf... bu adamlar doğru mu söylüyor?", S_),
    ("P", 2.0),
    ("L", "ANLATICI", "[low] Rivayetlere göre Yusuf o an tek bir kelime etmedi. [pause] Bazı müfessirler, ağabeylerinin onu bir işaretle tehdit ettiğini anlatır.", {}),
    ("P", 1.4),
    ("L", "MALIK", "[skeptical] Köle mi? [pause] Konuşması bir köleninki gibi değil. Elleri de iş görmüş eller değil.", M_),
    ("L", "KARDES_A", "[quick, lying] Babamızın evinde şımartıldı da ondan. İşten kaçar, yalan söyler!", LAVI),
    ("L", "MALIK", "[sharp look] Peki neden bir kuyunun dibindeydi?", M_),
    ("P", 1.6),
    ("L", "KARDES_C", "[without blinking] Saklanmıştı. [pause] Kaçaklar böyle yapar.", SEMUN),
    ("P", 1.6),
    ("L", "MALIK", "[calculating, slow] Hmm. [pause] Ne istiyorsunuz?", M_),

    # ---------------------------------------------------------------- SAHNE 4 — Pazarlık (20)
    ("SCENE", "s4", {"amb": ["open_field", "caravan"], "room": "outdoor", "title": "Pazarlık"}),
    ("L", "KARDES_C", "[flat] Onu sana satarız. Bizim işimize yaramaz zaten.", SEMUN),
    ("L", "MALIK", "[testing them, low offer] Kaçak bir köle... sorun çıkaran bir mal. [pause] Birkaç dirhem veririm.", M_),
    ("P", 1.6),
    ("L", "KARDES_A", "[too quickly] Tamam.", LAVI),
    ("L", "MALIK", "[surprised] Pazarlık bile etmiyor musunuz?", M_),
    ("L", "KARDES_C", "[cold] Etmiyoruz.", SEMUN),
    ("P", 1.4),
    ("L", "ANLATICI", "[grave] Kur'an şöyle der: Onu düşük bir fiyata, sayılı birkaç dirheme sattılar. Zaten ona değer vermiyorlardı.", {}),
    ("BEAT",),
    ("P", 1.0),
    ("L", "ANLATICI", "[calm] Rivayetlere göre bu bedel yirmi dirhem kadardı.", {}),
    ("FX", "coins", -26, {"pan": 0.2}),
    ("P", 1.0),
    ("L", "MALIK", "[counting] On sekiz... on dokuz... yirmi. [pause] Al. Bir daha da kervanımın önüne çıkmayın.", M_),
    ("L", "KARDES_C", "[taking it, short] Çıkmayız.", SEMUN),
    ("P", 2.0),
    ("L", "KARDES_B", "[quietly, almost to himself] Yirmi dirhem... [pause] Babamın bir gülüşü bundan değerliydi.", RUBIL),
    ("P", 1.5),

    # ---------------------------------------------------------------- SAHNE 5 — Veda
    ("SCENE", "s5", {"amb": ["open_field", "caravan"], "room": "outdoor", "title": "Veda"}),
    ("L", "ANLATICI", "[gentle] Kervan yola çıkmadan önce Yusuf, ağabeylerine son bir kez baktı.", {}),
    ("P", 1.0),
    ("L", "YUSUF", "[calm, no anger] Ağabeylerim.", Y),
    ("P", 1.4),
    ("L", "KARDES_A", "[nervous, harsh] Ne var?", LAVI),
    ("L", "YUSUF", "[gentle, steady] Siz beni korumadınız. [pause] Ama Allah sizi korusun.", Y),
    ("BEAT",),
    ("P", 2.4),
    ("L", "KARDES_D", "[barely audible] Yusuf...", YAHUDA),
    ("L", "YUSUF", "[soft] Babama... [pause] sabretmesini söyleyin. Bir gün döneceğim.", Y),
    ("P", 2.0),
    ("L", "KARDES_C", "[turning away, rough] Yürü artık.", SEMUN),
    ("FX", "camel_bells", -26, {"pan": 0.0}),
    ("L", "MALIK", "[calling] Kervan, yola!", M_),
    ("FXW", "steps_away", -27, {"pan": 0.3}),
    ("P", 2.0),

    # ---------------------------------------------------------------- SAHNE 6 — Yirmi dirhem
    ("SCENE", "s6", {"amb": ["evening_wind", "sheep_far"], "room": "outdoor", "title": "Yirmi Dirhem"}),
    ("L", "ANLATICI", "[low] Kervanın çanları uzaklaştıkça, ağabeyler kumların üstünde öylece kaldı.", {}),
    ("FX", "coins", -27, {"pan": 0.05}),
    ("L", "KARDES_C", "[distributing, flat] Herkese ikişer dirhem.", SEMUN),
    ("L", "ANLATICI", "[calm] Rivayete göre o para, kardeşler arasında ikişer dirhem olarak paylaşıldı.", {}),
    ("P", 1.2),
    ("L", "KARDES_A", "[uneasy laugh] İki dirhem... [pause] Bir koyunun fiyatı bile değil.", LAVI),
    ("L", "KARDES_B", "[bitter] Sen de koyun mu sattığını sanıyordun, Lavi?", RUBIL),
    ("P", 1.6),
    ("L", "KARDES_D", "[quiet, firm] Ben bu parayı harcamayacağım.", YAHUDA),
    ("L", "KARDES_C", "[cold] Ne yaparsan yap. Ama ağzından tek söz çıkmayacak.", SEMUN),
    ("P", 2.0),
    ("L", "KARDES_D", "[very quiet] Söz çıkmaz, Şem'un. [pause] Ama bu sessizlik... bir gün hepimizi konuşturacak.", YAHUDA),
    ("P", 2.0),

    # ---------------------------------------------------------------- SAHNE 7 — Kervanda ilk akşam
    ("SCENE", "s7", {"amb": ["night_wind", "crickets", "caravan_night"], "room": "outdoor", "title": "Kervanda İlk Akşam"}),
    ("FX", "fire_pop", -30, {"pan": 0.2}),
    ("L", "MALIK", "[low, curious] Sabah gelen adamlar... [pause] Senin kardeşlerindi, değil mi?", M_),
    ("P", 2.4),
    ("L", "YUSUF", "[quiet] Neden öyle düşündün, efendim?", Y),
    ("L", "MALIK", "[thoughtful] Biri hiç yüzüne bakamadı. Bir diğeri parayı tutarken elleri titriyordu. [pause] Yabancılar böyle yapmaz.", M_),
    ("P", 2.0),
    ("L", "YUSUF", "[gentle, closing the subject] Rabbim onları bilir, ben de onları bilirim. [pause] Bu kadarı yeter.", Y),
    ("P", 1.6),
    ("L", "MALIK", "[half-respectful, gruff] Yirmi dirheme aldığım bir çocuk... bana bir hükümdar gibi cevap veriyor.", M_),
    ("P", 1.4),
    ("L", "SUCU", "[cheerful, softly] Efendim, belki Mısır'da yirmi dirhemden çok daha fazlasına değer.", S_),
    ("L", "MALIK", "[laughs low] Göreceğiz, sucu. [pause] Göreceğiz.", M_),
    ("P", 2.0),
    ("L", "ANLATICI", "[low] Kimse bilmiyordu: Birkaç dirheme satılan bu çocuk, bir gün koca bir ülkenin hazinelerini yönetecekti.", {}),
    ("BEAT",),
    ("P", 2.0),
]

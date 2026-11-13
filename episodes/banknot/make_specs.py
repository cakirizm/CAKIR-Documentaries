#!/usr/bin/env python3
"""TEK BİR BANKNOT — episode specs 2–9 (lines + visuals + sfx + music).
Writes episodes/banknot/epN.json. Line tuple: (scene, role, tts_text, subtitle, gap)."""
import json
from pathlib import Path

D = Path(__file__).parent
W = "[whispers] "


def photo(src, grade="doc", zoom=(1.06, 1.2), x=(0, 0), y=(0, 0), **kw):
    return {"type": "photo", "src": src, "grade": grade, "zoom": list(zoom), "x": list(x), "y": list(y), **kw}


def drawn(name, zoom=(1.0, 1.08), **kw):
    return {"type": "drawn", "name": name, "zoom": list(zoom), **kw}


BLACK = {"type": "black"}


def end_scene(n, title):
    return {"bg": BLACK, "layers": [
        {"k": "note", "w": 560, "y": -300},
        {"k": "small", "text": "TEK BİR BANKNOT", "top": 920, "at": 0.2},
        {"k": "kicker", "text": f"BÖLÜM {n}\n{title}", "top": 980, "size": 84, "at": 1.0},
        {"k": "small", "text": "Banknotun yolculuğu kurgudur · Hikâye gerçektir", "top": 1250, "size": 24, "color": "white", "at": 1.8},
    ]}


EPS = {}

# ---------------------------------------------------------------- 2
EPS[2] = dict(title="158 Yıl", music=[["Lightless_Dawn.mp3", "hook"], ["Dark_Times.mp3", "weekend"], ["Lightless_Dawn.mp3", "twist"]], lines=[
    ("hook", "N", W + "Yüz elli sekiz yıl ayakta kalan bir banka... [pause] tek bir hafta sonunda çöktü. Ben oradaydım.", "158 yıl ayakta kalan bir banka… tek bir hafta sonunda çöktü. Ben oradaydım.", 0.6),
    ("history", "N", "Lehman Brothers. Bin sekiz yüz ellide, Alabama'da küçük bir dükkân olarak kuruldu.", "Lehman Brothers. 1850'de Alabama'da küçük bir dükkân olarak kuruldu.", 0.25),
    ("survive", "N", "İç Savaş'ı, Büyük Buhran'ı, iki dünya savaşını atlattı.", "İç Savaş'ı, Büyük Buhran'ı, iki dünya savaşını atlattı.", 0.3),
    ("peak", "N", "İki bin sekizde Amerika'nın en büyük yatırım bankalarından biriydi. Yaklaşık yirmi beş bin çalışan.", "2008'de Amerika'nın en büyük yatırım bankalarından biriydi. Yaklaşık 25 bin çalışan.", 0.3),
    ("bomb", "N", "[serious] Ama kasasında saatli bir bomba vardı: Geri ödenemeyen konut kredilerine bağlı milyarlarca dolarlık yatırım.", "Ama kasasında saatli bir bomba vardı: geri ödenemeyen konut kredilerine bağlı milyarlarca dolarlık yatırım.", 0.4),
    ("weekend", "N", "Eylül iki bin sekiz. Bütün hafta sonu kurtarma görüşmeleri. Alıcı yok. Devlet kurtarmayı reddediyor.", "Eylül 2008. Bütün hafta sonu kurtarma görüşmeleri. Alıcı yok. Devlet kurtarmayı reddediyor.", 0.35),
    ("news", "A", "[urgent] Son dakika! Lehman Brothers iflas başvurusu yaptı. Bu, Amerikan tarihinin en büyük iflası!", "“Son dakika! Lehman Brothers iflas başvurusu yaptı. Amerikan tarihinin en büyük iflası!”", 0.4),
    ("number", "N", "Altı yüz milyar doları aşan varlıklar. Tek bir gecede.", "600 milyar doları aşan varlıklar. Tek bir gecede.", 0.35),
    ("boxes", "N", "O pazartesi sabahı çalışanlar masalarını karton kutulara doldurup binadan çıkıyordu.", "O pazartesi sabahı çalışanlar masalarını karton kutulara doldurup binadan çıkıyordu.", 0.3),
    ("world", "N", "Dünya borsaları çakıldı. Milyonlarca insan işini, evini kaybetti.", "Dünya borsaları çakıldı. Milyonlarca insan işini, evini kaybetti.", 0.4),
    ("me", "N", "Beni taşıyan adam da o kutulardan birini taşıyordu. Cebinde ben... elinde koca bir kariyer.", "Beni taşıyan adam da o kutulardan birini taşıyordu. Cebinde ben… elinde koca bir kariyer.", 0.5),
    ("twist", "N", "Birkaç hafta sonra, internette kimsenin tanımadığı biri dokuz sayfalık bir yazı yayınladı. Konusu: Bankasız para.", "Birkaç hafta sonra, kimsenin tanımadığı biri 9 sayfalık bir yazı yayınladı. Konusu: bankasız para.", 0.5),
    ("next", "N", W + "Benim gibi kâğıt paraların bir rakibi doğmuştu. [pause] Ve iki yıl sonra biri onunla ilk kez yemek alacaktı.", "Benim gibi kâğıt paraların bir rakibi doğmuştu. Ve iki yıl sonra biri onunla ilk kez yemek alacaktı.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm üç: En pahalı pizza.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("tower"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 2", "top": 300, "at": 0.4}, {"k": "kicker", "text": "158 YIL", "top": 350, "size": 130, "color": "gold", "at": 1.0}]},
    "history": {"bg": photo("lehman_ts.jpg", "cold", (1.1, 1.25), (20, -20)), "layers": [{"k": "kicker", "text": "LEHMAN\nBROTHERS", "top": 300, "size": 96}, {"k": "small", "text": "KURULUŞ: 1850 · ALABAMA", "top": 520, "at": 0.9}]},
    "survive": {"bg": BLACK, "layers": [{"k": "chips", "items": ["İÇ SAVAŞ", "BÜYÜK BUHRAN", "İKİ DÜNYA SAVAŞI"], "top": 600, "step": 0.75}, {"k": "stamp", "text": "AYAKTA", "top": 1100, "color": "gold", "at": 2.6, "size": 80}]},
    "peak": {"bg": photo("wallst.jpg", "cold", (1.08, 1.22)), "layers": [{"k": "counter", "from": 0, "to": 25000, "prefix": "~", "label": "ÇALIŞAN", "top": 700, "at": 1.4, "dur": 2.0, "color": "white"}]},
    "bomb": {"bg": drawn("crash", (1.0, 1.06)), "layers": [{"k": "small", "text": "KONUT KREDİSİ BAĞLANTILI YATIRIMLAR", "top": 300, "color": "red", "at": 2.0}]},
    "weekend": {"bg": photo("nyfed.jpg", "night", (1.1, 1.3), (0, 0), (20, -20)), "layers": [{"k": "date", "d": "13–14", "m": "EYLÜL", "y": "2008", "top": 520}, {"k": "stamp", "text": "ALICI YOK", "top": 1080, "at": 2.6, "size": 80}, {"k": "tag", "text": "NEW YORK FED"}]},
    "news": {"bg": photo("lehman_0915.jpg", "doc", (1.05, 1.18)), "layers": [{"k": "flash"}, {"k": "ticker", "text": "LEHMAN BROTHERS İFLAS BAŞVURUSU YAPTI · ABD TARİHİNİN EN BÜYÜK İFLASI", "top": 1220}, {"k": "small", "text": "15 EYLÜL 2008 · LEHMAN GENEL MERKEZİ", "top": 300, "color": "white", "at": 0.3}]},
    "number": {"bg": BLACK, "layers": [{"k": "counter", "from": 0, "to": 600000000000, "suffix": "+", "top": 700, "size": 86, "at": 0.3, "dur": 2.4}, {"k": "small", "text": "VARLIK · TEK GECEDE", "top": 860, "color": "white", "at": 2.4}]},
    "boxes": {"bg": drawn("boxes"), "layers": [{"k": "small", "text": "PAZARTESİ SABAHI", "top": 300, "color": "white"}]},
    "world": {"bg": photo("nyse.jpg", "bw", (1.12, 1.3)), "layers": [{"k": "stamp", "text": "ÇÖKÜŞ", "top": 720, "at": 0.6}, {"k": "tag", "text": "ARŞİV · TEMSİLÎ"}]},
    "me": {"bg": BLACK, "layers": [{"k": "note", "motion": "dark", "y": -80}]},
    "twist": {"bg": photo("whitepaper.jpg", "doc", (1.3, 1.6), (0, 0), (60, 0), pos="50% 10%"), "layers": [{"k": "stamp", "text": "BANKASIZ PARA", "top": 1060, "color": "gold", "at": 3.4, "size": 76}, {"k": "small", "text": "31 EKİM 2008 · 9 SAYFA", "top": 300, "color": "white", "at": 0.8}]},
    "next": {"bg": photo("btc_coin.png", "doc", (1.0, 1.15), fit="contain", blurFill=True), "layers": []},
    "end": end_scene(3, "EN PAHALI PİZZA"),
}, sfx=[["hook", 0, "boom", -20], ["hook", 0.1, "paper", -26], ["history", -0.3, "whoosh", -27], ["survive", 2.6, "stamp", -20], ["peak", -0.3, "whoosh", -28], ["bomb", 0.2, "heartbeat", -24], ["weekend", 2.6, "stamp", -20], ["news", -0.1, "static", -24], ["news", 0, "boom", -18], ["number", 0.3, "coins", -28], ["boxes", -0.3, "whoosh", -27], ["world", 0.6, "stamp", -19], ["world", 0.0, "siren", -32], ["me", 0, "boom", -20], ["twist", 0.6, "typing", -26], ["twist", 3.4, "stamp", -22], ["next", 0.2, "riser", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 3
EPS[3] = dict(title="En Pahalı Pizza", music=[["Lightless_Dawn.mp3", "hook"], ["Rising.mp3", "deal"], ["Dark_Times.mp3", "me"]], lines=[
    ("hook", "N", W + "Tarihin en pahalı yemeği... [pause] iki pizzaydı.", "Tarihin en pahalı yemeği… iki pizzaydı.", 0.6),
    ("date", "N", "Mayıs iki bin on. Florida, Jacksonville. Laszlo Hanyecz adında bir programcı.", "Mayıs 2010. Florida, Jacksonville. Laszlo Hanyecz adında bir programcı.", 0.3),
    ("forum", "N", "Bir internet forumuna şu mesajı yazıyor:", "Bir internet forumuna şu mesajı yazıyor:", 0.3),
    ("forum", "Q", "On bin bitcoin ödeyeceğim, birkaç pizza için. Belki iki büyük boy... ertesi güne de kalsın.", "“On bin bitcoin ödeyeceğim, birkaç pizza için. Belki iki büyük boy… ertesi güne de kalsın.”", 0.5),
    ("wait", "N", "Günler geçiyor. Kimse ciddiye almıyor. Bitcoin o zaman neredeyse değersiz.", "Günler geçiyor. Kimse ciddiye almıyor. Bitcoin o zaman neredeyse değersiz.", 0.3),
    ("deal", "N", "Sonra on dokuz yaşında bir genç teklifi kabul ediyor. İki pizza sipariş ediyor, parasını kendisi ödüyor.", "Sonra 19 yaşında bir genç teklifi kabul ediyor. İki pizza sipariş ediyor, parasını kendisi ödüyor.", 0.3),
    ("value", "N", "O gün on bin bitcoinin değeri... yaklaşık kırk bir dolar.", "O gün 10.000 bitcoinin değeri… yaklaşık 41 dolar.", 0.4),
    ("first", "N", "Yirmi iki Mayıs. Bitcoin'le yapılan ilk gerçek alışveriş. Bugün bu gün, Bitcoin Pizza Günü olarak kutlanıyor.", "22 Mayıs. Bitcoin'le yapılan ilk gerçek alışveriş. Bugün bu gün Bitcoin Pizza Günü olarak kutlanıyor.", 0.4),
    ("today", "N", "[serious] Peki bugün? O on bin bitcoin... yüz milyonlarca dolar ediyor.", "Peki bugün? O 10.000 bitcoin… yüz milyonlarca dolar ediyor.", 0.5),
    ("me", "N", "Ben o gece o pizzacının kasasındaydım. Ama ilk kez para... ben olmadan el değiştirdi.", "Ben o gece o pizzacının kasasındaydım. Ama ilk kez para… ben olmadan el değiştirdi.", 0.5),
    ("next", "N", W + "Peki bu parayı icat eden kişi kim? [pause] Bugün bile kimse bilmiyor.", "Peki bu parayı icat eden kişi kim? Bugün bile kimse bilmiyor.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm dört: Hayalet.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("pizza"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 3", "top": 300, "at": 0.4}, {"k": "kicker", "text": "EN PAHALI\nPİZZA", "top": 350, "size": 110, "color": "gold", "at": 1.2}]},
    "date": {"bg": drawn("desk"), "layers": [{"k": "date", "d": "18", "m": "MAYIS", "y": "2010", "top": 360}, {"k": "small", "text": "JACKSONVILLE · FLORIDA", "top": 830, "color": "white", "at": 1.6}]},
    "forum": {"bg": drawn("desk", (1.12, 1.2)), "layers": [{"k": "doc", "dark": True, "mono": True, "size": 34, "top": 520, "at": 2.3, "type": 3.0, "lines": ["Pizza for bitcoins?", "", "I'll pay 10,000 bitcoins for a", "couple of pizzas.. like maybe", "2 large ones so I have some", "left over for the next day."], "hl": "10,000 bitcoins", "hlAt": 4.5}, {"k": "small", "text": "BITCOINTALK FORUMU · 18 MAYIS 2010", "top": 400, "color": "white", "at": 0.5}]},
    "wait": {"bg": drawn("desk", (1.2, 1.25)), "layers": [{"k": "chips", "items": ["1. GÜN · CEVAP YOK", "2. GÜN · CEVAP YOK", "3. GÜN · CEVAP YOK"], "top": 560, "step": 0.9, "color": "red"}]},
    "deal": {"bg": photo("pizza_boxes.jpg", "warm", (1.1, 1.3)), "layers": [{"k": "tag"}, {"k": "kicker", "text": "19 YAŞINDA\nBİR GENÇ", "top": 330, "size": 88, "at": 0.8}]},
    "value": {"bg": BLACK, "layers": [{"k": "small", "text": "10.000 BITCOIN =", "top": 640, "color": "white", "at": 0.2}, {"k": "counter", "from": 0, "to": 41, "top": 700, "size": 200, "at": 1.4, "dur": 1.6}]},
    "first": {"bg": drawn("pizza", (1.15, 1.25)), "layers": [{"k": "date", "d": "22", "m": "MAYIS", "y": "2010", "top": 380}, {"k": "stamp", "text": "BITCOIN\nPIZZA GÜNÜ", "top": 900, "color": "gold", "at": 2.8, "size": 72}]},
    "today": {"bg": photo("btc_coin.png", "doc", (1.0, 1.3), fit="contain", blurFill=True), "layers": [{"k": "stamp", "text": "YÜZ MİLYONLARCA $", "top": 1080, "color": "gold", "at": 2.4, "size": 70, "rot": -4}]},
    "me": {"bg": BLACK, "layers": [{"k": "note", "motion": "dark"}]},
    "next": {"bg": drawn("ghost"), "layers": [{"k": "kicker", "text": "?", "top": 600, "size": 260, "color": "gold", "at": 2.4}]},
    "end": end_scene(4, "HAYALET"),
}, sfx=[["hook", 0, "boom", -20], ["date", -0.3, "whoosh", -27], ["forum", 2.3, "typing", -24], ["wait", 0.2, "clock", -26], ["deal", 0.2, "phone", -26], ["value", 1.4, "coins", -26], ["first", 2.8, "stamp", -21], ["today", 0.2, "riser", -24], ["today", 2.4, "boom", -19], ["me", 0, "paper", -26], ["next", 0.2, "glitch", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 4
EPS[4] = dict(title="Hayalet", music=[["Lightless_Dawn.mp3", "hook"], ["Hiding_Your_Reality.mp3", "genesis"], ["Dark_Times.mp3", "gone"]], lines=[
    ("hook", "N", W + "Dünyanın en zengin insanlarından biri olabilir. [pause] Ama kimse yüzünü görmedi.", "Dünyanın en zengin insanlarından biri olabilir. Ama kimse yüzünü görmedi.", 0.6),
    ("name", "N", "Satoshi Nakamoto. Bitcoin'in yaratıcısı. Gerçek bir isim mi, takma ad mı? Bir kişi mi, bir grup mu? Bilinmiyor.", "Satoshi Nakamoto. Bitcoin'in yaratıcısı. Gerçek isim mi, takma ad mı? Bir kişi mi, bir grup mu? Bilinmiyor.", 0.35),
    ("genesis", "N", "Üç Ocak iki bin dokuz. Bitcoin'in ilk bloğu oluşturuluyor. İçine bir gazete manşeti gizlenmiş:", "3 Ocak 2009. Bitcoin'in ilk bloğu oluşturuluyor. İçine bir gazete manşeti gizlenmiş:", 0.3),
    ("headline", "N", "Maliye Bakanı, bankalar için ikinci kurtarma paketinin eşiğinde.", "“Maliye Bakanı, bankalar için ikinci kurtarma paketinin eşiğinde.”", 0.4),
    ("meaning", "N", "Bir imza gibi. Bir mesaj gibi.", "Bir imza gibi. Bir mesaj gibi.", 0.35),
    ("coins", "N", "Tahminlere göre ilk yıllarda yaklaşık bir milyon bitcoin kazandı. Bilindiği kadarıyla... hiçbirini harcamadı.", "Tahminlere göre ilk yıllarda yaklaşık 1 milyon bitcoin kazandı. Bilindiği kadarıyla… hiçbirini harcamadı.", 0.4),
    ("leave", "N", "Nisan iki bin on bir. Bir geliştiriciye son mesajlarından birini yazıyor:", "Nisan 2011. Bir geliştiriciye son mesajlarından birini yazıyor:", 0.3),
    ("leave", "Q", W + "Başka işlere geçtim. Proje emin ellerde.", "“Başka işlere geçtim. Proje emin ellerde.”", 0.5),
    ("gone", "N", "Ve sonra... sessizlik. Bir daha ortaya çıkmadı.", "Ve sonra… sessizlik. Bir daha ortaya çıkmadı.", 0.4),
    ("claims", "N", "Yıllar içinde birçok kişi 'Satoshi benim' dedi. Biri mahkemeye bile gitti.", "Yıllar içinde birçok kişi “Satoshi benim” dedi. Biri mahkemeye bile gitti.", 0.3),
    ("ruling", "N", "İki bin yirmi dörtte Londra'da bir yargıç kararını verdi: Bu adam, Satoshi değil.", "2024'te Londra'da bir yargıç kararını verdi: Bu adam Satoshi değil.", 0.4),
    ("statue", "N", "Bugün Budapeşte'de onun bir heykeli var. Yüzü... bir ayna.", "Bugün Budapeşte'de onun bir heykeli var. Yüzü… bir ayna.", 0.4),
    ("me", "N", "Ben mi? Okyanusu geçtim. Galler'de bir adamın cüzdanına girdim. O adamın da bir sırrı vardı: eski bir sabit disk.", "Ben mi? Okyanusu geçtim. Galler'de bir adamın cüzdanına girdim. O adamın da bir sırrı vardı: eski bir sabit disk.", 0.5),
    ("next", "N", W + "Ve o disk... [pause] çöpe gitmek üzereydi.", "Ve o disk… çöpe gitmek üzereydi.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm beş: Çöplükteki servet.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("ghost"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 4", "top": 300, "at": 0.4}, {"k": "kicker", "text": "HAYALET", "top": 350, "size": 130, "color": "gold", "at": 1.2}]},
    "name": {"bg": drawn("ghost", (1.1, 1.2)), "layers": [{"k": "kicker", "text": "SATOSHI\nNAKAMOTO", "top": 330, "size": 100}, {"k": "chips", "items": ["GERÇEK İSİM?", "TAKMA AD?", "BİR GRUP?"], "top": 1060, "step": 0.7, "at": 2.6, "size": 40}]},
    "genesis": {"bg": drawn("desk"), "layers": [{"k": "date", "d": "3", "m": "OCAK", "y": "2009", "top": 360}, {"k": "small", "text": "İLK BLOK · “GENESIS”", "top": 830, "color": "white", "at": 1.6}]},
    "headline": {"bg": BLACK, "layers": [{"k": "headline", "paper": "THE TIMES · 3 OCAK 2009", "text": "Chancellor on brink of second bailout for banks", "sub": "Maliye Bakanı, bankalar için ikinci kurtarma paketinin eşiğinde", "top": 600}]},
    "meaning": {"bg": drawn("ghost", (1.2, 1.3)), "layers": [{"k": "stamp", "text": "MESAJ", "top": 760, "color": "gold", "at": 1.0}]},
    "coins": {"bg": photo("btc_coin.png", "doc", (1.0, 1.25), fit="contain", blurFill=True), "layers": [{"k": "counter", "from": 0, "to": 1000000, "prefix": "~", "suffix": " BTC", "top": 1060, "size": 96, "at": 1.4}, {"k": "stamp", "text": "HİÇ HARCANMADI", "top": 1240, "at": 4.2, "size": 64, "color": "red"}]},
    "leave": {"bg": drawn("desk", (1.15, 1.22)), "layers": [{"k": "doc", "dark": True, "mono": True, "size": 36, "top": 560, "at": 2.6, "type": 2.2, "lines": ["From: Satoshi", "Nisan 2011", "", "I've moved on to other things.", "It's in good hands..."]}]},
    "gone": {"bg": BLACK, "layers": [{"k": "kicker", "text": "SESSİZLİK", "top": 820, "size": 90, "color": "#777", "at": 1.0}]},
    "claims": {"bg": drawn("court"), "layers": [{"k": "chips", "items": ["“SATOSHİ BENİM”", "“HAYIR, BENİM”", "“ASIL BENİM”"], "top": 360, "step": 0.6, "size": 42}]},
    "ruling": {"bg": drawn("court", (1.12, 1.2)), "layers": [{"k": "small", "text": "İNGİLTERE YÜKSEK MAHKEMESİ · 2024", "top": 300, "color": "white"}, {"k": "stamp", "text": "SATOSHİ DEĞİL", "top": 600, "at": 3.4}]},
    "statue": {"bg": photo("satoshi_bust.jpg", "doc", (1.1, 1.3), pos="50% 35%"), "layers": [{"k": "small", "text": "BUDAPEŞTE", "top": 300, "color": "white"}]},
    "me": {"bg": photo("newport.jpg", "cold", (1.1, 1.25), (20, -20)), "layers": [{"k": "small", "text": "NEWPORT · GALLER", "top": 300, "color": "white", "at": 2.0}, {"k": "note", "motion": "slide", "at": 0, "y": 200, "w": 420}]},
    "next": {"bg": drawn("drawer"), "layers": []},
    "end": end_scene(5, "ÇÖPLÜKTEKİ\nSERVET"),
}, sfx=[["hook", 0, "glitch", -22], ["hook", 0.2, "boom", -20], ["name", 2.6, "whoosh", -28], ["genesis", 0.2, "typing", -27], ["headline", 0.1, "paper", -22], ["meaning", 1.0, "stamp", -21], ["coins", 1.4, "coins", -27], ["coins", 4.2, "stamp", -21], ["leave", 2.6, "typing", -25], ["gone", 0.0, "boom", -19], ["claims", 0.2, "whoosh", -27], ["ruling", 0.2, "gavel", -18], ["ruling", 3.4, "stamp", -20], ["statue", -0.3, "whoosh", -27], ["me", 0.2, "paper", -26], ["next", 0.2, "riser", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 5
EPS[5] = dict(title="Çöplükteki Servet", music=[["Lightless_Dawn.mp3", "hook"], ["Dark_Times.mp3", "realize"]], lines=[
    ("hook", "N", W + "Bir adam, yüz milyonlarca dolarlık serveti... [pause] çöpe attı.", "Bir adam, yüz milyonlarca dolarlık serveti… çöpe attı.", 0.6),
    ("who", "N", "James Howells. Galler, Newport. Bir bilişim mühendisi.", "James Howells. Galler, Newport. Bir bilişim mühendisi.", 0.3),
    ("mine", "N", "İki bin dokuz. Bitcoin henüz neredeyse değersizken, kendi bilgisayarında sekiz bin bitcoin üretiyor.", "2009. Bitcoin henüz neredeyse değersizken, kendi bilgisayarında 8.000 bitcoin üretiyor.", 0.3),
    ("drive", "N", "Sonra eski sabit diski bir çekmeceye kaldırıyor. Ve unutuyor.", "Sonra eski sabit diski bir çekmeceye kaldırıyor. Ve unutuyor.", 0.4),
    ("toss", "N", "İki bin on üç. Evde temizlik. Siyah bir çöp poşeti. Ve disk... poşetin içinde.", "2013. Evde temizlik. Siyah bir çöp poşeti. Ve disk… poşetin içinde.", 0.4),
    ("landfill", "N", "Poşet şehrin çöplüğüne gidiyor. Tonlarca atığın altına gömülüyor.", "Poşet şehrin çöplüğüne gidiyor. Tonlarca atığın altına gömülüyor.", 0.4),
    ("realize", "N", "[serious] Bitcoin yükseldikçe ne kaybettiğini anlıyor. Sekiz bin bitcoin. Bugün yüz milyonlarca dolar.", "Bitcoin yükseldikçe ne kaybettiğini anlıyor. 8.000 bitcoin. Bugün yüz milyonlarca dolar.", 0.4),
    ("offer", "N", "Belediyeye defalarca teklif götürüyor: Kazıyı ben finanse edeyim, bulursam bir payını şehre vereyim.", "Belediyeye defalarca teklif götürüyor: Kazıyı ben finanse edeyim, bulursam bir payını şehre vereyim.", 0.3),
    ("no", "N", "Belediyenin cevabı hep aynı: Hayır.", "Belediyenin cevabı hep aynı: Hayır.", 0.4),
    ("court", "N", "Dava mahkemeye gidiyor. Ocak iki bin yirmi beşte mahkeme davayı reddediyor. Mart'ta temyiz izni de reddediliyor.", "Dava mahkemeye gidiyor. Ocak 2025'te mahkeme davayı reddediyor. Mart'ta temyiz izni de reddediliyor.", 0.4),
    ("still", "N", "Disk hâlâ orada. Bir yerde, çöplerin altında.", "Disk hâlâ orada. Bir yerde, çöplerin altında.", 0.5),
    ("me", "N", "Ben mi? O gün o evdeki bir cüzdandaydım. Sonra bir havalimanından Asya'ya uçtum.", "Ben mi? O gün o evdeki bir cüzdandaydım. Sonra bir havalimanından Asya'ya uçtum.", 0.5),
    ("next", "N", W + "Gittiğim yerde birileri bir merkez bankasını soymak üzereydi. [pause] Hem de bilgisayarla.", "Gittiğim yerde birileri bir merkez bankasını soymak üzereydi. Hem de bilgisayarla.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm altı: Yazım hatası.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("landfill"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 5", "top": 300, "at": 0.4}, {"k": "kicker", "text": "ÇÖPLÜKTEKİ\nSERVET", "top": 350, "size": 104, "color": "gold", "at": 1.2}]},
    "who": {"bg": photo("newport.jpg", "cold", (1.1, 1.25), (-20, 20)), "layers": [{"k": "kicker", "text": "JAMES HOWELLS", "top": 320, "size": 84}, {"k": "small", "text": "NEWPORT · GALLER", "top": 430, "at": 0.9}]},
    "mine": {"bg": drawn("desk"), "layers": [{"k": "counter", "from": 0, "to": 8000, "prefix": "", "suffix": " BTC", "top": 330, "size": 120, "at": 1.6, "dur": 2.4}]},
    "drive": {"bg": photo("hdd.jpg", "warm", (1.15, 1.35)), "layers": [{"k": "tag"}]},
    "toss": {"bg": drawn("bag"), "layers": [{"k": "date", "d": "?", "m": "2013", "y": "TEMİZLİK", "top": 340}]},
    "landfill": {"bg": photo("landfill.jpg", "cold", (1.1, 1.3), (30, -30)), "layers": [{"k": "tag"}, {"k": "small", "text": "TONLARCA ATIK", "top": 300, "color": "white", "at": 1.6}]},
    "realize": {"bg": photo("btc_coin.png", "doc", (1.0, 1.25), fit="contain", blurFill=True), "layers": [{"k": "kicker", "text": "8.000 BTC", "top": 330, "size": 120, "color": "gold", "at": 2.0}, {"k": "stamp", "text": "YÜZ MİLYONLARCA $", "top": 1080, "at": 4.0, "size": 66, "color": "gold"}]},
    "offer": {"bg": drawn("landfill", (1.15, 1.25)), "layers": [{"k": "doc", "size": 38, "top": 520, "at": 1.0, "type": 3.0, "lines": ["TEKLİF", "", "• Kazı masrafı benden", "• Çevre güvenliği benden", "• Bulursam bir pay şehre"]}]},
    "no": {"bg": drawn("landfill", (1.25, 1.3)), "layers": [{"k": "stamp", "text": "RED", "top": 760, "at": 1.4, "size": 160}]},
    "court": {"bg": drawn("court"), "layers": [{"k": "chips", "items": ["OCAK 2025 · DAVA RED", "MART 2025 · TEMYİZ İZNİ RED"], "top": 300, "step": 2.6, "at": 2.0, "color": "red", "size": 42}]},
    "still": {"bg": drawn("landfill", (1.3, 1.45)), "layers": []},
    "me": {"bg": drawn("plane"), "layers": []},
    "next": {"bg": photo("bb_entrance.jpg", "night", (1.1, 1.3)), "layers": [{"k": "small", "text": "DAKKA · BANGLADEŞ", "top": 300, "color": "white", "at": 0.4}]},
    "end": end_scene(6, "YAZIM HATASI"),
}, sfx=[["hook", 0, "boom", -20], ["hook", 0.3, "gulls", -28], ["who", -0.3, "whoosh", -27], ["mine", 1.6, "coins", -27], ["drive", 0.1, "paper", -26], ["toss", 0.1, "trashbag", -22], ["landfill", 0.1, "truck", -26], ["realize", 0.1, "heartbeat", -23], ["realize", 4.0, "boom", -19], ["offer", 1.0, "typing", -27], ["no", 1.4, "stamp", -18], ["court", 0.1, "gavel", -18], ["court", 2.0, "stamp", -22], ["still", 0.1, "gulls", -30], ["me", 0.2, "jet", -24], ["next", 0.2, "riser", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 6
EPS[6] = dict(title="Yazım Hatası", music=[["Hiding_Your_Reality.mp3", "hook"], ["Dark_Times.mp3", "fed"]], lines=[
    ("hook", "N", W + "Neredeyse bir milyar dolarlık bir soygun... [pause] tek bir yazım hatası yüzünden durdu.", "Neredeyse bir milyar dolarlık soygun… tek bir yazım hatası yüzünden durdu.", 0.6),
    ("setup", "N", "Şubat iki bin on altı. Bangladeş Merkez Bankası. Bankanın dolar rezervleri New York'taki Federal Rezerv'de duruyor.", "Şubat 2016. Bangladeş Merkez Bankası. Bankanın dolar rezervleri New York'taki Federal Rezerv'de duruyor.", 0.3),
    ("hack", "N", "Bilgisayar korsanları bankanın sistemine sızıyor. Uluslararası para transfer ağı üzerinden talimatlar gönderiyorlar.", "Bilgisayar korsanları bankanın sistemine sızıyor. Uluslararası para transfer ağı üzerinden talimatlar gönderiyorlar.", 0.3),
    ("num", "N", "Otuz beş ödeme talimatı. Toplamı yaklaşık dokuz yüz elli bir milyon dolar.", "35 ödeme talimatı. Toplamı yaklaşık 951 milyon dolar.", 0.4),
    ("printer", "N", "O sabah bankanın, transferleri kâğıda döken yazıcısı çalışmıyordu. Kimse bir şey fark etmedi.", "O sabah bankanın, transferleri kâğıda döken yazıcısı çalışmıyordu. Kimse bir şey fark etmedi.", 0.4),
    ("fed", "N", "New York'ta talimatların çoğu durduruluyor. Ama dördü geçiyor. Seksen bir milyon dolar, Filipinler'e.", "New York'ta talimatların çoğu durduruluyor. Ama dördü geçiyor. 81 milyon dolar, Filipinler'e.", 0.4),
    ("typo", "N", "Bir transfer de Sri Lanka'ya gidiyordu. Yirmi milyon dolar. Alıcının adı şöyle yazılmıştı:", "Bir transfer de Sri Lanka'ya gidiyordu. 20 milyon dolar. Alıcının adı şöyle yazılmıştı:", 0.3),
    ("typo2", "N", "Foundation değil... [pause] Fandation. O harfi yerine, A harfi. Bu hata bankanın dikkatini çekti. Transfer durduruldu.", "“Foundation” değil… “Fandation”. O yerine A. Bu hata bankanın dikkatini çekti. Transfer durduruldu.", 0.4),
    ("casino", "N", "Filipinler'e giden paranın büyük kısmı kumarhanelerden geçirildi. Ve izi kayboldu.", "Filipinler'e giden paranın büyük kısmı kumarhanelerden geçirildi. Ve izi kayboldu.", 0.4),
    ("who", "N", "İki bin on sekizde ABD, saldırıyla Kuzey Kore bağlantılı bir hacker grubunu suçladı.", "2018'de ABD, saldırıyla Kuzey Kore bağlantılı bir hacker grubunu suçladı.", 0.4),
    ("me", "N", "Ben mi? Manila'da bir kumarhane masasında el değiştirdim. Yeni sahibim, sahneye çıkmaya hazırlanan bir kadındı.", "Ben mi? Manila'da bir kumarhane masasında el değiştirdim. Yeni sahibim, sahneye çıkmaya hazırlanan bir kadındı.", 0.5),
    ("next", "N", W + "Binlerce insan onu alkışlayacaktı. [pause] Sonra... ortadan kaybolacaktı.", "Binlerce insan onu alkışlayacaktı. Sonra… ortadan kaybolacaktı.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm yedi: Kripto Kraliçesi.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("hacker"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 6", "top": 300, "at": 0.4}, {"k": "kicker", "text": "YAZIM\nHATASI", "top": 350, "size": 120, "color": "gold", "at": 1.2}]},
    "setup": {"bg": photo("bb_entrance.jpg", "doc", (1.08, 1.22)), "layers": [{"k": "small", "text": "BANGLADEŞ MERKEZ BANKASI", "top": 300, "color": "white"}, {"k": "photo", "src": "nyfed.jpg", "w": 560, "h": 380, "top": 900, "at": 4.0, "caption": "Federal Rezerv · New York"}]},
    "hack": {"bg": drawn("hacker", (1.1, 1.2)), "layers": [{"k": "date", "d": "4", "m": "ŞUBAT", "y": "2016", "top": 330}]},
    "num": {"bg": BLACK, "layers": [{"k": "counter", "from": 0, "to": 35, "prefix": "", "label": "ÖDEME TALİMATI", "top": 520, "size": 170, "at": 0.3, "dur": 1.4, "color": "white"}, {"k": "counter", "from": 0, "to": 951000000, "top": 860, "size": 100, "at": 2.2, "dur": 2.0}]},
    "printer": {"bg": drawn("printer"), "layers": []},
    "fed": {"bg": photo("nyfed.jpg", "night", (1.1, 1.3), (0, 0), (30, -30)), "layers": [{"k": "stamp", "text": "DURDURULDU", "top": 600, "at": 1.4, "size": 80}, {"k": "counter", "from": 0, "to": 81000000, "top": 980, "size": 104, "at": 3.4, "label": "→ FİLİPİNLER", "color": "red"}]},
    "typo": {"bg": drawn("hacker", (1.2, 1.3)), "layers": [{"k": "small", "text": "→ SRİ LANKA · 20.000.000 $", "top": 330, "color": "white"}, {"k": "doc", "mono": True, "size": 40, "top": 640, "at": 2.6, "type": 1.4, "lines": ["BENEFICIARY:", "SHALIKA FANDATION"], "hl": "FANDATION", "hlAt": 4.0}]},
    "typo2": {"bg": BLACK, "layers": [{"k": "kicker", "text": "FOUNDATION", "top": 560, "size": 96, "color": "#3ddc84", "at": 0.1}, {"k": "kicker", "text": "FANDATION", "top": 700, "size": 96, "color": "red", "at": 1.4}, {"k": "stamp", "text": "TRANSFER DURDU", "top": 980, "at": 3.6, "size": 74, "color": "gold"}]},
    "casino": {"bg": drawn("casinoTable", (1.05, 1.15)), "layers": [{"k": "small", "text": "MANİLA · KUMARHANELER", "top": 300, "color": "white"}, {"k": "stamp", "text": "İZ KAYBOLDU", "top": 900, "at": 3.2, "size": 76}]},
    "who": {"bg": drawn("hacker", (1.3, 1.4)), "layers": [{"k": "headline", "paper": "ABD ADALET BAKANLIĞI · 2018", "text": "Kuzey Kore bağlantılı hacker grubu suçlandı", "top": 560, "size": 54, "at": 0.8}]},
    "me": {"bg": drawn("casinoTable"), "layers": [{"k": "note", "motion": "slide", "y": -380, "w": 440, "at": 0.4}]},
    "next": {"bg": drawn("stage"), "layers": []},
    "end": end_scene(7, "KRİPTO\nKRALİÇESİ"),
}, sfx=[["hook", 0, "glitch", -21], ["hook", 0.2, "boom", -20], ["setup", -0.3, "whoosh", -27], ["hack", 0.1, "typing", -25], ["num", 0.3, "ticks", -26], ["num", 2.2, "coins", -28], ["printer", 0.2, "beep", -24], ["fed", 1.4, "stamp", -20], ["fed", 3.4, "whoosh", -26], ["typo", 2.6, "typing", -25], ["typo2", 1.4, "glitch", -22], ["typo2", 3.6, "stamp", -19], ["casino", 0.1, "casino", -30], ["casino", 3.2, "stamp", -21], ["who", 0.8, "paper", -24], ["me", 0.4, "coins", -28], ["next", 0.1, "crowd", -26], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 7
EPS[7] = dict(title="Kripto Kraliçesi", music=[["Rising.mp3", "hook"], ["Hiding_Your_Reality.mp3", "truth"], ["Dark_Times.mp3", "flight"]], lines=[
    ("hook", "N", W + "FBI'ın en çok arananlar listesinde bir kadın var. [pause] Son izi: bir uçak.", "FBI'ın en çok arananlar listesinde bir kadın var. Son izi: bir uçak.", 0.6),
    ("stage", "N", "Haziran iki bin on altı. Londra, Wembley Arena. Binlerce kişi bir kadını alkışlıyor: Ruja Ignatova.", "Haziran 2016. Londra, Wembley Arena. Binlerce kişi bir kadını alkışlıyor: Ruja Ignatova.", 0.3),
    ("pitch", "N", "Yeni bir kripto para tanıtıyor: OneCoin. Ona 'Bitcoin'in katili' diyor.", "Yeni bir kripto para tanıtıyor: OneCoin. Ona “Bitcoin'in katili” diyor.", 0.3),
    ("sell", "N", "Dünyanın dört bir yanında insanlar yatırım yapıyor. Eğitim paketleri, sahneler, büyük vaatler.", "Dünyanın dört bir yanında insanlar yatırım yapıyor. Eğitim paketleri, sahneler, büyük vaatler.", 0.4),
    ("truth", "N", "[serious] Ama savcılara göre bir sorun vardı: OneCoin'in gerçek bir blok zinciri yoktu. Ekrandaki rakamlar uydurmaydı.", "Ama savcılara göre bir sorun vardı: OneCoin'in gerçek bir blok zinciri yoktu. Ekrandaki rakamlar uydurmaydı.", 0.4),
    ("amount", "N", "Toplanan para... dört milyar dolardan fazla.", "Toplanan para… 4 milyar dolardan fazla.", 0.4),
    ("flight", "N", "Yirmi beş Ekim iki bin on yedi. Sofya'dan Atina'ya bir uçağa biniyor.", "25 Ekim 2017. Sofya'dan Atina'ya bir uçağa biniyor.", 0.3),
    ("gone", "N", W + "Ve sonra... ortadan kayboluyor.", "Ve sonra… ortadan kayboluyor.", 0.5),
    ("fbi", "N", "İki bin yirmi ikide FBI onu en çok aranan on kaçak listesine ekliyor. Ödül: yüz bin dolar.", "2022'de FBI onu en çok aranan on kaçak listesine ekliyor. Ödül: 100.000 dolar.", 0.4),
    ("rumor", "N", "Öldüğüne dair iddialar var. Saklandığına dair iddialar var. Kanıt... yok.", "Öldüğüne dair iddialar var. Saklandığına dair iddialar var. Kanıt… yok.", 0.5),
    ("me", "N", "Ben mi? Atina'da bir taksicinin bahşişi oldum. Sonra bir yolcunun cüzdanında Kanada'ya uçtum.", "Ben mi? Atina'da bir taksicinin bahşişi oldum. Sonra bir yolcunun cüzdanında Kanada'ya uçtum.", 0.5),
    ("next", "N", W + "Orada genç bir milyoner vardı. Bütün şifreleri... [pause] sadece o biliyordu.", "Orada genç bir milyoner vardı. Bütün şifreleri… sadece o biliyordu.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm sekiz: Şifre.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("plane"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 7", "top": 300, "at": 0.4}, {"k": "kicker", "text": "KRİPTO\nKRALİÇESİ", "top": 350, "size": 110, "color": "gold", "at": 1.2}]},
    "stage": {"bg": drawn("stage"), "layers": [{"k": "small", "text": "WEMBLEY ARENA · HAZİRAN 2016", "top": 300, "color": "white"}, {"k": "kicker", "text": "RUJA IGNATOVA", "top": 360, "size": 80, "at": 3.6}]},
    "pitch": {"bg": drawn("stage", (1.15, 1.25)), "layers": [{"k": "kicker", "text": "ONECOIN", "top": 330, "size": 120, "color": "gold", "at": 0.8}, {"k": "quote", "text": "Bitcoin'in katili", "top": 1080, "size": 64, "at": 2.6, "type": 0.9}]},
    "sell": {"bg": drawn("stage", (1.25, 1.35)), "layers": [{"k": "chips", "items": ["EĞİTİM PAKETLERİ", "SAHNELER", "BÜYÜK VAATLER"], "top": 380, "step": 0.8}]},
    "truth": {"bg": drawn("crash"), "layers": [{"k": "stamp", "text": "BLOK ZİNCİRİ YOK", "top": 330, "at": 3.6, "size": 66}]},
    "amount": {"bg": BLACK, "layers": [{"k": "counter", "from": 0, "to": 4000000000, "suffix": "+", "top": 760, "size": 100, "at": 1.0, "dur": 2.0}]},
    "flight": {"bg": drawn("plane"), "layers": [{"k": "date", "d": "25", "m": "EKİM", "y": "2017", "top": 330}, {"k": "small", "text": "SOFYA → ATİNA", "top": 800, "color": "white", "at": 1.4}]},
    "gone": {"bg": BLACK, "layers": [{"k": "kicker", "text": "KAYIP", "top": 820, "size": 130, "color": "#777", "at": 1.0}]},
    "fbi": {"bg": BLACK, "layers": [{"k": "wanted", "src": "ruja_fbi.jpg", "name": "RUJA IGNATOVA", "sub": "ÖDÜL: 100.000 $", "title": "FBI · ARANIYOR", "top": 330, "h": 620, "pos": "50% 20%"}]},
    "rumor": {"bg": drawn("plane", (1.2, 1.3)), "layers": [{"k": "chips", "items": ["ÖLDÜ MÜ?", "SAKLANIYOR MU?", "KANIT YOK"], "top": 420, "step": 1.1, "color": "red"}]},
    "me": {"bg": drawn("plane", (1.1, 1.2)), "layers": [{"k": "small", "text": "ATİNA → KANADA", "top": 300, "color": "white"}, {"k": "note", "motion": "slide", "y": 260, "w": 420, "at": 2.5}]},
    "next": {"bg": drawn("laptop"), "layers": []},
    "end": end_scene(8, "ŞİFRE"),
}, sfx=[["hook", 0, "jet", -24], ["hook", 0.3, "boom", -20], ["stage", 0.1, "crowd", -24], ["pitch", 0.8, "boom", -22], ["sell", 0.2, "crowd", -30], ["truth", 0.1, "heartbeat", -24], ["truth", 3.6, "stamp", -19], ["amount", 1.0, "coins", -26], ["flight", 0.2, "jet", -24], ["gone", 0.0, "boom", -18], ["fbi", 0.2, "paper", -23], ["fbi", 0.5, "stamp", -22], ["rumor", 0.2, "whoosh", -27], ["me", 0.2, "paper", -26], ["next", 0.2, "riser", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 8
EPS[8] = dict(title="Şifre", music=[["Hiding_Your_Reality.mp3", "hook"], ["Dark_Times.mp3", "keys"], ["Lightless_Dawn.mp3", "grave"]], lines=[
    ("hook", "N", W + "Bir adam öldü. [pause] Ve binlerce insanın parası onunla birlikte kilitlendi.", "Bir adam öldü. Ve binlerce insanın parası onunla birlikte kilitlendi.", 0.6),
    ("who", "N", "Gerald Cotten. Kanada'nın en büyük kripto borsalarından QuadrigaCX'in kurucusu.", "Gerald Cotten. Kanada'nın en büyük kripto borsalarından QuadrigaCX'in kurucusu.", 0.3),
    ("trip", "N", "Aralık iki bin on sekiz. Eşiyle birlikte Hindistan'da bir seyahatte.", "Aralık 2018. Eşiyle birlikte Hindistan'da bir seyahatte.", 0.3),
    ("death", "N", "Jaipur'da bir hastanede, otuz yaşında hayatını kaybettiği açıklanıyor.", "Jaipur'da bir hastanede, 30 yaşında hayatını kaybettiği açıklanıyor.", 0.4),
    ("keys", "N", "[serious] Ölümü haftalar sonra duyuruluyor. Ve bir gerçek ortaya çıkıyor: Şirketin kripto cüzdanlarının şifrelerini yalnızca o biliyormuş.", "Ölümü haftalar sonra duyuruluyor. Ve bir gerçek ortaya çıkıyor: Şirketin kripto cüzdanlarının şifrelerini yalnızca o biliyormuş.", 0.4),
    ("locked", "N", "Müşterilerin yüz milyonlarca dolarlık parası kilitli kalıyor.", "Müşterilerin yüz milyonlarca dolarlık parası kilitli kalıyor.", 0.4),
    ("open", "N", "Uzmanlar sonunda cüzdanlara ulaşıyor. Ve neredeyse boş buluyor.", "Uzmanlar sonunda cüzdanlara ulaşıyor. Ve neredeyse boş buluyor.", 0.4),
    ("report", "N", "İki bin yirmide Ontario Menkul Kıymetler Komisyonu raporunu açıklıyor: Çöküşün sebebi, Cotten'ın kendi dolandırıcılığıydı.", "2020'de Ontario Menkul Kıymetler Komisyonu raporunu açıklıyor: Çöküşün sebebi Cotten'ın kendi dolandırıcılığıydı.", 0.4),
    ("grave", "N", "Yatırımcıların avukatları bir şey daha istedi: Mezarın açılmasını. Kimliğin ve ölüm sebebinin doğrulanmasını.", "Yatırımcıların avukatları bir şey daha istedi: mezarın açılmasını. Kimliğin ve ölüm sebebinin doğrulanmasını.", 0.4),
    ("nofact", "N", "Ölümünün sahte olduğuna dair hiçbir kanıt bulunamadı. Ama soru hâlâ soruluyor.", "Ölümünün sahte olduğuna dair hiçbir kanıt bulunamadı. Ama soru hâlâ soruluyor.", 0.5),
    ("me", "N", "Ben mi? Halifax'ta bir bankamatikten çekildim. Sonra Bahamalar'a giden genç bir milyarderin cebine girdim.", "Ben mi? Halifax'ta bir bankamatikten çekildim. Sonra Bahamalar'a giden genç bir milyarderin cebine girdim.", 0.5),
    ("next", "N", W + "Dünya onu kriptonun dâhisi sanıyordu. [pause] Bir hafta içinde her şey çöktü.", "Dünya onu kriptonun dâhisi sanıyordu. Bir hafta içinde her şey çöktü.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm dokuz: Bir hafta.", "", 1.8),
], scenes={
    "hook": {"bg": drawn("laptop"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 8", "top": 300, "at": 0.4}, {"k": "kicker", "text": "ŞİFRE", "top": 350, "size": 140, "color": "gold", "at": 1.2}]},
    "who": {"bg": photo("halifax.jpg", "cold", (1.1, 1.25)), "layers": [{"k": "kicker", "text": "GERALD COTTEN", "top": 320, "size": 82}, {"k": "small", "text": "QUADRIGACX · KANADA", "top": 430, "at": 0.9}]},
    "trip": {"bg": drawn("plane", (1.05, 1.15)), "layers": [{"k": "date", "d": "9", "m": "ARALIK", "y": "2018", "top": 520, "at": 1.4}, {"k": "small", "text": "JAİPUR · HİNDİSTAN", "top": 300, "color": "white"}]},
    "death": {"bg": BLACK, "layers": [{"k": "small", "text": "30 YAŞINDA", "top": 760, "color": "white", "at": 1.6, "size": 40}]},
    "keys": {"bg": drawn("laptop", (1.05, 1.18)), "layers": [{"k": "stamp", "text": "ŞİFRE: TEK KİŞİ", "top": 330, "at": 5.0, "size": 66}]},
    "locked": {"bg": drawn("laptop", (1.18, 1.3)), "layers": [{"k": "kicker", "text": "YÜZ MİLYONLARCA $\nKİLİTLİ", "top": 330, "size": 72, "color": "gold", "at": 0.6}]},
    "open": {"bg": drawn("vault"), "layers": []},
    "report": {"bg": BLACK, "layers": [{"k": "doc", "size": 36, "top": 520, "at": 0.4, "type": 3.2, "lines": ["ONTARIO SECURITIES COMMISSION", "QuadrigaCX Raporu · Haziran 2020", "", "Kayıp: en az 169 milyon dolar", "Sebep: kurucunun dolandırıcılığı"], "hl": "dolandırıcılığı", "hlAt": 4.4}]},
    "grave": {"bg": drawn("grave"), "layers": [{"k": "small", "text": "ARALIK 2019 · TALEP", "top": 300, "color": "white"}]},
    "nofact": {"bg": drawn("grave", (1.15, 1.25)), "layers": [{"k": "stamp", "text": "KANIT YOK", "top": 460, "at": 1.2, "color": "gold", "size": 80}]},
    "me": {"bg": photo("halifax.jpg", "night", (1.15, 1.3), (-20, 20)), "layers": [{"k": "small", "text": "HALİFAX", "top": 300, "color": "white"}, {"k": "note", "motion": "slide", "y": 260, "w": 420, "at": 2.6}]},
    "next": {"bg": drawn("penthouse"), "layers": []},
    "end": end_scene(9, "BİR HAFTA"),
}, sfx=[["hook", 0, "heartbeat", -22], ["hook", 0.2, "boom", -20], ["who", -0.3, "whoosh", -27], ["trip", 0.2, "jet", -28], ["death", 0.2, "flatline", -26], ["keys", 0.2, "typing", -28], ["keys", 5.0, "stamp", -20], ["locked", 0.2, "lock", -20], ["open", 0.2, "vaultdoor", -20], ["report", 0.4, "typing", -27], ["grave", 0.1, "wind", -24], ["nofact", 1.2, "stamp", -20], ["me", 0.2, "paper", -26], ["next", 0.2, "riser", -24], ["end", 0.2, "boom", -18]])

# ---------------------------------------------------------------- 9
EPS[9] = dict(title="Bir Hafta", music=[["Rising.mp3", "hook"], ["Dark_Times.mp3", "leak"], ["Lasting_Hope.mp3", "finale"]], lines=[
    ("hook", "N", W + "Otuz yaşında, milyarder. [pause] Bir hafta sonra... her şey bitti.", "30 yaşında, milyarder. Bir hafta sonra… her şey bitti.", 0.6),
    ("who", "N", "Sam Bankman-Fried. Kripto borsası FTX'in kurucusu. Dağınık saçlar, şort, tişört.", "Sam Bankman-Fried. Kripto borsası FTX'in kurucusu. Dağınık saçlar, şort, tişört.", 0.3),
    ("peak", "N", "Ocak iki bin yirmi ikide şirketinin değeri otuz iki milyar dolar.", "Ocak 2022'de şirketinin değeri 32 milyar dolar.", 0.4),
    ("leak", "N", "İki Kasım iki bin yirmi iki. Bir haber sitesi, FTX'in kardeş şirketi Alameda'nın bilançosunu yayınlıyor.", "2 Kasım 2022. Bir haber sitesi, FTX'in kardeş şirketi Alameda'nın bilançosunu yayınlıyor.", 0.3),
    ("run", "N", "Müşteriler paniğe kapılıyor. Birkaç gün içinde milyarlarca dolar çekilmek isteniyor.", "Müşteriler paniğe kapılıyor. Birkaç gün içinde milyarlarca dolar çekilmek isteniyor.", 0.3),
    ("fall", "N", "On bir Kasım. FTX iflas başvurusu yapıyor.", "11 Kasım. FTX iflas başvurusu yapıyor.", 0.4),
    ("truth", "N", "[serious] Ortaya çıkan gerçek: Müşterilerin parası gizlice Alameda'ya aktarılmıştı. Mahkemeye göre müşterilerin kaybı: sekiz milyar dolar.", "Ortaya çıkan gerçek: Müşterilerin parası gizlice Alameda'ya aktarılmıştı. Mahkemeye göre müşterilerin kaybı: 8 milyar dolar.", 0.4),
    ("verdict", "N", "Kasım iki bin yirmi üç. Jüri onu yedi suçlamanın hepsinden suçlu buluyor.", "Kasım 2023. Jüri onu yedi suçlamanın hepsinden suçlu buluyor.", 0.3),
    ("sentence", "A", "[serious] Sam Bankman-Fried, yirmi beş yıl hapis cezasına çarptırıldı.", "“Sam Bankman-Fried, 25 yıl hapis cezasına çarptırıldı.”", 0.6),
    ("finale", "N", "Bir banknot olarak çok şey gördüm. Piyango. İflas. Pizza. Hayalet. Çöplük. Soygun. Kaçış. Şifre.", "Bir banknot olarak çok şey gördüm. Piyango. İflas. Pizza. Hayalet. Çöplük. Soygun. Kaçış. Şifre.", 0.4),
    ("lesson", "N", "Hepsinde aynı ders vardı: Para kaybolmaz. [pause] Sadece el değiştirir.", "Hepsinde aynı ders vardı: Para kaybolmaz. Sadece el değiştirir.", 0.6),
    ("cta", "N", W + "Şimdi ben senin cebindeyim. [pause] Peki senden sonra... kimin elinde olacağım?", "Şimdi ben senin cebindeyim. Peki senden sonra… kimin elinde olacağım?", 0.8),
    ("end", "N", "Tek Bir Banknot. Birinci sezonun sonu.", "", 2.2),
], scenes={
    "hook": {"bg": drawn("penthouse"), "layers": [{"k": "small", "text": "TEK BİR BANKNOT · BÖLÜM 9", "top": 300, "at": 0.4}, {"k": "kicker", "text": "BİR HAFTA", "top": 350, "size": 120, "color": "gold", "at": 1.2}]},
    "who": {"bg": photo("sbf.png", "doc", (1.05, 1.18), pos="50% 30%"), "layers": [{"k": "kicker", "text": "SAM\nBANKMAN-FRIED", "top": 300, "size": 76}]},
    "peak": {"bg": photo("nassau.jpg", "warm", (1.1, 1.25)), "layers": [{"k": "counter", "from": 0, "to": 32000000000, "top": 720, "size": 92, "at": 1.4, "label": "ŞİRKET DEĞERİ"}, {"k": "small", "text": "NASSAU · BAHAMALAR", "top": 300, "color": "white"}]},
    "leak": {"bg": BLACK, "layers": [{"k": "headline", "paper": "COINDESK · 2 KASIM 2022", "text": "Alameda'nın bilançosu sızdı: varlıkların büyük kısmı FTX'in kendi tokenı", "top": 560, "size": 48, "at": 3.0}]},
    "run": {"bg": drawn("crash"), "layers": [{"k": "counter", "from": 0, "to": 6000000000, "prefix": "−$", "top": 330, "size": 84, "at": 2.0, "dur": 2.6, "color": "red", "label": "ÇEKİLMEK İSTENEN (TAHMİNİ)"}]},
    "fall": {"bg": photo("ftx_arena.jpg", "cold", (1.08, 1.22)), "layers": [{"k": "small", "text": "FTX ARENA · MİAMİ · 11 KASIM 2022", "top": 300, "color": "white"}, {"k": "stamp", "text": "İFLAS", "top": 900, "at": 1.6, "size": 140}]},
    "truth": {"bg": BLACK, "layers": [{"k": "chips", "items": ["MÜŞTERİ PARASI", "→ ALAMEDA", "GİZLİCE"], "top": 380, "step": 0.9, "color": "red"}, {"k": "counter", "from": 0, "to": 8000000000, "top": 1000, "size": 100, "at": 5.0, "label": "MÜŞTERİ KAYBI"}]},
    "verdict": {"bg": drawn("court"), "layers": [{"k": "stamp", "text": "7 / 7 SUÇLU", "top": 330, "at": 2.4, "size": 90}]},
    "sentence": {"bg": photo("courthouse.jpg", "bw", (1.1, 1.25)), "layers": [{"k": "kicker", "text": "25 YIL", "top": 760, "size": 200, "color": "gold", "at": 1.8}, {"k": "small", "text": "28 MART 2024 · NEW YORK", "top": 300, "color": "white"}]},
    "finale": {"bg": BLACK, "layers": [{"k": "note", "w": 600, "y": -380}, {"k": "chips", "items": ["PİYANGO · İFLAS", "PİZZA · HAYALET", "ÇÖPLÜK · SOYGUN", "KAÇIŞ · ŞİFRE"], "top": 820, "step": 0.9, "size": 46}]},
    "lesson": {"bg": BLACK, "layers": [{"k": "kicker", "text": "PARA KAYBOLMAZ.", "top": 700, "size": 84, "at": 1.4}, {"k": "kicker", "text": "SADECE\nEL DEĞİŞTİRİR.", "top": 860, "size": 84, "color": "gold", "at": 3.0}]},
    "cta": {"bg": BLACK, "layers": [{"k": "note", "w": 720, "y": -60}]},
    "end": {"bg": BLACK, "layers": [{"k": "small", "text": "TEK BİR BANKNOT", "top": 760, "at": 0.2}, {"k": "kicker", "text": "1. SEZON\nSONU", "top": 820, "size": 100, "at": 1.0}, {"k": "small", "text": "Banknotun yolculuğu kurgudur · Hikâyeler gerçektir", "top": 1100, "size": 24, "color": "white", "at": 1.8}]},
}, sfx=[["hook", 0, "boom", -20], ["who", -0.3, "whoosh", -27], ["peak", 1.4, "coins", -26], ["leak", 0.2, "typing", -27], ["leak", 3.0, "paper", -22], ["run", 0.2, "alarm", -26], ["fall", 1.6, "stamp", -18], ["truth", 0.2, "heartbeat", -24], ["truth", 5.0, "boom", -20], ["verdict", 0.2, "gavel", -18], ["verdict", 2.4, "stamp", -20], ["sentence", 0.0, "static", -24], ["sentence", 1.8, "boom", -17], ["finale", 0.2, "paper", -24], ["lesson", 3.0, "boom", -21], ["cta", 0.2, "riser", -25], ["end", 0.2, "boom", -18]])


if __name__ == "__main__":
    for n, e in EPS.items():
        (D / f"ep{n}.json").write_text(json.dumps({"ep": n, **e}, ensure_ascii=False, indent=1))
    print("ok", list(EPS))

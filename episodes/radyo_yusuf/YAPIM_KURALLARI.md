# Çakır Radyo Tiyatrosu — Hz. Yusuf · Kalıcı Yapım Kuralları

Bu dosya, kanal sahibinin verdiği talimatların özetidir. Her yeni bölümde ve revizyonda ÖNCE bu dosya okunur ve uygulanır.

## Senaryo ve dil
- Kaynaklar: Kur'an (ana iskelet) + hadisler + tefsir rivayetleri (Taberî, İbn Kesîr vb.) + gerektiğinde Tevrat anlatısı/tarih. Sadece ayete bağlı kalınmaz; Hz. Yusuf'un hayatı rivayetlerle birlikte tamamlanır.
- Kur'an'da olmayan ayrıntıyı anlatıcı "rivayete göre / bazı rivayetlere göre / Tevrat'ta anlatıldığına göre" diye ayırır.
- Allah'ın sözü veya ilhamı ve melekler hiçbir karakter sesiyle konuşturulmaz; anlatıcı aktarır. Ağlama/hıçkırma efekti yok; hüzün oyunculukla verilir.
- **Dini kelimeleri bol ve doğal kullan:** Rabbim, Allah'a emanet ol, inşallah, maşallah, elhamdülillah, bismillah, hayırdır inşallah, Allah razı olsun, selamün aleyküm / aleyküm selam, Allah'ın izniyle, hamdolsun, sabır, tevekkül, dua…
- **"İyi geceler" değil "Hayırlı geceler"**, "günaydın" değil "hayırlı sabahlar".
- **"Atalarımız" değil "peygamberlerimiz / dedelerin, peygamber İbrahim ve İshak"** gibi ifadeler.
- Tempo yavaştır: her bölüm birkaç ayet; bölüm sayısı artabilir (planlanan ~40). Hedef süre ≈ 10 dakika.
- Kardeşler rivayetteki adlarıyla: Rubil (en büyük, yumuşak), Şem'un (sert, otoriter), Lavi (alaycı), Yahuda (vicdanlı). Birbirlerine adlarıyla hitap ederler ki dinleyici kimin konuştuğunu anlasın.
- Her sahnenin başında anlatıcı kısa bir giriş yapar (Asr-ı Saadet radyo tiyatrosu üslubu): yer, zaman, kimler var.

## Ses ve miks
- Seslendirme ElevenLabs eleven_v3, dil tr. Karakter sesleri sabit (scripts/radyo_tts.py VOICES + episodes/radyo_yusuf/cast.json). Kanal sahibi sesleri revize edecek; yeni ID gelince cast güncellenir ve bölümler yeniden seslendirilir.
- Yeni karakter: Türkçe ses havuzundan (voice_pool.json) otomatik atanır, cast.json'a kalıcı yazılır; her yeni karaktere başka bir ses.
- **Yankı az olacak.** Mekân yankıyla değil; ortam sesi, ayak sesi zemini ve dış seslerin boğukluğuyla anlatılır:
  - İç mekân: oda tonu, dışarıdan boğuk gelen rüzgâr/kuş, ahşap/toprak zemin ayak sesi, kapı, kumaş, ateş.
  - Dış mekân: açık ve geniş ortam (rüzgâr, kuş, hayvanlar), toprak/kum/taş ayak sesi.
  - Kuyu gibi özel yerlerde yankı serbest.
- **Kopma olmayacak:** her replik nefes payıyla ve yumuşak sönümle biter; replikler arasında doğal boşluk.
- **Önemli cümlelerden sonra** kısa bir duraklama ve hafif bir ses girişi (müzik nefesi / ortam yükselmesi) yapılabilir — senaryoda `("BEAT",)` ile işaretlenir.
- Diyalog önde: efektler diyalogun ~14 dB, ortam ~18–20 dB altında; konuşma sırasında arka plan geri çekilir. Ortam sesi sahneden sahneye değişir, hep aynı olmaz.
- Müzik yalnızca jenerik, geçiş ve "beat" anlarında; sabit Hicaz teması.

## Görsel ve teslim
- Asr-ı Saadet tarzı sabit kapak; arkada aynı 4 gerçek fotoğraf aynı sırayla yavaşça değişir; her bölümde yalnızca bölüm no/adı değişir.
- Teslim: her bölüm için telefon önizlemesi (≤ 22 MB) + YouTube paketi (1080p, 320k ses, kapak, açıklama/bölümler, SRT, MP3) ZIP. Bölüm bitince hemen gönderilir.
- Shorts: 9:16, bölüm sesinden 50–65 sn kesit, büyük altyazı + konuşan adı (renkli), açılış başlığı, sonda "Tam bölüm kanalda".

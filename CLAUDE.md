# CAKIR — proje hafızası

- Kullanıcı Türkçe konuşur; yanıtlar Türkçe.
- **Çakır Radyo Tiyatrosu (Hz. Yusuf)** üzerinde çalışırken önce `episodes/radyo_yusuf/YAPIM_KURALLARI.md` dosyasını oku ve oradaki kalıcı kuralları uygula (dini dil, "hayırlı geceler", az yankı + mekânı ortam sesiyle anlatma, kopmasız geçişler, önemli cümlelerden sonra "BEAT").
- Seri planı: `episodes/radyo_yusuf/Seri_Plani.md`. Senaryolar: `episodes/radyo_yusuf/epNN_script.py`.
- Üretim: `python3 scripts/radyo_tts.py epNN_script` → QC/retake → `scripts/radyo_finish.sh NN "Başlık" "Sonraki" "özet" "ayet" "etiketler" Slug`.
- Medya, ses ve çıktı dosyaları git'e eklenmez (.gitignore).

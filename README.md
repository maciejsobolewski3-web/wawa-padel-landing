# WAWA Padel — landing koncepcyjny

Statyczny, responsywny landing oparty na makiecie WAWA Padel. Zwykły HTML i CSS, bez instalacji i procesu budowania. Publikacja: GitHub Pages z gałęzi `codex/landing` i katalogu głównego.

## Stan

- Planowane otwarcie: marzec 2027; Jawczyce; 12 całorocznych kortów indoor.
- To publiczny podgląd koncepcji, z dyrektywą `noindex, nofollow` (nie jest kontrolą dostępu).
- Zdjęcia są wygenerowanymi wizualizacjami. Nie przedstawiają rzeczywistego obiektu ani klientów klubu.
- Zapisy jeszcze nie zbierają danych: strona wprost komunikuje, że ruszą wkrótce. Nie udaje sukcesu formularza i nie przechowuje e-maili w przeglądarce.
- Mapa wskazuje miejscowość Jawczyce, nie zweryfikowaną pinezkę klubu.
- Brak narzędzi analitycznych, reklamowych i zewnętrznych fontów.

## Uruchomienie lokalne

Z katalogu projektu: `python3 -m http.server 4178 --bind 127.0.0.1`, a następnie http://127.0.0.1:4178/.

## Przed uruchomieniem zapisów

Wybrać narzędzie/formularz przechowujący zgłoszenia, ustalić administratora danych i treść informacji dla zapisujących się, dodać właściwy endpoint i sprawdzić rzeczywisty zapis oraz obsługę błędów. Nigdy nie dodawać prywatnych kluczy do kodu strony. Dokładny adres klubu i finalne fotografie wymagają potwierdzenia. Po zatwierdzeniu strony można usunąć `noindex`.

## Wersja 2 — 26.09.2026

- Nowy wektorowy znak W z piłką i poziomy logotyp w wariantach bordowym i jasnym (`assets/brand/`).
- Pełnoszerokościowa karuzela trzech zdjęć: przyciski, wybór slajdu, klawiatura, pauza i automatyczna zmiana co 7,5 s. Autoplay pauzuje po najechaniu, przy fokusie i w nieaktywnej karcie.
- Animacje wejścia, powolne zbliżenie zdjęcia i pojawianie się treści podczas przewijania. Preferencja ograniczenia ruchu wyłącza animacje i autoplay.
- Sekcje: baner, pasek informacji, klub i fakty, trzy podejścia do gry, indoor, plan otwarcia, lokalizacja, FAQ, końcowe zaproszenie.
- `app.js` obsługuje karuzelę i animacje. Bez JavaScript treść i FAQ pozostają dostępne, a pierwsze zdjęcie jest statyczne.
- Wciąż bez zbierania danych, niepotwierdzonego cennika i ofert zajęć. Logotyp stanowi roboczą propozycję identyfikacji.

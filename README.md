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

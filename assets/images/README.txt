Реальные фото для сайта «Синга Сервис»
=======================================

Положите файлы по этим именам — они уже подписаны в коде сайта.

Блок «Собственный цех и 5 точек в городе» (главная):
  entrance.jpg      — фото входа, 800×600
  reception.jpg     — фото зоны приёмки, 800×600
  workshop.jpg      — фото собственного цеха, 800×600
  repair-tv.jpg     — пример ремонта телевизора, 800×600
  repair-coffee.jpg — пример ремонта кофемашины, 800×600
  repair-phone.jpg  — пример ремонта телефона, 800×600

Блок «Примеры ремонтов» (главная):
  example-display.jpg    — замена дисплея телефона, 800×600
  example-backlight.jpg  — ремонт подсветки ТВ, 800×600
  example-coffee.jpg     — ремонт кофемашины, 800×600
  example-laptop.jpg     — чистка ноутбука, 800×600
  example-printer.jpg    — ремонт принтера, 800×600
  example-dyson.jpg      — ремонт Dyson, 800×600

Фото мастеров (квадратные, 400×400):
  master-electronics.jpg  — мастер по электронике
  master-tv.jpg           — мастер по телевизорам
  master-coffee.jpg       — мастер по кофемашинам


Как подменить плейсхолдер на реальное фото
-------------------------------------------

Вариант 1 — простая подмена (без лайтбокса).
В index.html найдите соответствующий .photo-card или .example-card и
добавьте класс has-img + <img>:

  <article class="photo-card has-img">
    <img src="assets/images/entrance.jpg" alt="Вход в сервис на Заводской">
    <span class="photo-card__ico">…</span>
    <span class="photo-card__hint">Точка</span>
    <span class="photo-card__name">Заводская, 25 — вход</span>
  </article>

Вариант 2 — фото открывается в лайтбоксе при клике.
Оберните <img> в <a class="lightbox-link" data-lightbox-group="GROUP" href="…">:

  <article class="example-card has-img">
    <div class="example-card__media">
      <a class="lightbox-link"
         data-lightbox-group="examples"
         href="assets/images/example-display.jpg">
        <img src="assets/images/example-display.jpg"
             alt="Замена дисплея iPhone — до и после"
             loading="lazy" decoding="async">
      </a>
    </div>
    <div class="example-card__body">…</div>
  </article>

Все фото с одинаковым data-lightbox-group объединяются в галерею со
стрелками «Назад / Вперёд» и счётчиком «1 / 6».

Рекомендации:
- Оптимизируйте фото через squoosh.app до ~100–150 КБ.
- Всегда указывайте loading="lazy" decoding="async" для фото.
- В alt пишите осмысленное описание (что на фото), а не «фото 1».
- Для блока «Примеры работ» делайте before/after одной картинкой или
  отдельные фото с разным data-caption.

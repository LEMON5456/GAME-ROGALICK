# Mouldog MVP — Веб-рogалик

2D side-scroll action roguelite в духе Mouldog. Один сектор: 2 планеты с добычей руды под таймером, магазин на корабле и финальный босс.

## Стек

- HTML / CSS / JavaScript (ES Modules)
- Canvas 2D для игрового мира
- HTML overlay для меню, HUD и магазина

## Запуск

Игра использует ES Modules — нужен локальный HTTP-сервер.

### Вариант 1: npx serve

```bash
cd "ИГРА РОГАЛИК"
npx serve .
```

Откройте в браузере адрес, который покажет serve (обычно http://localhost:3000).

### Вариант 2: Python

```bash
cd "ИГРА РОГАЛИК"
python -m http.server 8080
```

Откройте http://localhost:8080

### Вариант 3: Live Server (VS Code / Cursor)

Установите расширение Live Server и откройте `index.html` через «Open with Live Server».

## Управление

| Клавиша | Действие |
|---------|----------|
| A / D | Движение влево / вправо |
| Space | Прыжок |
| J / ЛКМ | Стрельба |
| E | Добыча руды (удерживать) / эвакуация у выхода |

## Игровой цикл

1. **Меню** — начать забег
2. **Корабль** — высадка на планету
3. **Планета** — добыча руды, бой с врагами, таймер 3 мин
4. **Магазин** — покупка апгрейдов за руду
5. Повтор для второй планеты
6. **Босс** — Mould Titan (2 фазы)
7. **Победа** или **Game Over** при смерти

## Апгрейды

| Название | Цена | Эффект |
|----------|------|--------|
| Усиленный бластер | 15 Fe | +30% урона |
| Расширенный бур | 10 Fe | +20% скорость добычи |
| Усиленный скафандр | 20 Cr | +25 max HP |
| Стабилизатор | 25 Cr | +30 сек к таймеру |

## Структура проекта

```
├── index.html
├── css/style.css
├── js/
│   ├── main.js
│   ├── constants.js
│   ├── core/       — Game, Input, Camera, Timer
│   ├── world/      — TileMap, PlanetGen, Physics
│   ├── entities/   — Player, Enemy, Boss, Projectile
│   ├── systems/    — Combat, Mining, Spawn
│   ├── ui/         — HUD, ShopUI, MenuUI
│   └── data/       — planets, enemies, upgrades
└── README.md
```

## Ассеты

Используется **Roguelike Characters pack** от [Kenney](https://www.kenney.nl/assets/roguelike-characters) (CC0):

| Файл | Назначение |
|------|------------|
| `assets/Spritesheet/roguelikeChar_transparent.png` | Персонажи, враги, босс, руда, снаряды |
| `assets/Preview.png` | Фон меню и магазина |
| `assets/Sample.png` | Фон экрана корабля |

Распределение спрайтов:
- **Игрок** — рыцарь (samplePerson1)
- **Ползун** — варвар (samplePerson5)
- **Плевун** — маг (samplePerson3)
- **Босс** — тяжёлый воин (samplePerson12)
- **Руда Fe / Cr** — металлический и магический предметы из листа
- **EXIT** — щит как маркер эвакуации

## Дальнейшее развитие (v0.2+)

- Мультиплеер
- Мета-прогрессия между забегами
- Дополнительные секторы и биомы
- Звуки и музыка
- Спрайты вместо placeholder-графики

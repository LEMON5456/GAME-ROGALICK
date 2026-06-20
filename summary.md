# Rogalick — текущее состояние

## Goal
Все фичи из списка реализованы: анимации игрока, SFX, спрайты врага, новый контент (дробовик, 3 врага), удаление дублей, улучшение визуала (сундук), 4 новых апгрейда магазина (скорострельность, самонаведение, прыжок дробовик).

## Constraints & Preferences
- Звуки: программная генерация через Web Audio API + MP3-семплы
- Мета-валюта: «Эфирная сыворотка» (Ether Serum)
- Кастомный PNG (1024×1024) нарезается на спрайты ледяного биома через `IceAssets.js`
- Для врагов (crawler/spitter) — Kenney-спрайтшит; для игрока — Soldier top-down спрайты (100×100 кадр, обрезка до контента + scale 2.8×); для Orc — отдельный PNG-спрайтшит
- Soldier-спрайты: Idle (6×100), Walk (8×100), Attack01 (6×100), Hurt (4×100), обрезка x=36..75, y=31..59, scale 2.8×. Отзеркаливание для facing=−1. Offset Y = round(4·scale)
- Новые ассеты: `assets/planets/`, `assets/effects/`, `assets/fx/`, `assets/tiles/tiles.png`, `assets/sprites/soldier/`, `assets/sprites/arrow/`, `assets/sprites/orc/`
- Металл Сектора 1: `Tilemap/tiles.png` (18×18 плитки, 23×15 сетка), маппинг wall/floor/wallDark/floorDark/vent
- Фон 1-го сектора: `bg_sector1.jpg` (3000×2000) — прямая загрузка, без race condition с `bg_space.jpg`

## Progress
### Done
- **Фон (BackgroundImage.js)**: parallax-скролл (0.08× камеры), tile wrapping
- **Декорации**: panels + star dust (space), coals + drips + heat shimmer (lava)
- **Перенос ассетов**: planets/, effects/, fx/ → assets/
- **SpriteSheet.js** — универсальный загрузчик/рендерер
- **PlanetIcons.js** — 5 планет 48×48
- **EffectSheets.js** — 4 элементальных 16×16 листа
- **FXSheets.js** — 20 эффектов 100×100
- **Планеты в хабе**: canvas 96×96
- **Снаряды-спрайты**: biome-aware (purple/water/fire), Arrow01 для player
- **Портал эвакуации**: анимация magicSpell (81 кадр, 8fps)
- **Impact-эффекты**: weaponHit (6 кадров, 0.25s)
- **Shield FX**: protection (вращающаяся анимация)
- **Hazard FX**: fire/blueFire поверх опасных тайлов
- **Исправлен RandomEvents.js**: TILE.EMPTY→AIR, WALL→STONE
- **Чёрная дыра/барен**: drawByName в MenuUI.showHub
- **Мета-прогрессия**: SaveManager, 6 мета-апгрейдов, MetaShopUI
- **Сектор 2 (Лёд)** + **Сектор 3 (Лава) + LavaBoss + Endless**
- **Звуки**: синтезированные SFX + MP3 (mine, walk_metal), музыка по биомам
- **Ультимейт-атака**: заряд 0–100 (+5 руда, +8 убийство), K — 5с rapid fire + brightFire + invincibility
- **Кирка**: pickaxe.png (64×64)
- **Screen transitions**: fadeTransition(callback), overlay, 3s⁻¹
- **UI-звуки кнопок**: sfxClick()
- **SFX-слайдер**: отдельные ползунки меню/пауза, сохраняется в meta.settings
- **Спрайты игрока заменены на Soldier**: Idle/Walk/Attack01/Hurt, crop/scale 2.8×
- **Стрела**: Arrow01(32×32).png, crop 19×7
- **Враг Орк**: Orc-Walk.png (22×16 crop), анимация 6 кадров
- **MetalTiles.js**: tiles.png 18×18, маппинг wall/floor/wallDark/floorDark/vent
- **TileMap.js — space**: STONE рендер через metalTiles.draw()
- **Загрузка ассетов**: параллельная в main.js
- **Фон 1-го сектора**: bg_sector1.jpg, прямая загрузка, без race condition
- **Анимации игрока**: attackAnim (6 фр ×0.04s), hurtAnim (4 фр ×0.07s), _attackTimer/_hurtTimer, _drawSprite() по приоритету
- **Недостающие SFX**: sfxUltimate(), sfxWave(), sfxDeploy(), sfxShieldBreak()
- **Орк-спрайты**: Orc-Attack01.png (0.05s), Orc-Hurt.png (0.08s), Orc-Death.png (0.1s)
- **Сундук (Crate.js)**: procedural-рендер с рамкой, перекрестием, заклёпкой
- **Удаление дублей**: 11 папок + 10 файлов из корня
- **Новое оружие (дробовик)**: апгрейд multiShot, разброс 0.06 рад
- **Новые враги**: shield (щит иммунитет), teleporter (телепорт + стрельба), buffer (бафф врагов +50% урон)
- **Новые апгрейды**: fireRate (−12%/ур), homing (самонаведение +0.15 steer), jump (+15%/ур)
- **Бафф-визуал**: зелёная рамка на баффнутых врагах; баффнутые враги наносят ×1.5 урон
- **Новые враги добавлены в планеты**: shield — Beta-3, Глетчер-2; teleporter — Глетчер-3; buffer — Инферно-2/3

### In Progress
- (none)

### Blocked
- Конвертация .ai/.eps не нужна (jpg в assets/)
- 15 неиспользованных FX-листов

## Key Decisions
- Проектайл-пул — inline в Game.js
- Пауза — HTML/DOM, не canvas
- Физика льда — только трение 0.85
- Эндлесс — циклирование биомов
- Снаряды biome-aware + Arrow01 для игрока
- Игрок: Soldier спрайты с crop+scale 2.8×
- Кирка: alpha-ключ (brightness >180)
- MetalTiles — замена procedural-тайлов для space
- Фон сектора 1: прямая загрузка без race condition
- Анимации: _attackTimer/_hurtTimer управляют спрайтами
- Buffer-логика: в Game.js после enemy-update
- Homing: steer 0.15, в updateProjectiles
- Бафф-урон: ×1.5 в CombatSystem

## Next Steps
- События: ловушки, сокровищницы, временные испытания
- Улучшение генерации карт: вертикальные комнаты, пропасти, структуры
- Система перков: выбор бонуса перед забегом
- Новые боссы с уникальными механиками
- Ежедневные задания / мутаторы
- Использовать оставшиеся FX-листы (15 неактивных)

## Critical Context
- Игра: ванильный JS + Canvas 2D (ES Modules), без фреймворков
- Сервер: HTTP на 8080 или 8081
- Tab заблокирован (Input.js)
- Сейвы: localStorage `mouldog_meta`
- Туннель: CAVE_TOP 8, CAVE_BOTTOM 15, 8 тайлов высоты
- Фоны: bg_space.jpg (4750×5450), bg_sector1.jpg (3000×2000)
- Soldier спрайты: 100×100 кадр, crop x=36..75 y=31..59, scale 2.8×, offsetY=round(4·scale)
- Metal Tile Atlas: tiles.png (417×284), 18×18 тайлы, 23×15
- Orc: Walk/Attack01/Hurt/Death (800/600/400/400 ×100), crop 22×16
- Анимации: attack (0.04s/фр, 0.25s), hurt (0.07s/фр, 0.3s)
- Homing: радиус 300px, steer 0.15
- Дробовик: spread=0.06 рад между лучами
- Бафф: радиус 200px, длительность 0.5s, урон ×1.5

## Relevant Files (ключевые)
- `js/core/Game.js`: state machine, spawn/multiShot/homing/buffer, fadeTransition
- `js/entities/Player.js`: Soldier-sprites + attack/hurt анимации, tryFire, takeDamage
- `js/core/Audio.js`: все SFX (sfxUltimate/Wave/Deploy/ShieldBreak)
- `js/systems/Combat.js`: CombatSystem + updateProjectiles (homing), бафф-урон
- `js/entities/Enemy.js`: shield/teleporter/buffer/orc, takeDamage (shield immunity)
- `js/data/upgrades.js`: multiShot, fireRate, homing, jump
- `js/data/enemies.js`: shield/teleporter/buffer конфиги
- `js/data/planets.js`: новые враги на Beta-3, Глетчер-2/3, Инферно-2/3
- `js/systems/Spawn.js`: setupPlanetEnemies
- `js/core/BackgroundImage.js`: фон, патч sector1
- `js/core/MetalTiles.js`: tiles.png для space
- `js/core/FXSheets.js`: 20 FX-листов
- `js/entities/Crate.js`: улучшенный procedural-рендер

# claude-statusline

Кастомная статус-строка для [Claude Code](https://claude.com/claude-code) — папка, модель, использование контекста, лимиты (5-часовой и недельный) со временем сброса, и стоимость сессии.

```
ORCA:main • Opus 4.8 (1M context) • 52k/1M • [ h 48% 59m | W 10% 3d2h ] • $1.24
```

| Сегмент | Что показывает |
|---|---|
| `ORCA:main` | текущая папка и git-ветка |
| `Opus 4.8 (1M context)` | модель; `(1M context)` — если окно 1M |
| `52k/1M` | занято контекста / весь объём (зелёный → жёлтый >50% → красный >80%) |
| `[ h 48% 59m \| W 10% 3d2h ]` | лимиты: `h` 5-часовой, `W` недельный, + время до сброса |
| `$1.24` | стоимость текущей сессии |

## Установка в один клик

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/kostyaff/claude-statusline/main/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/kostyaff/claude-statusline/main/install.sh | bash
```

Установщик копирует `statusline.js` в `~/.claude/` и прописывает блок `statusLine` в `~/.claude/settings.json`, не трогая остальные настройки. Перезапусти Claude Code — строка появится внизу.

## Как это работает

Claude Code на каждом тике передаёт скрипту JSON о сессии (модель, `context_window`, `rate_limits`, `cost`, путь к транскрипту). Скрипт печатает строку в stdout — она и становится статус-строкой. Требуется Node.js (он и так нужен Claude Code).

## Настройка

Правь `~/.claude/statusline.js` — цвета, порядок сегментов, формат. Чтобы убрать строку: удали блок `statusLine` из `~/.claude/settings.json`.

## Удаление

Удали ключ `statusLine` из `~/.claude/settings.json` и файл `~/.claude/statusline.js`.

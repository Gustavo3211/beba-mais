# BEBA+ 💧

App de hidratação que acompanha quanto de água você bebeu no dia.

## Funcionalidades

- **Registrar água** — adicione copos e garrafas com um toque
- **Meta diária** — defina sua meta e veja o progresso em tempo real
- **Streak e calendário** — histórico de dias e sequências de constância
- **Perfil e estatísticas** — médias, recordes e evolução
- **Conexão com o bebedouro** — pareie o bebedouro pelo **NFC**
- **Lembretes inteligentes** — avisos baseados no seu ritmo e hábitos reais
- **Feedbacks sonoros e visuais** — comemoração ao bater a meta

## 🔔 Sistema de Notificações

O app utiliza o `expo-notifications` com uma lógica reativa e inteligente de agendamento local, recalculada a cada gole registrado ou mudança de estado.

### 📋 Mapeamento das Notificações Locais

| ID | Tipo | Gatilho / Condição | Título | Mensagem | Temporização |
|---|---|---|---|---|---|
| `idle` | **Lembrete de Inatividade** | 2 horas sem registrar água | `Faz 2 horas 💧` | `Último gole às {HH:mm}. Bora reaprontar?` | Agendado para `último gole + 2h` (ou +15s se já passou) |
| `critical` | **Alerta Crítico** | 5 horas sem registrar água | `Caramba! 😳` | `Faz 5 horas desde o último gole ({HH:mm}). Tá tudo bem?` *(imediato)* ou `Faz 5 horas desde o último gole. Seu corpo tá pedindo água.` *(agendado)* | Agendado para `último gole + 5h` (ou +15s se já passou) |
| `habit` | **Horário Costumeiro (Hábito)** | Horários frequentes nos últimos 30 dias (≥ 2 registros) | `Hora do copo de sempre` | `Geralmente você bebe água por volta das {HH}h. Bora manter o hábito?` | Agendado para o próximo horário habitual não preenchido |
| `muted` | **Aviso de Pausa / Silêncio** | 7 dias sem abrir o app | `Vamos dar uma pausa?` | `Você está 7 dias sem abrir o BEBA+. A gente para de avisar até você voltar.` | Agendado para `última visita + 7 dias` |

### ⚙️ Regras e Inteligência do Agendamento

- **Reagendamento Reativo (`syncNotifications`)**: Sempre que o usuário adiciona um copo, desfaz um registro ou abre o aplicativo, a fila antiga é cancelada e novas notificações são calculadas para o momento certo.
- **Filtro Anti-Spam (Gap Mínimo de 45 min)**: Notificações muito próximas entre si são filtradas (`MIN_GAP_MS = 45min`), mantendo sempre a primeira programada para não sobrecarregar o usuário.
- **Silenciamento por Inatividade**: Se a pessoa ficar 7 dias sem abrir o app (`MUTED_DAYS = 7`), nenhuma nova notificação é enviada até que o app seja reaberto.
- **Canal Android Dedicado**: Configurado via canal `lembretes` (*"Lembretes de hidratação"*), prioridade alta (`HIGH`), vibração personalizada e LED turquesa (`#5eead4`).

### 📱 Feedbacks In-App

- **Celebração da Meta**: Animação de pulso e flash na tela acompanhados pelo áudio `goal_complete.wav` ao atingir 100% da meta do dia.
- **Toasts Flutuantes**: Avisos instantâneos na interface ao registrar água (`+X ml`), atualizar configurações de meta ou ao compartilhar estatísticas.

## Rodando

```bash
npm install
npm start
```

> Front-end em construção — as telas e a identidade visual estão prontas, a integração com o hardware vem depois.

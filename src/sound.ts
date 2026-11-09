import { createAudioPlayer } from 'expo-audio';

const clickPlayer = createAudioPlayer(require('../assets/sounds/click.wav'));
const goalPlayer = createAudioPlayer(require('../assets/sounds/goal_complete.wav'));

clickPlayer.volume = 0.45;
goalPlayer.volume = 0.85;

function replay(player: typeof clickPlayer) {
  try {
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {
        // O som é opcional; uma falha de áudio não deve travar a interface.
      });
  } catch {
    // idem
  }
}

export function playClick() {
  replay(clickPlayer);
}

export function playGoalComplete() {
  replay(goalPlayer);
}

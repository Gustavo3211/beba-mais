import { createAudioPlayer } from 'expo-audio';

const goalPlayer = createAudioPlayer(require('../assets/sounds/goal_complete.wav'));

goalPlayer.volume = 0.85;

function replay(player: typeof goalPlayer) {
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

export function playGoalComplete() {
  replay(goalPlayer);
}

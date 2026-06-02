/**
 * Module-level handle to the active Web Playback SDK player.
 *
 * The Spotify.Player instance lives in the NowPlaying component, but the play
 * buttons scattered across the app need it to call `activateElement()` inside
 * the user's click gesture — browsers block SDK audio otherwise. Keeping the
 * instance here lets those handlers reach it without prop drilling or context.
 */

let player: Spotify.Player | null = null;

export const setPlayerInstance = (instance: Spotify.Player | null): void => {
  player = instance;
};

export const getPlayerInstance = (): Spotify.Player | null => player;

// Must be called synchronously inside a user gesture before starting playback,
// otherwise the browser autoplay policy silently blocks the SDK audio element.
export const activatePlayer = (): void => {
  player?.activateElement?.();
};

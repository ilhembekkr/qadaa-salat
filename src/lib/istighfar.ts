export interface IstighfarState {
  day: string;
  recorded: number;
  visible: boolean;
}

/** Each added prayer reopens the inline reminder; corrections hide it. */
export function advanceIstighfar(state: IstighfarState, today: string, recorded: number): IstighfarState {
  if (state.day === today && state.recorded === recorded) return state;
  const previous = state.day === today ? state.recorded : 0;
  return { day: today, recorded, visible: recorded > previous };
}

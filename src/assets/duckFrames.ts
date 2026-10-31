// Every duck frame is bundled with the app (no network). Names match the files in assets/duck/.
export const duckFrames = {
  stand: require('../../assets/duck/stand.png'),
  walk1: require('../../assets/duck/walk1.png'),
  walk2: require('../../assets/duck/walk2.png'),
  walk3: require('../../assets/duck/walk3.png'),
  dance1: require('../../assets/duck/dance1.png'),
  dance2: require('../../assets/duck/dance2.png'),
  dance3: require('../../assets/duck/dance3.png'),
  happy: require('../../assets/duck/happy.png'),
  rest: require('../../assets/duck/rest.png'),
} as const;

export type DuckFrame = keyof typeof duckFrames;

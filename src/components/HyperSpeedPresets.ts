export const hyperspeedPresets = {
  one: {
    onAfterRender: () => {},
    distortion: {
      x: 0.5,
      y: 0.5,
      z: 0.5,
      powX: 1.5,
      powY: 1.5,
      powZ: 1.5,
    },
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    curvature: 0.0008,
    speed: 0.00002,
    colors: {
      road: 0x080808,
      island: 0x111111,
      background: 0x000000,
      shoulder: 0x444444,
      leftCars: [0xff102a, 0xeb383e, 0xff102a],
      rightCars: [0xd856bf, 0x6750a2, 0xd856bf],
      sticks: 0xd856bf,
    },
  },
};

import mustache from 'mustache';

const TEMPLATE = `
{
  app: {
    products: [
      {
        name: 'default',
        signingConfig: 'default',
        compatibleSdkVersion: '5.0.0(12)',
        runtimeOS: 'HarmonyOS',
      },
    ],
    buildModeSet: [
      {
        name: 'debug',
      },
      {
        name: 'release',
      },
    ],
    signingConfigs: [],
  },
  modules: [
    {
      name: 'entry',
      srcPath: './entry',
      targets: [
        {
          name: 'default',
          applyToProducts: ['default'],
        },
      ],
    },
  ],
}
`;

export class BuildProfileTemplate {
  constructor() {}

  build(): string {
    return mustache.render(TEMPLATE.trimStart(), {});
  }
}

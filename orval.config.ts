import type { Config } from 'orval';

const config: Config = {
  api: {
    input: './src/api/openapi.yaml',
    output: {
      mode: 'split',
      target: './src/api/generated',
      client: 'fetch',
      prettier: true,
      override: {
        mutator: {
          path: './src/api/client/fetchClient.ts',
          name: 'fetchClient',
        },
      },
    },
  },
};

export default config;

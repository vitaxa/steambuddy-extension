import { resolve } from 'path';

import { zipBundle } from './lib/zip-bundle';

// package the root dist file
zipBundle({
  distDirectory: resolve(__dirname, '../../dist'),
  buildDirectory: resolve(__dirname, '../../dist-zip'),
  distDirectoryName: 'extension',
}).then(() => {
  console.log('Zip successfully created');
}).catch(err => {
  console.error('Fail during create zip:', err);
});

import 'webextension-polyfill';
import { themeStorage } from '@extension/storage';

themeStorage.get().then(theme => {
  console.log('theme', theme);
});

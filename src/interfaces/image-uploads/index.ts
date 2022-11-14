/* istanbul ignore file */
import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
  id: 'image-uploads',
  name: 'Custom Image Upload',
  icon: 'box',
  description: 'This is image uploads custom interface!',
  component: InterfaceComponent,
  options: null,
  types: ['string'],
});

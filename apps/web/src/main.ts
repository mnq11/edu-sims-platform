import { setDirection } from '@edusims/ui';
import { renderCatalog } from './app.js';
import './styles.css';

// المنصة عربية أولاً — الاتجاه RTL هو الحالة الافتراضية وليس إضافة لاحقة.
setDirection('rtl');

const root = document.querySelector<HTMLElement>('#catalog-app');
if (root) renderCatalog(root);

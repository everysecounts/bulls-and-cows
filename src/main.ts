import './style.css';
import { createApp } from './ui/app';

const root = document.createElement('div');
root.id = 'root';
document.body.append(root);

createApp(root);

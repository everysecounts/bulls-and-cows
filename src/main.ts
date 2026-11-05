import './style.css';

const app = document.createElement('div');
app.className = 'app';

const heading = document.createElement('h1');
heading.textContent = 'Bulls and Cows';

app.append(heading);

document.body.append(app);

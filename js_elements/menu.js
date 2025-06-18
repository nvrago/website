// Define menu items (change icons to SVG or PNGs in /assets/ if you want!)
const menuItems = [
  {
    label: "About Me",
    icon: "🧑",
    link: "about.html"
  },
  {
    label: "Resume/Socials",
    icon: "💼",
    link: "resume.html"
  },
  {
    label: "Projects",
    icon: "🛠️",
    link: "projects.html"
  },
  {
    label: "Academics",
    icon: "📚",
    link: "academics.html"
  }
];

const menuContainer = document.getElementById('menu-container');
menuItems.forEach(item => {
  const cube = document.createElement('div');
  cube.className = 'menu-cube';
  cube.tabIndex = 0; // keyboard accessibility
  cube.innerHTML = `
    <div>${item.icon}</div>
    <div class="menu-cube-label">${item.label}</div>
  `;
  cube.onclick = () => { window.location.href = item.link; };
  cube.onkeyup = e => { if (e.key === "Enter" || e.key === " ") window.location.href = item.link; };
  menuContainer.appendChild(cube);
});

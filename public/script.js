// Function to load projects from server
async function loadProjects() {
  const projectList = document.getElementById('projectList');
  projectList.innerHTML = '<p>Loading projects...</p>';

  try {
    const res = await fetch('/projects');
    const data = await res.json();

    if (data.length === 0) {
      projectList.innerHTML = '<p>No projects uploaded yet.</p>';
      return;
    }

    projectList.innerHTML = '';
    data.forEach((project, index) => {
      const projectItem = document.createElement('div');
      projectItem.classList.add('project-item');
      projectItem.innerHTML = `
        <img src="${project.image}" alt="${project.projectName}" />
        <h3>${project.projectName}</h3>
        <p>${project.description}</p>
        <p><strong>Price:</strong> ₹${project.price}</p>
        <a href="${project.file}" download>📁 Download Project</a>
      `;
      projectList.appendChild(projectItem);
    });
  } catch (error) {
    projectList.innerHTML = '<p>Error loading projects.</p>';
    console.error(error);
  }
}

// Search filter
document.getElementById('searchBar').addEventListener('input', function () {
  const searchValue = this.value.toLowerCase();
  const projects = document.querySelectorAll('.project-item');

  projects.forEach(project => {
    const name = project.querySelector('h3').textContent.toLowerCase();
    project.style.display = name.includes(searchValue) ? 'block' : 'none';
  });
});

// Load projects when page loads
window.onload = loadProjects;

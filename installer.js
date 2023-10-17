const { exec } = require('child_process');

// List of dependencies to install
const dependencies = ['express', 'axios', 'fs'];

// Function to install dependencies
const installDependencies = () => {
  console.log('Installing dependencies...');
  const installCommand = `npm install ${dependencies.join(' ')}`;

  const child = exec(installCommand);

  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('Dependencies installed successfully.');
      startServer();
    } else {
      console.error('Dependency installation failed.');
    }
  });
};

// Function to start the Node.js server
const startServer = () => {
  console.log('Starting Node.js server...');
  const startCommand = 'node server.js';

  const child = exec(startCommand);

  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('Node.js server started successfully.');
    } else {
      console.error('Node.js server failed to start.');
    }
  });
};

installDependencies();

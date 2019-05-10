function checkEnvNotEmpty(variables) {
  if (!variables) {
    throw new Error('Environment variables is empty');
  }

  const keys = Object.keys(variables);

  if (keys.length === 0) {
    throw new Error('Environment keys length 0');
  }

  const empty = [];

  for (let i = 0; i < keys.length; i++) {
    const variable = keys[i];
    const value = variables[variable];

    if (!value) {
      empty.push(variable);
    }
  }

  if (empty.length) {
    throw new Error(`Environment variables must have value: ${empty.join(', ')}`);
  }
}

module.exports = checkEnvNotEmpty;

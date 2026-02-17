import { DockerSandbox } from './DockerSandbox';
import { Sandbox } from './Sandbox';

// Export the interface and class
export * from './Sandbox';
export * from './DockerSandbox';

// Create a singleton instance
const sandboxRunner: Sandbox = new DockerSandbox();

export default sandboxRunner;

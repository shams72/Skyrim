# Architecture Design Record

## Status

Accepted

## Context

Our web application requires a simple, maintainable, and performant architecture to handle basic user interactions. The chosen technologies need to align with modern development practices (DevOps) and the code environment given by our instructors.

## Decision

We selected the following for our web application:

### Tech Stack

1. Node.js as the base for the application:

- Lightweight and efficient due to its non-blocking, event-driven architecture.  
- Large ecosystem of libraries and frameworks to accelerate development.  
- Seamless integration with gRPC and MongoDB.  

2. React for Frontend:

- Component-based architecture enables reusable and maintainable UI development.  
- Virtual DOM improves performance for dynamic web applications.  
- Strong community support and rich ecosystem of tools and libraries.  

3. MongoDB as the Database:

- NoSQL database that offers flexibility to store unstructured data.  
- JSON-like document structure aligns well with the data format used in Node.js.  

4. gRPC for Remote Procedure Call (RPC) API:

- Efficient serialization and communication using Protocol Buffers.  
- Language-neutral interface for seamless code integration.  
- High performance and support for streaming, ideal for low-latency service calls.  

### Debuggers

1. React Developer Tools (Browser Extensions):

- Enables inspection of React components, props, and state directly within the browser (e.g., Chrome/Edge/Firefox).
- Simplifies tracking component hierarchy and debugging React-specific issues.

2. Chrome Developer Tools (for Frontend):

- Provides robust tools for inspecting and debugging HTML, CSS, and JavaScript.
- Includes network analysis and performance profiling for optimizing the frontend.

3. Visual Studio Code Debugger (for Backend and Frontend):

- Integrated debugging capabilities for both JavaScript (Node.js backend) and React (Frontend).
- Supports breakpoints, variable inspection, and step-through debugging.
- Seamlessly integrates with other tools like ESLint for linting and Prettier for formatting.

### Database Migration

We choose to go with the Node tool *migrate-mongo* to support our MongoDB database migration.  
MongoDB technically does not need a dedicated migration setup for schema changes due to its nature as a NoSQL DBMS, however *migrate-mongo* does provide sufficient structuring that can document the schema modification process with its up/down scripts and auto-generated logs.  
We found this to align with our approach towards project management which is to document every important parts of the process, and have thus adopted this approach.  

## Consequences

### Pros:

- Facilitates rapid development with widely adopted technologies.
- Efficient communication with gRPC reduces overhead compared to REST APIs.
- MongoDB ensures flexible schema design and fast prototyping.
- Debugging tools provide deep insights into UI performance/component behavior (Frontend) and single IDE support (VS Code).

### Cons:

- Requires knowledge of multiple tools and frameworks, increasing initial learning curve.
- Switching between debugging tools (e.g. Chrome and VS Code) may slow down workflows initially.




Template used: [Documenting architecture decisions - Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).

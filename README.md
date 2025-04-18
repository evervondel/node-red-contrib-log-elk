# node-red-contrib-log-elk

`node-red-contrib-log-elk` is a Node-RED logging output node that supports multiple logging destinations, including ElasticSearch, Loki (Grafana), local files, the system console, and the Node-RED debug window. This node is designed to provide flexible and configurable logging options for Node-RED flows.

---

## Features

- **ElasticSearch Integration**: Log messages to an ElasticSearch instance with support for authentication.
- **Loki Integration**: Log messages to a Loki instance with support for headers, authentication, and app labels.
- **File Logging**: Log messages to a local file with configurable file size and rotation options.
- **System Console Logging**: Log messages to the system console for debugging and monitoring.
- **Debug Window Logging**: Log messages to the Node-RED debug window for easy access during development.
- **Dynamic Configuration**: Use environment variables to dynamically configure logging options.

---

## Configuration

### Logging Outputs

This node supports the following logging outputs:

1. **ElasticSearch**:
   - **Elastic URL**: The URL of your ElasticSearch instance (e.g., `http://localhost:9200`).
   - **Username**: The username for authentication (if required).
   - **Password**: The password for authentication (if required).

2. **Loki**:
   - **Loki URL**: The URL of your Loki instance (e.g., `http://localhost:3100`).
   - **Username**: The username for authentication (if required).
   - **Password**: The password for authentication (if required).
   - **Headers (JSON)**: Additional headers to include in requests, specified as a JSON object. Example:
     ```json
     {
         "X-Scope-OrgID": "${TENANT}"
     }
     ```
   - **App Label**: A label to identify the application in Loki logs (e.g., `node-red`).

3. **File**:
   - **Filename**: The name of the log file (e.g., `log-elk.log`).
   - **File Size**: The maximum size of the log file in megabytes (minimum: 1 MB).
   - **Max Files**: The maximum number of log files to retain (minimum: 1).

4. **System Console**:
   - Logs messages to the system console for debugging or monitoring.

5. **Debug Window**:
   - Logs messages to the Node-RED debug window for easy access during development.

---

## Environment Variables

You can use environment variables to dynamically configure the logger. For example, instead of hardcoding the ElasticSearch URL or Loki credentials, you can use `${ENV_VAR}` syntax in the fields. At runtime, these placeholders will be replaced with the corresponding environment variable values.

---

## Dependencies

This project uses the following libraries:
- [winston](https://github.com/winstonjs/winston): A versatile logging library for Node.js.
- [winston-elasticsearch](https://github.com/vanthome/winston-elasticsearch): A transport for logging to ElasticSearch.
- [winston-loki](https://github.com/JaniAnttonen/winston-loki): A transport for logging to Loki.

---

## Credits

Initial parts of this project were based on [node-red-contrib-advance-logger](https://github.com/jayathuam/node-red-contrib-advance-logger).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

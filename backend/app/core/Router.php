<?php
/**
 * Simple Router Class
 */
class Router
{
    private $routes = [];

    /**
     * Add route
     */
    public function add($method, $path, $controller, $action)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'controller' => $controller,
            'action' => $action
        ];
    }

    /**
     * Get route
     */
    public function get($path, $controller, $action)
    {
        $this->add('GET', $path, $controller, $action);
    }

    /**
     * Post route
     */
    public function post($path, $controller, $action)
    {
        $this->add('POST', $path, $controller, $action);
    }

    /**
     * Put route
     */
    public function put($path, $controller, $action)
    {
        $this->add('PUT', $path, $controller, $action);
    }

    /**
     * Delete route
     */
    public function delete($path, $controller, $action)
    {
        $this->add('DELETE', $path, $controller, $action);
    }

    /**
     * Dispatch request
     */
    public function dispatch()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path if exists
        $basePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', dirname($_SERVER['SCRIPT_FILENAME']));
        $path = str_replace($basePath, '', $path);
        $path = rtrim($path, '/') ?: '/';

        foreach ($this->routes as $route) {
            $pattern = $this->convertToRegex($route['path']);

            if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                array_shift($matches); // Remove full match

                $controllerClass = $route['controller'];
                $action = $route['action'];

                if (class_exists($controllerClass)) {
                    $controller = new $controllerClass();
                    if (method_exists($controller, $action)) {
                        call_user_func_array([$controller, $action], $matches);
                        return;
                    }
                }
            }
        }

        // 404 Not Found
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
    }

    /**
     * Convert route path to regex
     */
    private function convertToRegex($path)
    {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([a-zA-Z0-9_-]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        return $pattern;
    }
}

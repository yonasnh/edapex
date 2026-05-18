#!/bin/bash

# SchoolApex Canvas LMS Services Manager
# This script manages all Canvas LMS related services including port cleanup and startup

set +e

# Initialize rbenv if available
if command -v rbenv &> /dev/null; then
    eval "$(rbenv init -)"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration (using arrays for compatibility)
SERVICES_NAMES=("demo" "lms-frontend" "lti-service" "lms-api")
SERVICES_PORTS=("3001" "3002" "4001" "4003")
SERVICES_DIRS=("apps/demo" "apps/classapex-lms" "packages/lti-service" "packages/schoolapex-lms")
SERVICES_COMMANDS=("pnpm dev" "pnpm dev" "pnpm dev" "pnpm dev")

# Canvas LMS main application (if running locally)
CANVAS_PORT="3000"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        print_warning "Port $port is in use by $service_name. Attempting to free it..."
        
        # Get the PID(s) using the port
        local pids=$(lsof -ti :$port)
        
        if [ ! -z "$pids" ]; then
            echo "Killing processes: $pids"
            echo $pids | xargs kill -TERM 2>/dev/null || true
            
            # Wait a moment for graceful shutdown
            sleep 2
            
            # Force kill if still running
            if check_port $port; then
                echo "Force killing processes on port $port..."
                echo $pids | xargs kill -KILL 2>/dev/null || true
                sleep 1
            fi
            
            if check_port $port; then
                print_error "Failed to free port $port"
                return 1
            else
                print_success "Port $port freed successfully"
                return 0
            fi
        fi
    else
        print_status "Port $port is already free"
        return 0
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "packages" ] || [ ! -d "apps" ]; then
        print_error "Please run this script from the canvas-modern-ui root directory"
        exit 1
    fi
    
    # Check for required tools
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v pnpm &> /dev/null; then
        missing_tools+=("pnpm")
    fi
    
    if ! command -v lsof &> /dev/null; then
        missing_tools+=("lsof")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    print_status "Installing root dependencies..."
    pnpm install
    
    print_success "Dependencies installed successfully"
}

# Function to clean up all service ports
cleanup_ports() {
    print_header "CLEANING UP PORTS"

    # Kill Canvas LMS if running locally
    if check_port $CANVAS_PORT; then
        kill_port $CANVAS_PORT "Canvas LMS"
    fi

    # Kill all our services
    for i in "${!SERVICES_NAMES[@]}"; do
        local service="${SERVICES_NAMES[$i]}"
        local port="${SERVICES_PORTS[$i]}"
        kill_port $port $service
    done

    print_success "Port cleanup completed"
}

# Function to start a service in the background
start_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local directory=$4

    print_status "Starting $service_name on port $port..."

    # Get absolute paths
    local root_dir=$(pwd)
    local log_file="${root_dir}/logs/${service_name}.log"
    local pid_file="${root_dir}/logs/${service_name}.pid"

    # Create logs directory if it doesn't exist
    mkdir -p "${root_dir}/logs"

    # Start the service in background
    cd "$directory"
    nohup $command > "$log_file" 2>&1 &
    local pid=$!
    cd - > /dev/null

    # Store PID for later reference
    echo $pid > "$pid_file"
    
    # Wait a moment and check if service started successfully
    sleep 3
    
    if kill -0 $pid 2>/dev/null; then
        if check_port $port; then
            print_success "$service_name started successfully (PID: $pid)"
            return 0
        else
            print_warning "$service_name process running but port $port not ready yet..."
            return 0
        fi
    else
        print_error "$service_name failed to start"
        return 1
    fi
}

# Function to start Canvas LMS
start_canvas_lms() {
    print_status "Starting Canvas LMS on port $CANVAS_PORT..."
    local root_dir=$(pwd)
    local canvas_dir="../"  # canvas-lms root relative to canvas-modern-ui
    local log_file="${root_dir}/logs/canvas-lms.log"
    local pid_file="${root_dir}/logs/canvas-lms.pid"

    mkdir -p "${root_dir}/logs"
    cd "$canvas_dir"
    # Install Ruby gems if needed
    bundle check || bundle install
    # Start Rails server in background (daemon mode)
    bundle exec rails server -p $CANVAS_PORT -d >> "$log_file" 2>&1
    # Get the PID of the Rails server
    local pid=$(cat tmp/pids/server.pid 2>/dev/null)
    cd - > /dev/null
    if [ -n "$pid" ]; then
        echo $pid > "$pid_file"
        print_success "Canvas LMS started successfully (PID: $pid)"
    else
        print_error "Failed to start Canvas LMS (no PID found)"
    fi
}

# Function to stop Canvas LMS
stop_canvas_lms() {
    print_status "Stopping Canvas LMS..."
    local root_dir=$(pwd)
    local canvas_dir="../"
    local pid_file="${root_dir}/logs/canvas-lms.pid"
    local pid=""
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
    fi
    if [ -n "$pid" ]; then
        if kill -0 $pid 2>/dev/null; then
            kill -TERM $pid 2>/dev/null || true
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                kill -KILL $pid 2>/dev/null || true
            fi
            print_success "Canvas LMS stopped"
        fi
        rm -f "$pid_file"
    else
        # Fallback: try to kill by Rails PID file
        cd "$canvas_dir"
        if [ -f tmp/pids/server.pid ]; then
            pid=$(cat tmp/pids/server.pid)
            if [ -n "$pid" ]; then
                kill -TERM $pid 2>/dev/null || true
                sleep 2
                if kill -0 $pid 2>/dev/null; then
                    kill -KILL $pid 2>/dev/null || true
                fi
                print_success "Canvas LMS stopped (via tmp/pids/server.pid)"
            fi
            rm -f tmp/pids/server.pid
        fi
        cd - > /dev/null
    fi
}

# Function to start all services
start_services() {
    print_header "STARTING SERVICES"

    # Create logs directory
    mkdir -p logs

    # Start Canvas LMS first
    start_canvas_lms

    # Start services in order
    for i in "${!SERVICES_NAMES[@]}"; do
        local service="${SERVICES_NAMES[$i]}"
        local port="${SERVICES_PORTS[$i]}"
        local directory="${SERVICES_DIRS[$i]}"
        local command="${SERVICES_COMMANDS[$i]}"

        start_service "$service" "$port" "$command" "$directory"
    done

    print_success "All services started successfully"
}

# Function to show service status
show_status() {
    print_header "SERVICE STATUS"

    printf "%-15s %-8s %-10s %-50s\n" "SERVICE" "PORT" "STATUS" "URL"
    printf "%-15s %-8s %-10s %-50s\n" "-------" "----" "------" "---"

    for i in "${!SERVICES_NAMES[@]}"; do
        local service="${SERVICES_NAMES[$i]}"
        local port="${SERVICES_PORTS[$i]}"
        local status="STOPPED"
        local url="N/A"

        if check_port $port; then
            status="${GREEN}RUNNING${NC}"
            case $service in
                "demo")
                    url="http://localhost:$port (SchoolApex Demo)"
                    ;;
                "lms-frontend")
                    url="http://localhost:$port (LMS Frontend)"
                    ;;
                "lti-service")
                    url="http://localhost:$port (LTI Service)"
                    ;;
                "lms-api")
                    url="http://localhost:$port/graphql (GraphQL API)"
                    ;;
            esac
        else
            status="${RED}STOPPED${NC}"
        fi

        printf "%-15s %-8s %-18s %-50s\n" "$service" "$port" "$status" "$url"
    done

    # Check Canvas LMS
    local canvas_status="STOPPED"
    local canvas_url="N/A"
    if check_port $CANVAS_PORT; then
        canvas_status="${GREEN}RUNNING${NC}"
        canvas_url="http://localhost:$CANVAS_PORT (Canvas LMS)"
    else
        canvas_status="${RED}STOPPED${NC}"
    fi
    printf "%-15s %-8s %-18s %-50s\n" "canvas-lms" "$CANVAS_PORT" "$canvas_status" "$canvas_url"
}

# Function to stop all services
stop_services() {
    print_header "STOPPING SERVICES"

    for i in "${!SERVICES_NAMES[@]}"; do
        local service="${SERVICES_NAMES[$i]}"
        local port="${SERVICES_PORTS[$i]}"
        local pid_file="logs/${service}.pid"

        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 $pid 2>/dev/null; then
                print_status "Stopping $service (PID: $pid)..."
                kill -TERM $pid 2>/dev/null || true
                sleep 2
                if kill -0 $pid 2>/dev/null; then
                    kill -KILL $pid 2>/dev/null || true
                fi
                print_success "$service stopped"
            fi
            rm -f "$pid_file"
        fi

        # Also kill any remaining processes on the port
        kill_port $port $service > /dev/null 2>&1 || true
    done

    # Stop Canvas LMS last
    stop_canvas_lms

    print_success "All services stopped"
}

# Function to show logs
show_logs() {
    local service=$1
    local log_file="logs/${service}.log"
    
    if [ -f "$log_file" ]; then
        print_header "LOGS FOR $service"
        tail -f "$log_file"
    else
        print_error "Log file not found for $service"
        print_status "Available log files:"
        ls -la logs/ 2>/dev/null || echo "No log files found"
    fi
}

# Function to show help
show_help() {
    echo "SchoolApex Canvas LMS Services Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services (default)"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  cleanup   - Clean up ports only"
    echo "  logs      - Show logs for all services"
    echo "  logs <service> - Show logs for specific service"
    echo "  help      - Show this help message"
    echo ""
    echo "Services:"
    echo "  demo         - SchoolApex Demo App (port 3001)"
    echo "  lms-frontend - LMS Frontend App (port 3002)"
    echo "  lti-service  - LTI Service (port 4001)"
    echo "  lms-api      - GraphQL LMS API (port 4003)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Start all services"
    echo "  $0 start              # Start all services"
    echo "  $0 status             # Check service status"
    echo "  $0 logs lti-service   # Show LTI service logs"
    echo "  $0 restart            # Restart all services"
}

# Main script logic
main() {
    local command=${1:-start}
    
    case $command in
        "start")
            check_prerequisites
            cleanup_ports
            install_dependencies
            start_services
            echo ""
            show_status
            echo ""
            print_success "All services are running! 🚀"
            print_status "Use '$0 status' to check service status"
            print_status "Use '$0 logs <service>' to view logs"
            print_status "Use '$0 stop' to stop all services"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            print_header "RESTARTING SERVICES"
            stop_services
            sleep 2
            check_prerequisites
            cleanup_ports
            start_services
            echo ""
            show_status
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup_ports
            ;;
        "logs")
            if [ -n "$2" ]; then
                show_logs "$2"
            else
                print_status "Available services: ${SERVICES_NAMES[*]}"
                print_status "Use: $0 logs <service_name>"
            fi
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

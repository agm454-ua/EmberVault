#!/bin/bash
set -euo pipefail

# Config
COMPOSE_BASE="docker compose -f compose.yaml -f tests/compose.test.yaml --env-file tests/.env"

RESULTS_DIR="tests/load/results"
mkdir -p "$RESULTS_DIR"

VALID_PROFILES=("normal" "peak" "sustained")
VALID_SCENARIOS=("auth" "user" "media")


# Helpers 
log()     { echo ""; echo "▶ $1"; }
success() { echo "✅ $1"; }
fail()    { echo "❌ $1"; exit 1; }

# Arg parsing
selected_profiles=()
selected_scenarios=()

validate_arg() {
	local value=$1
	local label=$2
	shift 2; local valid=("$@")

	for v in "${valid[@]}"; do [[ "$v" == "$value" ]] && return; done

	fail "Error: unknown $label '$value'. Valid values: ${valid[*]}" >&2
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		-p) validate_arg "$2" "profile" "${VALID_PROFILES[@]}"; selected_profiles+=("$2"); shift 2;;
		-s) validate_arg "$2" "scenario" "${VALID_SCENARIOS[@]}"; selected_scenarios+=("$2"); shift 2;;
		*) fail "Error: unexprected argument '$1'" >&2;;
	esac
done

[[ ${#selected_profiles[@]} -eq 0 ]] && selected_profiles=("${VALID_PROFILES[@]}")
[[ ${#selected_scenarios[@]} -eq 0 ]] && selected_scenarios=("${VALID_SCENARIOS[@]}")

wait_healthy() {
  	local service=$1
  	local retries=30
  	log "Waiting for $service to be healthy..."
  	for i in $(seq 1 $retries); do
		status=$($COMPOSE_BASE ps --format json "$service" 2>/dev/null | grep -o '"Health":"[^"]*"' | head -1 | cut -d'"' -f4)
		[ "$status" = "healthy" ] && success "$service is healthy" && return 0
		echo "  attempt $i/$retries — current status: ${status:-starting}"
		sleep 5
  	done
  	fail "$service never became healthy"
}

run_scenario() {
	local name=$1
	local profile=$2
	log "Running scenario: $name ($profile)"
	($COMPOSE_BASE --profile testing run --rm \
		-e LOAD_PROFILE="$profile" \
		k6 run \
	    	--out json="/tests/results/${name}-${profile}.json" \
	    	--summary-export="/tests/results/${name}-${profile}-summary.json" \
	    	/tests/scenarios/"${name}".test.js \
	&& success "$name ($profile) passed") \
	|| fail "$name ($profile) failed — check $RESULTS_DIR/${name}-${profile}.json"
}

# Teardown
cleanup() {
	log "Tearing down test environment..."
	$COMPOSE_BASE --profile testing down -v --remove-orphans
	success "Environment torn down"
}
trap cleanup EXIT

# Main
log "Building services..."
$COMPOSE_BASE build auth user media nginx

log "Starting test environment..."
$COMPOSE_BASE up -d postgres redis

wait_healthy postgres
wait_healthy redis

log "Starting application services..."
$COMPOSE_BASE up -d auth user media nginx

wait_healthy auth
wait_healthy user
wait_healthy media
wait_healthy nginx

log "Running k6 load tests..."

for profile in "${selected_profiles[@]}"; do
	for scenario in "${selected_scenarios[@]}"; do
		run_scenario "$scenario" "$profile"
	done
done

success "All load tests passed. Results saved to $RESULTS_DIR/"
package com.pethealth.assistant.health;

import java.time.Instant;
import java.util.Map;

public record SystemHealthResponse(String status, Instant timestamp, Map<String, ComponentHealth> components) {
}
